// M1-13 golden path. Run only against a disposable backend (M1-13 used PostgreSQL 16 in a throwaway
// Docker container) + `next dev`. Real HTTP + real UI; the only route interception is none.
// Every step is recorded PASS/FAIL; the run fails if any step fails.
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const api = process.env.M113_API_BASE || 'http://localhost:8081';
const ui = process.env.M113_UI_BASE || 'http://localhost:3000';
const s = Date.now();
const password = 'M113-test-only!42';
const evidence = '.next/m1-13';
fs.mkdirSync(evidence, { recursive: true });
const results = [];
async function step(name, fn) {
  try { const note = await fn(); results.push({ step: name, result: 'PASS', note: note ?? '' }); console.log(`PASS ${name}${note ? ` — ${note}` : ''}`); }
  catch (e) {
    results.push({ step: name, result: 'FAIL', note: String(e.message).split('\n')[0].slice(0, 300) });
    console.log(`FAIL ${name} — ${String(e.message).split('\n')[0]}`);
    if (shotPage) await shotPage.screenshot({ path: `${evidence}/fail-${results.length}.png`, fullPage: true }).catch(() => {});
  }
}
let shotPage = null;
async function http(method, path, token, body, retried = false) {
  const res = await fetch(api + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  if (res.status === 429 && !retried) { await new Promise(r => setTimeout(r, 61_000)); return http(method, path, token, body, true); } // 120 writes/min/IP
  const text = await res.text();
  let json = null; try { json = JSON.parse(text); } catch { /* csv or empty */ }
  return { status: res.status, json, text };
}
async function ok(method, path, token, body) {
  const r = await http(method, path, token, body);
  assert.equal(r.status, 200, `${method} ${path} -> ${r.status} ${r.text.slice(0, 200)}`);
  return r.json?.data;
}
const num = v => Number(v);
const day = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const allOpen = { days: day.map(d => ({ dayOfWeek: d, closed: false, open24Hours: true, openTime: null, closeTime: null })) };
const allClosed = { days: day.map(d => ({ dayOfWeek: d, closed: true, open24Hours: false, openTime: null, closeTime: null })) };

// ── accounts ────────────────────────────────────────────────────────────────────────────────────
const reg = async (label, merchant) => {
  const email = `m113-${label}-${s}@example.test`;
  const d = await ok('POST', merchant ? '/api/auth/register' : '/api/public/auth/register', null,
    { fullName: `M113 ${label}`, email, password, phone: `+9627900${String(s).slice(-5)}` });
  return { ...d, email, token: d.accessToken };
};
const A = await reg('merchant-a', true);
const B = await reg('merchant-b', true);
const C1 = await reg('customer-1', false);
const C2 = await reg('customer-2', false);

// ── merchant setup (same endpoints the dashboard calls) ─────────────────────────────────────────
const slugA = `m113-grill-${s}`;
const bodyA = { name: 'Golden Grill', slug: slugA, categorySlug: 'general-store', templateKey: 'restaurant-default', currency: 'JOD',
  timezone: 'Asia/Amman', locale: 'en', pickupAvailable: true, freeDeliveryThreshold: 50, whatsappNumber: '+962790001313' };
let storeA, burger, shake, water, zoneA, storeB, zoneB, burgerBOrder;
const ids = {};
await step('Merchant setup: store, currency/timezone/locale, category, products, add-ons, variants, stock, zone, hours, offers, publish', async () => {
  storeA = await ok('POST', '/api/dashboard/stores', A.token, bodyA);
  const cat = await ok('POST', '/api/dashboard/categories', A.token, { storeId: storeA.id, nameEn: 'Mains', slug: 'mains', categoryType: 'PRODUCT', sortOrder: 0, active: true });
  burger = await ok('POST', '/api/dashboard/products', A.token, { storeId: storeA.id, categoryId: cat.id, nameEn: 'Golden Burger', slug: 'golden-burger', price: 5.25, sortOrder: 0, stock: 10 });
  await ok('PUT', `/api/dashboard/products/${burger.id}/modifier-groups`, A.token, { groups: [{ name: 'Extras', minSelect: 0, maxSelect: 2, options: [{ name: 'Cheese', priceDelta: 0.5, preselected: false, available: true }] }] });
  shake = await ok('POST', '/api/dashboard/products', A.token, { storeId: storeA.id, categoryId: cat.id, nameEn: 'Golden Shake', slug: 'golden-shake', price: 3, sortOrder: 1 });
  await ok('PUT', `/api/dashboard/products/${shake.id}/variants`, A.token, { options: [{ name: 'Size', values: [{ label: 'S' }, { label: 'M' }] }],
    variants: [{ selection: ['S'], sku: `SHK-S-${s}`, price: 3, stock: 5, available: true }, { selection: ['M'], sku: `SHK-M-${s}`, price: 3.5, stock: 5, available: true }] });
  water = await ok('POST', '/api/dashboard/products', A.token, { storeId: storeA.id, categoryId: cat.id, nameEn: 'Still Water', slug: 'still-water', price: 1, sortOrder: 2 });
  zoneA = await ok('POST', '/api/dashboard/delivery-zones', A.token, { storeId: storeA.id, name: 'Downtown', areas: ['Abdali'], minOrder: 5, deliveryFee: 2.5, estimatedTime: '30 min', isActive: true, sortOrder: 0 });
  await ok('PUT', `/api/dashboard/stores/${storeA.id}/business-hours`, A.token, allOpen);
  await ok('POST', '/api/dashboard/offers', A.token, { storeId: storeA.id, code: 'GOLD10', discountType: 'PERCENTAGE', discountValue: 10, active: true });
  await ok('POST', '/api/dashboard/offers', A.token, { storeId: storeA.id, code: 'OLD5', discountType: 'FIXED_AMOUNT', discountValue: 5, active: true,
    startsAt: new Date(Date.now() - 3 * 864e5).toISOString(), expiresAt: new Date(Date.now() - 864e5).toISOString() });
  await ok('POST', '/api/dashboard/offers', A.token, { storeId: storeA.id, code: 'BIG20', discountType: 'PERCENTAGE', discountValue: 20, minOrderAmount: 100, active: true });
  await ok('PUT', `/api/dashboard/stores/${storeA.id}`, A.token, { ...bodyA, status: 'ACTIVE' });
  const pub = await ok('GET', `/api/public/stores/${slugA}`, null);
  assert.equal(pub.currency, 'JOD'); assert.equal(pub.timezone, 'Asia/Amman'); assert.equal(pub.locale, 'en');
  const hours = await ok('GET', `/api/public/stores/${slugA}/business-hours`, null);
  assert.equal(hours.status, 'OPEN'); assert.equal(hours.canAcceptOrders, true);
  const vs = await ok('GET', `/api/dashboard/products/${shake.id}/variants`, A.token);
  ids.shakeM = vs.variants.find(v => v.label === 'M').id;
  const mg = await ok('GET', `/api/dashboard/products/${burger.id}/modifier-groups`, A.token);
  ids.cheese = mg[0].options[0].id;
  return `store ${slugA}`;
});
await step('Second merchant store B (isolation fixture)', async () => {
  const bodyB = { name: 'Other Grill', slug: `m113-other-${s}`, categorySlug: 'general-store', templateKey: 'restaurant-default', currency: 'JOD' };
  storeB = await ok('POST', '/api/dashboard/stores', B.token, bodyB);
  const pb = await ok('POST', '/api/dashboard/products', B.token, { storeId: storeB.id, nameEn: 'B Burger', slug: 'b-burger', price: 4, sortOrder: 0 });
  zoneB = await ok('POST', '/api/dashboard/delivery-zones', B.token, { storeId: storeB.id, name: 'B zone', minOrder: 0, deliveryFee: 0.5, isActive: true, sortOrder: 0 });
  await ok('PUT', `/api/dashboard/stores/${storeB.id}`, B.token, { ...bodyB, status: 'ACTIVE' });
  burgerBOrder = await ok('POST', `/api/public/stores/${bodyB.slug}/orders`, null, { customerName: 'B guest', customerPhone: '+962790009999', deliveryMethod: 'DELIVERY', customerAddress: 'x', deliveryZoneId: zoneB.id, paymentMethod: 'CASH', items: [{ productId: pb.id, quantity: 1 }] });
});

const order = (extra, items) => ({ customerName: 'API Buyer', customerPhone: '+962790002222', paymentMethod: 'CASH', deliveryMethod: 'PICKUP', items, ...extra });
const stockOf = async () => (await ok('GET', `/api/dashboard/products/${burger.id}`, A.token)).stock;

// ── business hours × accepting orders ───────────────────────────────────────────────────────────
await step('Acceptance matrix: OPEN+accepting ok, OPEN+paused ORDERS_PAUSED, CLOSED STORE_CLOSED, CLOSED+paused rejected, NOT_CONFIGURED allowed; no stock side effects', async () => {
  const before = await stockOf();
  const place = () => http('POST', `/api/public/stores/${slugA}/orders`, null, order({}, [{ productId: burger.id, quantity: 1 }]));
  await ok('PUT', `/api/dashboard/stores/${storeA.id}/accepting-orders`, A.token, { acceptingOrders: false });
  const paused = await place();
  await ok('PUT', `/api/dashboard/stores/${storeA.id}/business-hours`, A.token, allClosed);
  const closedPaused = await place();
  await ok('PUT', `/api/dashboard/stores/${storeA.id}/accepting-orders`, A.token, { acceptingOrders: true });
  const closed = await place();
  await ok('PUT', `/api/dashboard/stores/${storeA.id}/business-hours`, A.token, allOpen);
  assert.equal(paused.status, 409); assert.equal(paused.json.code, 'ORDERS_PAUSED');
  assert.equal(closed.status, 409); assert.equal(closed.json.code, 'STORE_CLOSED');
  assert.equal(closedPaused.status, 409);
  assert.equal(await stockOf(), before, 'rejected orders must not change stock');
  const nBody = { name: 'Never Configured', slug: `m113-nc-${s}`, categorySlug: 'general-store', templateKey: 'restaurant-default', currency: 'JOD', pickupAvailable: true };
  const n = await ok('POST', '/api/dashboard/stores', A.token, nBody);
  const tea = await ok('POST', '/api/dashboard/products', A.token, { storeId: n.id, nameEn: 'Tea', slug: 'tea', price: 1, sortOrder: 0 });
  await ok('PUT', `/api/dashboard/stores/${n.id}`, A.token, { ...nBody, status: 'ACTIVE' });
  assert.equal((await ok('GET', `/api/public/stores/${nBody.slug}/business-hours`, null)).status, 'NOT_CONFIGURED');
  await ok('POST', `/api/public/stores/${nBody.slug}/orders`, null, order({}, [{ productId: tea.id, quantity: 1 }]));
  return `closed+paused -> ${closedPaused.json.code}`;
});

// ── discounts ───────────────────────────────────────────────────────────────────────────────────
await step('Discounts: valid code backend-calculated; expired, below-minimum and unknown codes rejected', async () => {
  const v = (code, subtotal) => http('POST', `/api/public/stores/${slugA}/offers/validate`, null, { code, subtotal });
  const good = await v('GOLD10', 10);
  assert.equal(good.status, 200); assert.equal(num(good.json.data.amount), 1);
  for (const [code, sub] of [['OLD5', 10], ['BIG20', 10], ['NOPE99', 10]]) assert.notEqual((await v(code, sub)).status, 200, `${code} must be rejected`);
  const rejected = await http('POST', `/api/public/stores/${slugA}/orders`, null, order({ discountCode: 'OLD5' }, [{ productId: water.id, quantity: 10 }]));
  assert.notEqual(rejected.status, 200, 'expired code must not be applied to an order');
  const o = await ok('POST', `/api/public/stores/${slugA}/orders`, null, order({ discountCode: 'GOLD10', discount: 999 }, [{ productId: water.id, quantity: 10 }]));
  assert.equal(num(o.discount), 1); assert.equal(num(o.total), 9);
  return 'GOLD10 on 10.000 -> discount 1.000, total 9.000 (client-sent discount ignored)';
});

// ── delivery / pickup ───────────────────────────────────────────────────────────────────────────
await step('Delivery/pickup: min order, address, foreign zone, forged fee, free threshold, pickup fee 0, pickup disabled', async () => {
  const place = extra => http('POST', `/api/public/stores/${slugA}/orders`, null, order({ deliveryMethod: 'DELIVERY', customerAddress: 'Abdali 1', deliveryZoneId: zoneA.id, ...extra.o }, extra.items));
  assert.notEqual((await place({ items: [{ productId: water.id, quantity: 1 }] })).status, 200, 'below zone minOrder');
  assert.notEqual((await place({ o: { customerAddress: '' }, items: [{ productId: water.id, quantity: 6 }] })).status, 200, 'address required');
  assert.notEqual((await place({ o: { deliveryZoneId: zoneB.id }, items: [{ productId: water.id, quantity: 6 }] })).status, 200, 'other store zone');
  const forged = await place({ o: { deliveryFee: 0 }, items: [{ productId: water.id, quantity: 6 }] });
  const forgedNote = forged.status === 200 ? `accepted with fee ${forged.json.data.deliveryFee}` : `rejected ${forged.status}`;
  if (forged.status === 200) assert.equal(num(forged.json.data.deliveryFee), 2.5, 'forged fee must be corrected');
  const free = await place({ items: [{ productId: water.id, quantity: 50 }] });
  assert.equal(free.status, 200); assert.equal(num(free.json.data.deliveryFee), 0);
  const pickup = await ok('POST', `/api/public/stores/${slugA}/orders`, null, order({ deliveryFee: 7 }, [{ productId: water.id, quantity: 1 }]));
  assert.equal(num(pickup.deliveryFee), 0);
  const noPickup = await http('POST', `/api/public/stores/m113-other-${s}/orders`, null, order({}, [{ productId: water.id, quantity: 1 }]));
  assert.notEqual(noPickup.status, 200, 'store B has pickup disabled');
  return `forged fee: ${forgedNote}; free delivery at 50.000; pickup fee 0`;
});

// ── inventory ───────────────────────────────────────────────────────────────────────────────────
await step('Inventory: order decrements once, out-of-stock and invalid product rejected without side effects, cancel restores', async () => {
  const before = await stockOf();
  const o = await ok('POST', `/api/public/stores/${slugA}/orders`, null, order({}, [{ productId: burger.id, quantity: 2 }]));
  assert.equal(await stockOf(), before - 2);
  for (const st of ['CONFIRMED', 'PREPARING', 'READY']) await ok('PUT', `/api/dashboard/orders/${o.id}/status`, A.token, { status: st });
  assert.equal(await stockOf(), before - 2, 'lifecycle must not decrement again');
  const tooMany = await http('POST', `/api/public/stores/${slugA}/orders`, null, order({}, [{ productId: burger.id, quantity: 999 }]));
  assert.notEqual(tooMany.status, 200);
  const bogus = await http('POST', `/api/public/stores/${slugA}/orders`, null, order({}, [{ productId: '00000000-0000-0000-0000-000000000000', quantity: 1 }]));
  assert.notEqual(bogus.status, 200);
  assert.equal(await stockOf(), before - 2, 'rejected orders must not change stock');
  await ok('PUT', `/api/dashboard/orders/${o.id}/status`, A.token, { status: 'CANCELLED' });
  const after = await stockOf();
  assert.equal(after, before, 'cancel restores stock (current semantics)');
  const vBefore = (await ok('GET', `/api/dashboard/products/${shake.id}/variants`, A.token)).variants.find(v => v.id === ids.shakeM).stock;
  await ok('POST', `/api/public/stores/${slugA}/orders`, null, order({}, [{ productId: shake.id, variantId: ids.shakeM, quantity: 1 }]));
  const vAfter = (await ok('GET', `/api/dashboard/products/${shake.id}/variants`, A.token)).variants.find(v => v.id === ids.shakeM).stock;
  assert.equal(vAfter, vBefore - 1, 'variant stock decrements');
  return `burger ${before}->${before - 2}->(lifecycle) ${before - 2}->(out-of-stock/invalid rejected) ${before - 2}->(cancel) ${after}; out-of-stock status ${tooMany.status}, invalid product ${bogus.status}`;
});

// ── tenant isolation ────────────────────────────────────────────────────────────────────────────
await step('Multi-tenant: A cannot edit B store, read B orders, use B zone, read B reports, change B theme/settings; customer cannot use dashboard', async () => {
  const range = `from=${new Date(Date.now() - 864e5).toISOString().slice(0, 10)}&to=${new Date(Date.now() + 864e5).toISOString().slice(0, 10)}`;
  const checks = [
    await http('PUT', `/api/dashboard/stores/${storeB.id}`, A.token, { name: 'Hijack', slug: `m113-other-${s}`, categorySlug: 'general-store' }),
    await http('PUT', `/api/dashboard/stores/${storeB.id}/accepting-orders`, A.token, { acceptingOrders: false }),
    await http('PUT', `/api/dashboard/stores/${storeB.id}/business-hours`, A.token, allClosed),
    await http('GET', `/api/dashboard/orders/${burgerBOrder.id}`, A.token),
    await http('PUT', `/api/dashboard/orders/${burgerBOrder.id}/status`, A.token, { status: 'CANCELLED' }),
    await http('PUT', `/api/dashboard/delivery-zones/${zoneB.id}`, A.token, { storeId: storeB.id, name: 'x', deliveryFee: 0 }),
    await http('GET', `/api/dashboard/analytics/daily-store-sales?storeId=${storeB.id}&${range}`, A.token),
    await http('GET', `/api/dashboard/analytics/orders.csv?storeId=${storeB.id}&${range}`, A.token),
    await http('PUT', `/api/dashboard/theme-content`, A.token, { storeId: storeB.id, content: { heroTitle: 'x' } }),
    await http('GET', `/api/dashboard/customers?storeId=${storeB.id}`, A.token),
  ];
  const statuses = checks.map(c => c.status);
  assert(statuses.every(st => st === 403), `expected all 403, got ${statuses}`);
  const customerOnDashboard = (await http('GET', `/api/dashboard/orders`, C1.token)).status;
  assert([401, 403].includes(customerOnDashboard), `customer token on dashboard API -> ${customerOnDashboard}`);
  assert.equal((await ok('GET', `/api/public/stores/m113-other-${s}`, null)).name, 'Other Grill', 'store B unchanged');
  return `10 cross-store calls -> ${[...new Set(statuses)]}`;
});

// ── browser ─────────────────────────────────────────────────────────────────────────────────────
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
shotPage = page;
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(e.message.split('\n')[0]));
let guestCode, authCode;

