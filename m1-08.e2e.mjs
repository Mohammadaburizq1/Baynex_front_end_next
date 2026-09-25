// Run only against a disposable local backend. Uses real profile/auth APIs; route
// interception below is explicitly limited to loading and failure-state checks.
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const api = process.env.M108_API_BASE || 'http://localhost:8081';
const ui = process.env.M108_UI_BASE || 'http://localhost:3000';
const email = 'm108-profile@example.test';
const password = 'M108-test-only!42';
const phone = '+962790000008';
const evidence = '.next/m1-08';
await mkdir(evidence, { recursive: true });

async function auth(path, body) {
  return fetch(api + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}
let setup = await auth('/api/public/auth/login', { email, password });
if (setup.status === 401) setup = await auth('/api/public/auth/register', { email, password, fullName: 'Profile browser customer', phone });
assert.equal(setup.status, 200, 'Disposable customer setup must succeed');
const credentials = (await setup.json()).data;
async function backendProfile() {
  const response = await fetch(api + '/api/public/customers/me', { headers: { Authorization: `Bearer ${credentials.accessToken}` } });
  assert.equal(response.status, 200);
  const profile = (await response.json()).data;
  assert.deepEqual(Object.keys(profile).sort(), ['email', 'fullName', 'id', 'phone']);
  return profile;
}
const initial = await backendProfile();
const savedName = `Persisted customer ${Date.now()}`;
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const profileRequests = [];
  const authMeRequests = [];
  page.on('request', request => {
    if (new URL(request.url()).pathname === '/api/public/customers/me') profileRequests.push(request);
    if (new URL(request.url()).pathname === '/api/public/auth/me') authMeRequests.push(request);
  });
  async function login() {
    const previous = profileRequests.filter(request => request.method() === 'GET').length;
    await page.goto(ui + '/customer/login?redirect=/customer/account');
    await page.locator('input[type=email]').fill(email);
    await page.locator('input[type=password]').fill(password);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'My account', exact: true })).toBeVisible({ timeout: 30000 });
    assert(profileRequests.filter(request => request.method() === 'GET').length > previous, 'Login must fetch dedicated profile');
  }
  await login();
  const name = page.getByLabel('Name', { exact: true });
  await expect(name).toHaveValue(initial.fullName);
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await expect(page.getByText(phone, { exact: true })).toBeVisible();
  await expect(page.locator('form input')).toHaveCount(1);
  await expect(name).toHaveAttribute('maxlength', '160');
  await expect(page.getByText('Email and phone are read-only', { exact: false })).toBeVisible();

  let releaseSave;
  const saveGate = new Promise(resolve => { releaseSave = resolve; });
  await page.route('**/api/public/customers/me', async route => {
    if (route.request().method() === 'PUT') await saveGate;
    await route.continue();
  });
  await name.fill(`  ${savedName}  `);
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(page.getByRole('button', { name: /Saving/ })).toBeDisabled();
  await expect(name).toBeDisabled();
  releaseSave();
  await expect(page.getByRole('status').filter({ hasText: 'Profile updated.' })).toBeVisible();
  await expect(name).toHaveValue(savedName);
  assert.deepEqual(profileRequests.find(request => request.method() === 'PUT').postDataJSON(), { fullName: savedName });
  assert.equal((await backendProfile()).fullName, savedName);
  await page.unroute('**/api/public/customers/me');

  let releaseLoad;
  const loadGate = new Promise(resolve => { releaseLoad = resolve; });
  await page.route('**/api/public/customers/me', async route => { await loadGate; await route.continue(); });
  await page.reload();
  await expect(page.getByRole('status')).toHaveText('Loading profile…');
  releaseLoad();
  await expect(name).toHaveValue(savedName);
  await page.unroute('**/api/public/customers/me');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await login();
  await expect(name).toHaveValue(savedName);
  await page.screenshot({ path: `${evidence}/persisted.png`, fullPage: true });

  // Validation must not issue a save or leave an old success notice visible.
  const savesBefore = profileRequests.filter(request => request.method() === 'PUT').length;
  await name.fill('   ');
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Name is required.' })).toBeVisible();
  assert.equal(profileRequests.filter(request => request.method() === 'PUT').length, savesBefore);
  await expect(page.getByText('Profile updated.', { exact: true })).toHaveCount(0);

  await page.route('**/api/public/customers/me', route => route.request().method() === 'PUT'
    ? route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Test save failed"}' }) : route.continue());
  await name.fill('Unsaved edit');
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Test save failed' })).toBeVisible();
  assert.equal((await backendProfile()).fullName, savedName);
  await expect(page.getByText('Profile updated.', { exact: true })).toHaveCount(0);
  await page.unroute('**/api/public/customers/me');

  // A successful PUT followed by a failed profile refresh must not claim that the
  // refreshed view loaded successfully. Retry must recover the actual stored value.
  await page.route('**/api/public/customers/me', route => route.request().method() === 'GET'
    ? route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Test refresh failed"}' }) : route.continue());
  await name.fill(savedName);
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Could not load your profile.' })).toBeVisible();
  await expect(page.getByText('Profile updated.', { exact: true })).toHaveCount(0);
  assert.equal((await backendProfile()).fullName, savedName);
  await page.unroute('**/api/public/customers/me');
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(name).toHaveValue(savedName);

  await page.route('**/api/public/customers/me', route => route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Test load failed"}' }));
  await page.reload();
  await expect(page.getByRole('alert').filter({ hasText: 'Could not load your profile.' })).toBeVisible();
  assert(new URL(page.url()).pathname === '/customer/account', 'Server errors must not masquerade as logout');
  await expect(page.getByRole('button', { name: 'Save profile', exact: true })).toHaveCount(0);
  await page.screenshot({ path: `${evidence}/load-error.png`, fullPage: true });
  await page.unroute('**/api/public/customers/me');
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(name).toHaveValue(savedName);

  assert.equal(authMeRequests.length, 0, 'No /auth/me profile source or fallback');
  const storage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
  for (const [key, value] of Object.entries({ ...storage.local, ...storage.session })) {
    if (key === 'sl_customer_access_token' || key === 'sl_customer_refresh_token') continue;
    assert(!value.includes(savedName) && !value.includes(email), `Profile data persisted in ${key}`);
  }
  console.log('PASS: dedicated profile GET after login, narrow DTO, name-only PUT, save/loading states, backend persistence, reload, logout/login, read-only contacts, validation, save/load errors and retry, no auth/me fallback or profile storage.');
} finally { await browser.close(); }
