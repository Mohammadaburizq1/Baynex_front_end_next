// Run against a disposable backend only. Creates real accounts/store/orders via HTTP.
// API_BASE and UI_BASE may point to local validation servers; no production defaults.
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const api = process.env.M107_API_BASE || 'http://localhost:8081';
const ui = process.env.M107_UI_BASE || 'http://localhost:3000';
const suffix = Date.now();
const password = 'M107-test-only!42';
const evidence = '.next/m1-07';
await mkdir(evidence, { recursive: true });
async function call(path, token, body, method = body ? 'POST' : 'GET', expected = 200) {
  const res = await fetch(api + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const json = await res.json();
  assert.equal(res.status, expected, `${method} ${path}: ${JSON.stringify(json)}`);
  return json.data;
}
async function register(label, merchant = false) {
  const email = `m107-${label}-${suffix}@example.test`;
  const auth = await call(merchant ? '/api/auth/register' : '/api/public/auth/register', null,
    { fullName: `M107 ${label}`, email, password, phone: '+962790000001' });
  return { ...auth, email };
}
const merchant = await register('merchant', true);
const a = await register('a');
const b = await register('b');
const empty = await register('empty');
const slug = `m107-${suffix}`;
const storeBody = { name: 'M107 browser store', slug, categorySlug: 'general-store', currency: 'JOD' };
const store = await call('/api/dashboard/stores', merchant.accessToken, storeBody);
const product = await call('/api/dashboard/products', merchant.accessToken, { storeId: store.id, nameEn: 'Historical mug', slug: 'mug', price: 10.125, sortOrder: 0 });
await call(`/api/dashboard/stores/${store.id}`, merchant.accessToken, { ...storeBody, status: 'ACTIVE' }, 'PUT');
const orderBody = { customerName: 'M107 A', customerEmail: a.email, customerPhone: '+962790000001', deliveryMethod: 'PICKUP', paymentMethod: 'CASH', items: [{ productId: product.id, quantity: 1 }] };
const order = await call(`/api/public/stores/${slug}/orders`, a.accessToken, orderBody);
const foreign = await call(`/api/public/stores/${slug}/orders`, b.accessToken, { ...orderBody, customerEmail: b.email });
const guest = await call(`/api/public/stores/${slug}/orders`, null, orderBody);
await call('/api/public/customers/me/orders', null, null, 'GET', 401);
await call(`/api/public/customers/me/orders/${order.id}`, b.accessToken, null, 'GET', 404);
await call(`/api/public/customers/me/orders/${guest.id}`, a.accessToken, null, 'GET', 404);
assert.deepEqual((await call(`/api/public/customers/me/orders?customerId=${b.user.id}`, a.accessToken)).map(o => o.id), [order.id]);

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const requests = [];
  page.on('request', request => { if (request.url().includes('/customers/me/orders')) requests.push(request.url()); });
  async function login(account) {
    await page.goto(ui + '/customer/login?redirect=/customer/account');
    await page.locator('input[type=email]').fill(account.email);
    await page.locator('input[type=password]').fill(password);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'My account', exact: true })).toBeVisible({ timeout: 30000 });
  }
  await login(a);
  await expect(page.getByRole('heading', { name: order.orderCode, exact: true })).toBeVisible();
  await expect(page.getByText(foreign.orderCode, { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: `View order ${order.orderCode}` }).click();
  const detail = page.getByRole('region', { name: 'Order detail' });
  await expect(detail.getByText('1 × Historical mug')).toBeVisible();
  await expect(detail.getByText('Pickup', { exact: true })).toBeVisible();
  await expect(detail.getByText('10.125 JOD', { exact: true })).toHaveCount(2);
  assert(requests.some(url => url.endsWith(`/orders/${order.id}`)));
  await page.screenshot({ path: `${evidence}/detail.png`, fullPage: true });
  await page.getByRole('button', { name: 'Sign out' }).click();
  await login(b);
  await expect(page.getByRole('heading', { name: foreign.orderCode, exact: true })).toBeVisible();
  await expect(page.getByText(order.orderCode, { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await login(empty);
  await expect(page.getByText('No orders yet.', { exact: true })).toBeVisible();
  await page.screenshot({ path: `${evidence}/empty.png`, fullPage: true });

  // Fault injection is limited to the error-state check; successful history above is real HTTP.
  await page.route('**/api/public/customers/me/orders?*', route => route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Injected test failure"}' }));
  await page.reload();
  await expect(page.getByRole('alert').filter({ hasText: 'Could not load your orders.' })).toBeVisible();
  await expect(page.getByText('No orders yet.', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^View order / })).toHaveCount(0);
  await page.unroute('**/api/public/customers/me/orders?*');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('No orders yet.', { exact: true })).toBeVisible();
  console.log('PASS: real login/logout, authenticated/guest checkout API, own history/detail, B isolation/IDOR, empty history, API error and retry, three-decimal currency.');
} finally { await browser.close(); }