async function merchantLogin(acct) {
  await page.goto(ui + '/login'); await page.evaluate(() => localStorage.clear()); await page.goto(ui + '/login');
  await page.getByPlaceholder('you@example.com or +60 12-345 6789').fill(acct.email);
  await page.getByPlaceholder('••••••••').fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForFunction(() => !!localStorage.getItem('sl_access_token'), null, { timeout: 30000 });
}

await step('Public storefront: correct template, real content, JOD prices, live hours, fulfillment options, no demo content', async () => {
  await page.goto(`${ui}/store/${slugA}`);
  await page.waitForSelector('[data-storefront-template="restaurant-default"]', { state: 'attached', timeout: 90000 });
  await expect(page.getByText('Golden Burger').first()).toBeVisible();
  await expect(page.getByText('JOD 5.250').first()).toBeVisible();
  const text = await page.innerText('body');
  assert(/Open now/.test(text), 'live OPEN status shown');
  assert(!/\$\s?\d|4\.9|Top Rated|Reserve a Table/.test(text), 'no fake price/rating/reservation');
  const wa = await page.$$eval('a[href*="wa.me"]', as => as.map(a => a.href));
  assert(wa.length > 0 && wa.every(h => h.includes('962790001313')), `WhatsApp uses the store number: ${wa}`);
  await page.screenshot({ path: `${evidence}/storefront.png`, fullPage: true });
});

