// M1-11 Reports CSV / placeholder cleanup. Run only against a disposable local backend: creates
// real merchant/customer accounts, stores and orders over HTTP. The CSV always comes from the real
// backend. Route interception is limited to (a) forced failures and (b) the two analytics JSON
// endpoints when the backend can't serve them (their native queries can't map rows on the H2
// validation DB) — then they're filled with figures derived from the real CSV, and that is logged.
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';

const api = process.env.M111_API_BASE || 'http://localhost:8081';
const ui = process.env.M111_UI_BASE || 'http://localhost:3000';
const suffix = Date.now();
const password = 'M111-test-only!42';
const evidence = '.next/m1-11';
await mkdir(evidence, { recursive: true });

async function call(path, token, body, method = body ? 'POST' : 'GET', expected = 200) {
  const res = await fetch(api + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const json = await res.json();
  assert.equal(res.status, expected, `${method} ${path}: ${JSON.stringify(json)}`);
  return json.data;
}
async function register(label, merchant) {
  const email = `m111-${label}-${suffix}@example.test`;
  const auth = await call(merchant ? '/api/auth/register' : '/api/public/auth/register', null,
    { fullName: `M111 ${label}`, email, password, phone: '+962790000011' });
  return { ...auth, email };
}

// ── real data over HTTP ─────────────────────────────────────────────────────────────────────
const merchantA = await register('merchant-a', true);
const merchantB = await register('merchant-b', true);
const buyer = await register('buyer', false);
const slugA = `m111-a-${suffix}`;
const slugB = `m111-b-${suffix}`;
const bodyA = { name: 'M111 store A', slug: slugA, categorySlug: 'general-store', currency: 'JOD' };
const storeA = await call('/api/dashboard/stores', merchantA.accessToken, bodyA);
const storeB = await call('/api/dashboard/stores', merchantB.accessToken, { name: 'M111 empty store B', slug: slugB, categorySlug: 'general-store' });
const product = await call('/api/dashboard/products', merchantA.accessToken, { storeId: storeA.id, nameEn: 'Report mug', slug: 'mug', price: 10.125, sortOrder: 0 });
await call(`/api/dashboard/stores/${storeA.id}`, merchantA.accessToken, { ...bodyA, status: 'ACTIVE' }, 'PUT');
const order = (customerName, quantity) => call(`/api/public/stores/${slugA}/orders`, buyer.accessToken, {
  customerName, customerPhone: '+962790000011', deliveryMethod: 'PICKUP', paymentMethod: 'CASH',
  items: [{ productId: product.id, quantity }],
});
const quoted = await order('Quote, "Comma" Buyer\nline two', 2);
const formula = await order('=HYPERLINK("http://evil.test","x")', 1);
const cancelled = await order('Cancelled Buyer', 3);
await call(`/api/dashboard/orders/${cancelled.id}/status`, merchantA.accessToken, { status: 'CANCELLED' }, 'PUT');
// Store currency changed after the orders: history must keep JOD.
await call(`/api/dashboard/stores/${storeA.id}`, merchantA.accessToken, { ...bodyA, status: 'ACTIVE', currency: 'USD' }, 'PUT');

const iso = d => d.toISOString().slice(0, 10);
const to = iso(new Date());
const fromDate = new Date(); fromDate.setDate(fromDate.getDate() - 6);
const from = iso(fromDate);
const csvPath = id => `/api/dashboard/analytics/orders.csv?storeId=${id}&from=${from}&to=${to}`;
const expectedFilename = `khangates-orders-${from}-to-${to}.csv`;

const direct = await fetch(api + csvPath(storeA.id), { headers: { Authorization: `Bearer ${merchantA.accessToken}` } });
assert.equal(direct.status, 200);
assert.match(direct.headers.get('content-type'), /^text\/csv;\s*charset=UTF-8$/i);
assert.equal(direct.headers.get('content-disposition'), `attachment; filename="${expectedFilename}"`);
const rawText = async res => new TextDecoder('utf-8', { ignoreBOM: true }).decode(await res.arrayBuffer()); // keep the BOM
const csvA = await rawText(direct);
assert(csvA.startsWith('﻿order_code,created_at_utc,status,fulfillment_method,customer_name,subtotal,discount,delivery_fee,total,currency\r\n'));
const records = csvA.slice(1, -2).split('\r\n');
assert.equal(records.length, 3, 'header + two non-cancelled orders');
assert(!csvA.includes(cancelled.orderCode), 'cancelled order excluded, as in report totals');
const quotedRow = records.find(r => r.startsWith(`"${quoted.orderCode}"`));
assert(quotedRow.includes('"Quote, ""Comma"" Buyer\nline two"'), quotedRow);
assert(quotedRow.endsWith('"20.250","JOD"'), quotedRow);
const formulaRow = records.find(r => r.startsWith(`"${formula.orderCode}"`));
assert(formulaRow.includes(`"'=HYPERLINK(""http://evil.test"",""x"")"`), formulaRow);
assert(!csvA.includes('USD'), 'historical currency snapshot, not current Store.currency');
const csvTotal = records.slice(1).reduce((sum, r) => sum + Number(r.split('","').at(-2)), 0);
assert.equal(csvTotal, 30.375);

// Cross-tenant / unauthenticated export
const foreign = await fetch(api + csvPath(storeA.id), { headers: { Authorization: `Bearer ${merchantB.accessToken}` } });
assert.equal(foreign.status, 403);
const foreignBody = await foreign.text();
assert(!foreignBody.includes(quoted.orderCode) && !foreignBody.includes('Buyer'));
assert.equal((await fetch(api + csvPath(storeA.id))).status, 401);
const emptyCsv = await rawText(await fetch(api + csvPath(storeB.id), { headers: { Authorization: `Bearer ${merchantB.accessToken}` } }));
assert.equal(emptyCsv, '﻿order_code,created_at_utc,status,fulfillment_method,customer_name,subtotal,discount,delivery_fee,total,currency\r\n');

const realDaily = await fetch(api + `/api/dashboard/analytics/daily-store-sales?storeId=${storeA.id}&from=${from}&to=${to}`,
  { headers: { Authorization: `Bearer ${merchantA.accessToken}` } });
console.log(`Backend daily-store-sales for store A with rows: HTTP ${realDaily.status}`);

// ── browser ─────────────────────────────────────────────────────────────────────────────────
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1200, height: 1000 }, acceptDownloads: true });
  const page = await context.newPage();
  async function login(account, slug) {
    await page.goto(ui + '/login');
    await page.evaluate(() => localStorage.clear());
    await page.goto(ui + '/login');
    await page.getByPlaceholder('you@example.com or +60 12-345 6789').fill(account.email);
    await page.getByPlaceholder('••••••••').fill(password);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.waitForFunction(() => !!localStorage.getItem('sl_access_token'), null, { timeout: 30000 });
    await page.goto(`${ui}/dashboard/${slug}/reports`);
  }
  const exportButton = () => page.getByRole('button', { name: /Export orders from .* as CSV/ });

  await login(merchantA, slugA);
  await expect(page.getByRole('heading', { name: 'Reports' }).first()).toBeVisible({ timeout: 30000 });

  // 1. Real backend as-is. On Postgres this shows the real figures; on the H2 validation DB the
  //    native query fails, and the page must say so instead of showing zeros or sample data.
  if (realDaily.status === 200) {
    await expect(page.getByText('30.375', { exact: true }).first()).toBeVisible({ timeout: 30000 });
  } else {
    await expect(page.getByText("Couldn't load reports")).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Total Revenue')).toHaveCount(0);
    await expect(page.getByText('No sales in this period')).toHaveCount(0);
    await expect(exportButton()).toBeDisabled();
  }
  await page.screenshot({ path: `${evidence}/1-real-backend.png`, fullPage: true });

  // 2. Analytics JSON from backend truth (derived from the real CSV above); CSV stays real.
  let routedAnalytics = false;
  if (realDaily.status !== 200) {
    routedAnalytics = true;
    await page.route('**/api/dashboard/analytics/daily-store-sales**', route => route.fulfill({ json: {
      status: 'success', statusCode: 200, message: 'ok',
      data: [{ saleDate: to, storeId: storeA.id, storeName: storeA.name, totalRevenue: csvTotal, orderCount: records.length - 1 }],
    } }));
    await page.route('**/api/dashboard/analytics/top-products**', route => route.fulfill({ json: {
      status: 'success', statusCode: 200, message: 'ok',
      data: [{ productId: product.id, name: 'Report mug', categoryName: null, unitsSold: 3, revenue: csvTotal }],
    } }));
    await page.reload();
  }
  console.log(`Analytics JSON intercepted from CSV truth: ${routedAnalytics}`);
  await expect(page.getByText('30.375', { exact: true }).first()).toBeVisible({ timeout: 30000 });
  await expect(page.getByText('15.188', { exact: true })).toBeVisible(); // avg order value
  await expect(page.getByText(`${from} to ${to} (UTC)`, { exact: false })).toBeVisible();
  await expect(page.getByText(/[+-]\d+\.\d%/)).toHaveCount(0);       // no fabricated trend
  await expect(page.getByText(/\bRM\b/)).toHaveCount(0);              // no hardcoded currency
  await expect(page.getByText(/USD|JOD/)).toHaveCount(0);             // mixed-history totals unlabeled
  await expect(page.getByText(/coming soon/i)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /pdf|download report/i })).toHaveCount(0);
  await expect(page.getByText('Top 10 products').first()).toBeVisible();
  await page.screenshot({ path: `${evidence}/2-report-with-data.png`, fullPage: true });

  // 3. Export CSV → real authenticated request → real file identical to the backend's.
  const csvRequests = [];
  page.on('request', r => { if (r.url().includes('/analytics/orders.csv')) csvRequests.push(r.url()); });
  await expect(exportButton()).toBeEnabled();
  const [download] = await Promise.all([page.waitForEvent('download'), exportButton().click()]);
  assert.equal(download.suggestedFilename(), expectedFilename);
  const saved = `${evidence}/${expectedFilename}`;
  await download.saveAs(saved);
  const downloaded = await readFile(saved, 'utf8');
  assert.equal(downloaded, csvA, 'browser download must be the backend CSV byte-for-byte');
  assert(csvRequests.some(u => u.includes(`storeId=${storeA.id}`) && u.includes(`from=${from}`) && u.includes(`to=${to}`)),
    'CSV request uses the page\'s store and active filter');
  await expect(page.getByText(/export failed/i)).toHaveCount(0);

  // 3b. Export respects the active period: switch to 30 Days and check the request range.
  csvRequests.length = 0;
  await page.getByRole('tab', { name: '30 Days' }).click();
  await expect(page.getByText('30.375', { exact: true }).first()).toBeVisible();
  const from30 = new Date(); from30.setDate(from30.getDate() - 29);
  const [download30] = await Promise.all([page.waitForEvent('download'), exportButton().click()]);
  assert.equal(download30.suggestedFilename(), `khangates-orders-${iso(from30)}-to-${to}.csv`);
  assert(csvRequests.some(u => u.includes(`from=${iso(from30)}`)));
  await page.getByRole('tab', { name: '7 Days' }).click();

  // 4. Failed export: error toast, no file, no success claim.
  await page.route('**/api/dashboard/analytics/orders.csv**', route => route.fulfill({ status: 500,
    json: { status: 'error', statusCode: 500, message: 'Simulated export failure' } }));
  let unexpectedDownload = false;
  const onDownload = () => { unexpectedDownload = true; };
  page.on('download', onDownload);
  await exportButton().click();
  await expect(page.getByText('CSV export failed: Simulated export failure')).toBeVisible();
  await page.waitForTimeout(1000);
  assert.equal(unexpectedDownload, false);
  await expect(page.getByText(/export(ed)? success/i)).toHaveCount(0);
  page.off('download', onDownload);
  await page.screenshot({ path: `${evidence}/4-export-failure.png`, fullPage: true });
  await page.unroute('**/api/dashboard/analytics/orders.csv**');

  // 5. Report API failure: error state, no fallback figures; retry recovers.
  let failDaily = true;
  await page.unroute('**/api/dashboard/analytics/daily-store-sales**');
  await page.route('**/api/dashboard/analytics/daily-store-sales**', route => failDaily
    ? route.fulfill({ status: 500, json: { status: 'error', statusCode: 500, message: 'Simulated report failure.' } })
    : route.fulfill({ json: { status: 'success', statusCode: 200, message: 'ok',
        data: [{ saleDate: to, storeId: storeA.id, storeName: storeA.name, totalRevenue: csvTotal, orderCount: 2 }] } }));
  await page.reload();
  await expect(page.getByText("Couldn't load reports")).toBeVisible({ timeout: 30000 });
  await expect(page.getByText('Simulated report failure.', { exact: false })).toBeVisible();
  await expect(page.getByText('30.375', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Total Revenue')).toHaveCount(0);
  await expect(page.getByText('No sales in this period')).toHaveCount(0);
  await expect(exportButton()).toBeDisabled();
  await page.screenshot({ path: `${evidence}/5-report-error.png`, fullPage: true });
  failDaily = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('30.375', { exact: true }).first()).toBeVisible();

  // 5b. Insights shares the data source: a failure is an error, not "Not enough data yet".
  failDaily = true;
  await page.goto(`${ui}/dashboard/${slugA}/insights`);
  await expect(page.getByText("Couldn't load insights")).toBeVisible({ timeout: 30000 });
  await expect(page.getByText('Not enough data yet')).toHaveCount(0);
  await page.unrouteAll();

  // 6. Empty store (merchant B), real backend only: real zero state, nothing fabricated.
  await login(merchantB, slugB);
  await expect(page.getByText('No sales in this period')).toBeVisible({ timeout: 30000 });
  await expect(page.getByText('Total Revenue')).toHaveCount(0);
  await expect(page.getByText("Couldn't load reports")).toHaveCount(0);
  await expect(exportButton()).toBeDisabled();
  await page.screenshot({ path: `${evidence}/6-empty-store.png`, fullPage: true });

  // 7. Merchant B's session pointed at store A's reports URL: no A data reaches the page.
  const leaked = [];
  page.on('response', async r => { if (r.url().includes(storeA.id)) leaked.push(r.status()); });
  await page.goto(`${ui}/dashboard/${slugA}/reports`);
  await page.waitForTimeout(4000);
  await expect(page.getByText(quoted.orderCode)).toHaveCount(0);
  await expect(page.getByText('30.375', { exact: true })).toHaveCount(0);
  assert(leaked.every(s => s === 403), `requests for store A from B must be rejected: ${leaked}`);
  console.log('M1-11 E2E PASS');
} finally {
  await browser.close();
}
