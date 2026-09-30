// POS-26 dashboard check: the Restaurant Setup page in a real browser against the disposable backend the
// restaurant golden path used (run after its "dine" phase, so T2 has a settled order):
//   node restaurant-setup-check.mjs <seed.json> http://localhost:13000 <screenshot.png>
// Mode switch, add an area and a table, a duplicate table name refused, reorder, deactivate, table
// history — each change checked on the server afterwards, not only on screen.
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const [seedPath, ui = 'http://localhost:13000', shot = 'restaurant-setup.png'] = process.argv.slice(2);
const seed = JSON.parse(readFileSync(seedPath, 'utf8'));
if (!/^http:\/\/(localhost|127\.0\.0\.1):/.test(seed.api)) throw new Error('Disposable localhost backend only');
const assert = (cond, msg) => { if (!cond) throw new Error('CHECK FAILED: ' + msg); console.log('  ok  ' + msg); };

const login = await (await fetch(seed.api + '/api/auth/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: seed.merchantEmail, password: seed.merchantPassword }),
})).json();
const token = login.data.accessToken;
const get = async (path) => (await (await fetch(seed.api + path, { headers: { Authorization: `Bearer ${token}` } })).json()).data;
const stores = await get('/api/dashboard/stores/my');
const slug = stores.find(s => s.id === seed.store).slug;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(ui + '/login');
await page.waitForLoadState('networkidle');
await page.locator('form input[type=text]').first().fill(seed.merchantEmail);
await page.locator('input[type=password]').fill(seed.merchantPassword);
await Promise.all([
  page.waitForResponse(r => r.url().endsWith('/api/auth/login') && r.request().method() === 'POST'),
  page.locator('button[type=submit]').click(),
]);
await page.waitForURL(u => new URL(u).pathname.startsWith('/dashboard'), { timeout: 30000 });

// The sidebar offers Restaurant Setup for this store.
await page.goto(`${ui}/dashboard/${slug}`);
await page.waitForLoadState('networkidle');
assert(await page.getByRole('link', { name: 'Restaurant Setup' }).count() > 0, 'sidebar shows "Restaurant Setup"');
await page.goto(`${ui}/dashboard/${slug}/restaurant`);
await page.waitForLoadState('networkidle');
await page.getByRole('heading', { name: 'Restaurant POS mode' }).waitFor({ timeout: 30000 });
assert(await page.getByText('Restaurant mode on').count() === 1, 'restaurant mode is on from the business type (restaurants & cafés)');
const areas = page.getByRole('region', { name: 'Areas' });
const tables = page.getByRole('region', { name: /^Tables/ });
assert(await areas.getByText('Main Hall', { exact: true }).count() === 1, 'area Main Hall listed');
assert(await tables.getByText('T1', { exact: true }).count() === 1 && await tables.getByText('T2', { exact: true }).count() === 1, 'tables T1 and T2 listed');

// Mode: Off, then back to the business type — saved on the server each time.
await page.getByRole('radio', { name: /^Off/ }).click();
await page.getByText('Restaurant mode off').waitFor();
assert((await get(`/api/dashboard/restaurant/settings?storeId=${seed.store}`)).effective === false, 'mode Off saved on the server');
await page.getByRole('radio', { name: /^Follow business type/ }).click();
await page.getByText('Restaurant mode on').waitFor();
const settings = await get(`/api/dashboard/restaurant/settings?storeId=${seed.store}`);
assert(settings.effective === true && settings.restaurantMode == null, 'back to "follow business type" (on) on the server');

// Add an area "Terrace" and a table "VIP-1" seating 8 in it.
await areas.getByRole('button', { name: 'Add area' }).click();
await page.getByLabel('Area name').fill('Terrace');
await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
await areas.getByText('Terrace', { exact: true }).waitFor();
await tables.getByRole('button', { name: 'Add table' }).click();
await page.getByLabel('Table name or number').fill('VIP-1');
await page.getByLabel('Seats (optional)').fill('8');
await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
await tables.getByText('VIP-1', { exact: true }).waitFor();
let serverTables = await get(`/api/dashboard/restaurant/tables?storeId=${seed.store}`);
const serverAreas = await get(`/api/dashboard/restaurant/areas?storeId=${seed.store}`);
const vip = serverTables.find(t => t.name === 'VIP-1');
assert(vip && vip.capacity === 8 && vip.areaId === serverAreas.find(a => a.name === 'Terrace').id, 'VIP-1 (8 seats) saved in Terrace');

// A second active "t1" is refused with the server's message; nothing saved.
await areas.getByRole('button', { name: /Main Hall/ }).first().click();
await tables.getByRole('button', { name: 'Add table' }).click();
await page.getByLabel('Table name or number').fill('t1');
await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
await page.getByRole('dialog').getByRole('alert').waitFor();
const refusal = await page.getByRole('dialog').getByRole('alert').innerText();
assert(/already called/.test(refusal), `duplicate name refused: "${refusal.trim()}"`);
await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
serverTables = await get(`/api/dashboard/restaurant/tables?storeId=${seed.store}`);
assert(serverTables.filter(t => t.name.toLowerCase() === 't1').length === 1, 'still one T1 on the server');

// Reorder: T2 before T1.
await tables.getByRole('button', { name: 'Move T2 earlier' }).click();
await page.waitForTimeout(800);
serverTables = await get(`/api/dashboard/restaurant/tables?storeId=${seed.store}`);
const t1 = serverTables.find(t => t.name === 'T1'), t2 = serverTables.find(t => t.name === 'T2');
assert(t2.sortOrder < t1.sortOrder, `T2 now before T1 on the server (${t2.sortOrder} < ${t1.sortOrder})`);

// Table history of T2: the settled dine-in order of the golden path.
await tables.getByRole('button', { name: 'History of T2' }).click();
const history = page.getByRole('dialog');
await history.getByText('Settled').first().waitFor({ timeout: 15000 });
assert(await history.getByText('Dine-in', { exact: false }).count() > 0, 'T2 history shows its settled dine-in order');
await page.screenshot({ path: shot.replace(/\.png$/, '-history.png') });
await page.keyboard.press('Escape');

// Deactivate VIP-1 (no open order): hidden on the tills, kept on the server.
await areas.getByRole('button', { name: /Terrace/ }).first().click();
await tables.locator('li').filter({ hasText: 'VIP-1' }).getByRole('button', { name: 'Deactivate' }).click();
await page.waitForTimeout(800);
serverTables = await get(`/api/dashboard/restaurant/tables?storeId=${seed.store}`);
assert(serverTables.find(t => t.name === 'VIP-1').active === false, 'VIP-1 deactivated on the server (not deleted)');

await page.getByLabel('Show deactivated').check();
await tables.getByText('VIP-1', { exact: true }).waitFor();
await page.screenshot({ path: shot, fullPage: true });
await browser.close();
console.log('RESTAURANT SETUP CHECK PASS');