await step('Guest checkout (UI): add-on, cart, delivery zone, discount, real order + tracking code; public lookup', async () => {
  await page.getByRole('button', { name: 'Add Golden Burger' }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByText('Cheese', { exact: true }).click();
  await dialog.getByRole('button', { name: /^Add ·/ }).click();
  await page.getByText('View Cart').click();
  const drawer = page.getByRole('dialog', { name: 'Your Order' });
  await drawer.getByLabel('Delivery', { exact: true }).selectOption('DELIVERY');
  await drawer.getByLabel('Delivery zone').selectOption({ index: 1 });
  await drawer.getByLabel('Full name').fill('Guest Golden');
  await drawer.getByLabel('Phone').fill('+962790003333');
  await drawer.getByLabel('Email').fill(C1.email); // same email as a registered customer: must still NOT attach
  await drawer.getByLabel('Delivery address').fill('Abdali Boulevard 7');
  await drawer.getByLabel('Discount code (optional)').fill('GOLD10');
  await drawer.getByRole('button', { name: /Apply/ }).click();
  await expect(drawer.getByText(/GOLD10.*applied/)).toBeVisible();
  const [res] = await Promise.all([
    page.waitForResponse(r => r.url().endsWith(`/stores/${slugA}/orders`) && r.request().method() === 'POST'),
    drawer.getByRole('button', { name: 'Place Order' }).click(),
  ]);
  const body = await res.json();
  assert.equal(res.status(), 200, JSON.stringify(body));
  guestCode = body.data.orderCode;
  await expect(page.getByRole('dialog', { name: 'Order placed!' }).getByText(guestCode)).toBeVisible();
  // 5.250 + 0.500 add-on = 5.750; 10% = 0.575; zone fee 2.500 -> 7.675 (all server-calculated)
  assert.equal(num(body.data.subtotal), 5.75); assert.equal(num(body.data.discount), 0.575);
  assert.equal(num(body.data.deliveryFee), 2.5); assert.equal(num(body.data.total), 7.675);
  assert.equal(body.data.currency, 'JOD'); assert.equal(body.data.deliveryMethod, 'DELIVERY');
  ids.guestOrder = body.data.id;
  const lookup = await ok('POST', `/api/public/stores/${slugA}/orders/lookup`, null, { orderCode: guestCode, phone: '+962790003333' });
  assert.equal(lookup.orderCode, guestCode);
  assert.notEqual((await http('POST', `/api/public/stores/${slugA}/orders/lookup`, null, { orderCode: guestCode, phone: '+962790000000' })).status, 200, 'wrong phone must not find it');
  await page.screenshot({ path: `${evidence}/guest-order.png` });
  return `order ${guestCode} total JOD 7.675`;
});

await step('Accepting orders toggled in merchant UI: storefront checkout shows paused and blocks; persists across reload', async () => {
  await merchantLogin(A);
  await page.goto(`${ui}/dashboard/${slugA}/store-settings`);
  const sw = page.getByRole('switch', { name: 'Toggle store open/closed' });
  await expect(sw).toHaveAttribute('aria-checked', 'true', { timeout: 30000 });
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'false');
  await page.reload();
  await expect(page.getByRole('switch', { name: 'Toggle store open/closed' })).toHaveAttribute('aria-checked', 'false', { timeout: 30000 });
  assert.equal((await ok('GET', `/api/public/stores/${slugA}/business-hours`, null)).canAcceptOrders, false);
  const shopper = await ctx.newPage();
  await shopper.goto(`${ui}/store/${slugA}`);
  await shopper.getByRole('button', { name: 'Add Still Water' }).first().click();
  await shopper.getByText('View Cart').click();
  await expect(shopper.getByText('Online ordering is temporarily paused.')).toBeVisible();
  await expect(shopper.getByRole('button', { name: 'Ordering unavailable' })).toBeDisabled();
  await shopper.close();
  await page.getByRole('switch', { name: 'Toggle store open/closed' }).click();
  await expect(page.getByRole('switch', { name: 'Toggle store open/closed' })).toHaveAttribute('aria-checked', 'true');
  assert.equal((await ok('GET', `/api/public/stores/${slugA}/business-hours`, null)).canAcceptOrders, true);
});

