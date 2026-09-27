// POS-09/11 dashboard check: a merchant sees synced POS sales (POS badge, receipt) and the POS sync
// conflicts panel on the Orders page, and can mark a conflict reviewed. Run after the POS sales
// golden path against the same disposable backend:
//   node pos-dashboard-check.mjs <seed.json> http://localhost:3000 <screenshot.png>
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const [seedPath, ui = 'http://localhost:3000', shot = 'pos-dashboard.png'] = process.argv.slice(2);
const seed = JSON.parse(readFileSync(seedPath, 'utf8'));
if (!/^http:\/\/(localhost|127\.0\.0\.1):/.test(seed.api)) throw new Error('Disposable localhost backend only');

const login = await (await fetch(seed.api + '/api/auth/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: seed.merchantEmail, password: seed.merchantPassword }),
})).json();
const token = login.data.accessToken;
const stores = await (await fetch(seed.api + '/api/dashboard/stores/my', { headers: { Authorization: `Bearer ${token}` } })).json();
const slug = stores.data.find(s => s.id === seed.storeA).slug;

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
await page.goto(`${ui}/dashboard/${slug}/orders`);
await page.waitForLoadState('networkidle');

const panel = page.getByRole('region', { name: 'POS sync conflicts' });
await panel.waitFor({ timeout: 30000 });
const heading = (await panel.locator('button').first().innerText()).split('\n')[0];
const badges = await page.locator('table').getByText('POS', { exact: true }).count();
const oversold = await panel.getByText('Sold beyond stock').count();
const priceChanged = await panel.getByText('Price changed after sale').count();
const deleted = await panel.getByText('Product deleted').count();
await page.screenshot({ path: shot, fullPage: true });
console.log(`panel: "${heading}"; POS badges in the orders table: ${badges}; oversold ${oversold}, price ${priceChanged}, deleted ${deleted}`);
if (!heading.startsWith('3 POS sales need review') || badges < 5 || oversold !== 1 || priceChanged !== 1 || deleted !== 1) {
  throw new Error('dashboard check FAILED');
}

// Open a synced POS order: the detail shows the POS receipt.
await page.locator('table tbody tr').filter({ hasText: 'POS' }).first().click();
const detail = page.getByRole('complementary', { name: 'Order detail' });
await detail.waitFor();
const receipt = await detail.getByText(/POS receipt POS/).innerText();
console.log(`order detail: ${receipt.trim()}`);
await detail.getByRole('button', { name: 'Close order detail' }).click();

// Mark the oversold conflict reviewed; the panel shrinks and the server agrees.
const oversoldRow = panel.locator('li').filter({ hasText: 'Sold beyond stock' });
await oversoldRow.getByRole('button', { name: 'Mark reviewed' }).click();
await panel.getByText('2 POS sales need review').waitFor({ timeout: 15000 });
const open = await (await fetch(`${seed.api}/api/dashboard/pos-sync/conflicts?storeId=${seed.storeA}&status=OPEN`, {
  headers: { Authorization: `Bearer ${token}` },
})).json();
console.log(`after "Mark reviewed": panel shows 2, server open conflicts = ${open.data.open}`);
if (open.data.open !== 2) throw new Error('dashboard check FAILED');
await browser.close();
console.log('POS DASHBOARD CHECK PASS');