await step('Store settings persist across reload (currency, timezone)', async () => {
  await page.reload();
  await expect(page.getByLabel('Currency')).toHaveValue('JOD', { timeout: 30000 });
  await expect(page.getByLabel('Timezone')).toHaveValue('Asia/Amman');
});

await step('Merchant order lifecycle (UI): sees guest order, NEW -> CONFIRMED -> PREPARING -> READY -> DELIVERED; stock unchanged; persists', async () => {
  assert(guestCode, 'needs the guest order from the previous step');
  const before = await stockOf();
  await page.goto(`${ui}/dashboard/${slugA}/orders`);
  await page.getByRole('cell', { name: guestCode }).click();
  const panel = page.getByRole('complementary', { name: 'Order detail' }).or(page.locator('[aria-label="Order detail"]'));
  for (const [label, status] of [['Confirm Order', 'CONFIRMED'], ['Start Preparing', 'PREPARING'], ['Mark Ready', 'READY'], ['Mark Delivered', 'DELIVERED']]) {
    await panel.getByRole('button', { name: label }).click();
    await expect.poll(async () => (await ok('GET', `/api/dashboard/orders/${ids.guestOrder}`, A.token)).status, { timeout: 15000 }).toBe(status);
  }
  assert.equal(await stockOf(), before);
  await page.reload();
  await page.getByRole('cell', { name: guestCode }).click();
  await expect(page.locator('[aria-label="Order detail"]').getByText(/Delivered/i).first()).toBeVisible();
  await page.screenshot({ path: `${evidence}/merchant-order.png` });
});

await step('Authenticated checkout (UI): variant, pickup, order in history with snapshots; guest order not attached', async () => {
  assert(guestCode, 'needs the guest order from the previous step');
  await page.goto(`${ui}/customer/login?redirect=${encodeURIComponent(`/store/${slugA}`)}`);
  await page.locator('input[type=email]').fill(C1.email);
  await page.locator('input[type=password]').fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL(`**/store/${slugA}`, { timeout: 30000 });
  await page.getByRole('button', { name: 'Add Golden Shake' }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'M', exact: true }).click();
  await dialog.getByRole('button', { name: /^Add ·/ }).click();
  await page.getByText('View Cart').click();
  const drawer = page.getByRole('dialog', { name: 'Your Order' });
  await drawer.getByLabel('Delivery', { exact: true }).selectOption('PICKUP');
  await drawer.getByLabel('Phone').fill('+962790004444');
  const [res] = await Promise.all([
    page.waitForResponse(r => r.url().endsWith(`/stores/${slugA}/orders`) && r.request().method() === 'POST'),
    drawer.getByRole('button', { name: 'Place Order' }).click(),
  ]);
  const body = await res.json();
  assert.equal(res.status(), 200, JSON.stringify(body));
  authCode = body.data.orderCode;
  assert.equal(num(body.data.total), 3.5); assert.equal(num(body.data.deliveryFee), 0); assert.equal(body.data.deliveryMethod, 'PICKUP');
  await page.goto(`${ui}/customer/account`);
  await expect(page.getByRole('heading', { name: authCode, exact: true })).toBeVisible({ timeout: 30000 });
  await expect(page.getByText(guestCode)).toHaveCount(0);
  await page.getByRole('button', { name: `View order ${authCode}` }).click();
  const detail = page.getByRole('region', { name: 'Order detail' });
  await expect(detail.getByText('Pickup', { exact: true })).toBeVisible();
  await expect(detail.getByText('3.500 JOD').first()).toBeVisible();
  const mine = await ok('GET', '/api/public/customers/me/orders', C1.token);
  assert(mine.some(o => o.orderCode === authCode) && !mine.some(o => o.orderCode === guestCode));
  const other = await ok('GET', '/api/public/customers/me/orders', C2.token);
  assert(!other.some(o => o.orderCode === authCode), 'customer 2 must not see it');
  assert.notEqual((await http('GET', `/api/public/customers/me/orders/${body.data.id}`, C2.token)).status, 200);
  await page.screenshot({ path: `${evidence}/history.png`, fullPage: true });
  return `order ${authCode}`;
});

await step('Customer profile: update name, persists after reload and logout/login; email/phone read-only', async () => {
  const name = page.getByLabel('Name', { exact: true });
  await name.fill(`Golden Customer ${s}`);
  await page.getByRole('button', { name: /Save/ }).click();
  await expect.poll(async () => (await ok('GET', '/api/public/customers/me', C1.token)).fullName).toBe(`Golden Customer ${s}`);
  await page.reload();
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue(`Golden Customer ${s}`, { timeout: 30000 });
  await expect(page.locator('form input')).toHaveCount(1);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.goto(`${ui}/customer/login?redirect=/customer/account`);
  await page.locator('input[type=email]').fill(C1.email);
  await page.locator('input[type=password]').fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue(`Golden Customer ${s}`, { timeout: 30000 });
});

await step('Street-food template checkout (own checkout path, UI guest pickup)', async () => {
  await new Promise(r => setTimeout(r, 301_000)); // public order limit is 20 per 300 s per IP: let the earlier steps' window pass
  const b = { name: 'Pop Stand', slug: `m113-pop-${s}`, categorySlug: 'general-store', templateKey: 'street-food-pop', currency: 'JOD', pickupAvailable: true };
  const st = await ok('POST', '/api/dashboard/stores', A.token, b);
  await ok('POST', '/api/dashboard/products', A.token, { storeId: st.id, nameEn: 'Pop Fries', slug: 'pop-fries', price: 2, sortOrder: 0 });
  await ok('PUT', `/api/dashboard/stores/${st.id}`, A.token, { ...b, status: 'ACTIVE' });
  const p = await ctx.newPage();
  await p.goto(`${ui}/store/${b.slug}`);
  await p.waitForSelector('[data-storefront-template="street-food-pop"]', { state: 'attached', timeout: 90000 });
  await p.getByRole('button', { name: 'Add Pop Fries' }).first().click();
  await p.getByRole('button', { name: /View cart/ }).click();
  await p.getByPlaceholder('Full name').fill('Pop Guest');
  await p.getByPlaceholder('Phone').fill('+962790005555');
  const [res] = await Promise.all([
    p.waitForResponse(r => r.url().endsWith(`/stores/${b.slug}/orders`) && r.request().method() === 'POST'),
    p.getByRole('button', { name: 'PLACE ORDER' }).click(),
  ]);
  const body = await res.json();
  assert.equal(res.status(), 200, JSON.stringify(body));
  assert.equal(body.data.deliveryMethod, 'PICKUP'); assert.equal(num(body.data.total), 2);
  await expect(p.getByText(body.data.orderCode).first()).toBeVisible();
  await p.close();
  return body.data.orderCode;
});

await step('Service/appointment template: signed-in customer books a real slot; merchant sees it', async () => {
  const b = { name: 'Calm Studio', slug: `m113-calm-${s}`, categorySlug: 'general-store', templateKey: 'services-hub', currency: 'JOD' };
  const st = await ok('POST', '/api/dashboard/stores', A.token, b);
  await ok('POST', '/api/dashboard/products', A.token, { storeId: st.id, nameEn: 'Deep Tissue Massage', slug: 'massage', price: 25, sortOrder: 0 });
  const start = new Date(Date.now() + 2 * 864e5); start.setUTCHours(10, 0, 0, 0);
  await ok('POST', '/api/dashboard/appointment-slots', A.token, { storeId: st.id, startsAt: start.toISOString(), endsAt: new Date(start.getTime() + 36e5).toISOString(), capacity: 2, active: true });
  await ok('PUT', `/api/dashboard/stores/${st.id}`, A.token, { ...b, status: 'ACTIVE' });
  await page.goto(`${ui}/store/${b.slug}`);
  await page.waitForSelector('[data-storefront-template="services-hub"]', { state: 'attached', timeout: 90000 });
  await page.getByRole('button', { name: 'Book Deep Tissue Massage' }).click();
  await page.getByLabel('Select an appointment time').selectOption({ index: 1 });
  await page.getByPlaceholder('Your name').fill('Golden Customer');
  await page.getByPlaceholder('Phone').fill('+962790006666');
  const [res] = await Promise.all([
    page.waitForResponse(r => r.url().endsWith(`/stores/${b.slug}/appointments`) && r.request().method() === 'POST'),
    page.getByRole('button', { name: 'Book This Appointment' }).click(),
  ]);
  assert.equal(res.status(), 200);
  await expect(page.getByText('Booking booked!')).toBeVisible();
  const appts = await ok('GET', `/api/dashboard/appointments?storeId=${st.id}`, A.token);
  assert.equal(appts.length, 1); assert.equal(appts[0].productName, 'Deep Tissue Massage'); assert.equal(appts[0].status, 'CONFIRMED');
  await page.screenshot({ path: `${evidence}/booking.png` });
  return 'appointment CONFIRMED';
});

await step('Real-estate/contact template: listings render, WhatsApp enquiry with the store number, no cart/checkout', async () => {
  const b = { name: 'Harbor Homes', slug: `m113-homes-${s}`, categorySlug: 'general-store', templateKey: 'real-estate-agency', currency: 'JOD', whatsappNumber: '+962790007777' };
  const st = await ok('POST', '/api/dashboard/stores', A.token, b);
  await ok('POST', '/api/dashboard/products', A.token, { storeId: st.id, nameEn: 'Sea View Villa', slug: 'villa', description: '4 bed 3 bath', price: 250000, sortOrder: 0 });
  await ok('PUT', `/api/dashboard/stores/${st.id}`, A.token, { ...b, status: 'ACTIVE' });
  const p = await ctx.newPage();
  await p.goto(`${ui}/store/${b.slug}`);
  await p.waitForSelector('[data-storefront-template="real-estate-agency"]', { state: 'attached', timeout: 90000 });
  await expect(p.getByText('Sea View Villa').first()).toBeVisible();
  await expect(p.getByText('JOD 250K').first()).toBeVisible();
  const wa = await p.$$eval('a[href*="wa.me"]', as => as.map(a => a.href));
  assert(wa.length > 0 && wa.every(h => h.includes('962790007777')));
  assert(wa.some(h => decodeURIComponent(h).includes('Sea View Villa')), 'listing enquiry is prefilled');
  assert.equal(await p.getByText(/add to cart|checkout/i).count(), 0);
  await p.close();
});

await step('Reports on PostgreSQL: daily-store-sales/top-products with rows, UI cards (no interception), CSV totals match', async () => {
  const to = new Date().toISOString().slice(0, 10);
  const fromD = new Date(); fromD.setDate(fromD.getDate() - 6); const from = fromD.toISOString().slice(0, 10);
  const daily = await ok('GET', `/api/dashboard/analytics/daily-store-sales?storeId=${storeA.id}&from=${from}&to=${to}`, A.token);
  const top = await ok('GET', `/api/dashboard/analytics/top-products?storeId=${storeA.id}&from=${from}&to=${to}`, A.token);
  assert(daily.length >= 1 && top.length >= 1, 'native report queries return rows on PostgreSQL');
  const revenue = daily.reduce((t, r) => t + num(r.totalRevenue), 0);
  const count = daily.reduce((t, r) => t + num(r.orderCount), 0);
  const csvRes = await fetch(`${api}/api/dashboard/analytics/orders.csv?storeId=${storeA.id}&from=${from}&to=${to}`, { headers: { Authorization: `Bearer ${A.token}` } });
  const rows = new TextDecoder('utf-8', { ignoreBOM: true }).decode(await csvRes.arrayBuffer()).slice(1).trim().split('\r\n').slice(1);
  const csvTotal = rows.reduce((t, r) => t + num(r.match(/"([^"]*)","[^"]*"$/)[1]), 0);
  assert.equal(rows.length, count, 'CSV rows = report order count');
  assert(Math.abs(csvTotal - revenue) < 0.0005, `CSV total ${csvTotal} = report revenue ${revenue}`);
  await merchantLogin(A);
  await page.goto(`${ui}/dashboard/${slugA}/reports`);
  const shown = new Intl.NumberFormat('en').format(revenue);
  await expect(page.getByText(shown, { exact: true }).first()).toBeVisible({ timeout: 30000 });
  await expect(page.getByText(String(count), { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Couldn't load reports")).toHaveCount(0);
  await expect(page.getByText('Golden Burger').first()).toBeVisible();
  await page.screenshot({ path: `${evidence}/reports-postgres.png`, fullPage: true });
  return `revenue ${revenue.toFixed(3)} over ${count} orders; top product ${top[0].name}`;
});

await step('Error states: unknown store slug shows not-found (no demo store)', async () => {
  const res = await page.goto(`${ui}/store/m113-does-not-exist-${s}`);
  assert.equal(res.status(), 404);
  assert.equal(await page.locator('[data-storefront-template]').count(), 0);
});

assert.deepEqual(pageErrors.filter(e => !/Hydration failed/.test(e)), [], `runtime errors: ${pageErrors}`);
await browser.close();
fs.writeFileSync(`${evidence}/results.json`, JSON.stringify(results, null, 2));
console.table(results.map(r => ({ step: r.step.slice(0, 70), result: r.result })));
const failed = results.filter(r => r.result === 'FAIL');
assert.equal(failed.length, 0, `${failed.length} step(s) failed`);
console.log('M1-13 golden path PASS');
