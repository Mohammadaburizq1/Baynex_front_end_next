// Disposable local database only. Complements m1-13.golden.mjs with cookie/MFA/abuse checks.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const api = process.env.M113_API_BASE || 'http://localhost:18081';
const ui = process.env.M113_UI_BASE || 'http://localhost:13000';
assert(new URL(api).hostname === 'localhost', 'Disposable localhost backend required');
const stamp = Date.now();
const password = 'M2-disposable-only!42';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const request = context.request;
const post = async (path, data) => request.post(api + path, { data });
try {
  const email = `m2-customer-${stamp}@example.test`;
  let response = await post('/api/public/auth/register', { fullName: 'M2 Customer', email, password });
  assert.equal(response.status(), 200);
  let data = (await response.json()).data;
  assert.equal(data.refreshToken, undefined);
  const customerId = data.user.id;
  await context.clearCookies(); // the register call above set a cookie; prove the UI login sets its own
  await page.goto(ui + '/customer/login?redirect=/customer/account');
  await page.waitForLoadState('networkidle'); // hydrated: an earlier click fell through to a native form submit
  await page.locator('input[type=email]').fill(email);
  await page.locator('input[type=password]').fill(password);
  const uiLogin = page.waitForResponse(r => r.url().endsWith('/api/public/auth/login') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  assert.equal((await uiLogin).status(), 200);
  // a glob like **/customer/account also matches the login page's ?redirect=/customer/account query
  await page.waitForURL(u => u.pathname === '/customer/account');
  await page.getByRole('button', { name: 'Sign out' }).waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem('sl_customer_refresh_token')), null);
  let cookies = await context.cookies(api);
  let cookie = cookies.find(c => c.name === 'shoplink_customer_refresh');
  assert(cookie?.httpOnly && cookie.secure && cookie.sameSite === 'Strict');
  assert(!(await page.evaluate(() => document.cookie)).includes('shoplink_customer_refresh'));
  await page.evaluate(() => localStorage.setItem('sl_customer_access_token', 'expired-access-token'));
  const refreshed = page.waitForResponse(r => r.url().endsWith('/api/public/auth/refresh') && r.status() === 200);
  await page.reload();
  await refreshed;
  assert.equal(await page.evaluate(() => localStorage.getItem('sl_customer_refresh_token')), null);
  const uiLogout = page.waitForResponse(r => r.url().endsWith('/api/public/auth/logout'));
  await page.getByRole('button', { name: 'Sign out' }).click();
  const logoutRes = await uiLogout;
  assert.equal(logoutRes.status(), 200);
  assert.match((await logoutRes.headerValue('set-cookie')) ?? '', /shoplink_customer_refresh=;.*Max-Age=0/i, 'logout clears the cookie');
  assert(!(await context.cookies(api)).some(c => c.name === 'shoplink_customer_refresh'));
  response = await post('/api/public/auth/refresh', {});
  assert.equal(response.status(), 401);
  console.log('PASS customer browser login, HttpOnly cookie, refresh-on-401, logout/revocation');

  // Elevate only the account created above in the specifically named disposable validation DB.
  assert(/^[0-9a-f-]{36}$/.test(customerId));
  execFileSync('docker', ['exec', 'khangates-m2-validation', 'psql', '-U', 'm2_test', '-d', process.env.M2_PG_DB || 'khangates_m2', '-v', 'ON_ERROR_STOP=1', '-c',
    `UPDATE app_users SET role='SUPER_ADMIN' WHERE id='${customerId}'`], { stdio: 'pipe' });
  response = await post('/api/admin/auth/login', { email, password });
  assert.equal(response.status(), 200);
  data = (await response.json()).data;
  assert.equal(data.mfaRequired, true);
  const challenge = data.mfaChallengeToken;
  response = await post('/api/admin/auth/mfa/setup', { mfaChallengeToken: challenge });
  assert.equal(response.status(), 200);
  const secret = (await response.json()).data.secret;
  response = await post('/api/admin/auth/mfa/verify', { mfaChallengeToken: challenge, mfaCode: '000000' });
  assert.equal(response.status(), 401, 'Development MFA bypass must be disabled');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bits = [...secret.replace(/=+$/, '')].map(c => alphabet.indexOf(c).toString(2).padStart(5, '0')).join('');
  const key = Buffer.from(bits.match(/.{8}/g).map(b => parseInt(b, 2)));
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const digest = createHmac('sha1', key).update(counter).digest();
  const offset = digest[digest.length - 1] & 15;
  const code = String((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000).padStart(6, '0');
  response = await post('/api/admin/auth/mfa/verify', { mfaChallengeToken: challenge, mfaCode: code });
  assert.equal(response.status(), 200);
  data = (await response.json()).data;
  assert.equal(data.refreshToken, undefined);
  assert.equal((await request.get(api + '/api/admin/auth/me', { headers: { Authorization: `Bearer ${data.accessToken}` } })).status(), 200);
  assert.equal((await request.get(api + '/api/dashboard/stores', { headers: { Authorization: `Bearer ${data.accessToken}` } })).status(), 403);
  assert((await context.cookies(api)).some(c => c.name === 'shoplink_admin_refresh' && c.httpOnly));
  await post('/api/admin/auth/logout', {});
  assert.equal((await post('/api/admin/auth/refresh', {})).status(), 401);
  console.log('PASS admin password + real TOTP, role isolation, scoped cookie and logout');

  for (let i = 0; i < 11; i++) {
    response = await request.post(api + '/api/public/auth/login', {
      headers: { 'X-Forwarded-For': `198.51.100.${i}` },
      data: { email: `missing-${stamp}@example.test`, password },
    });
  }
  assert.equal(response.status(), 429);
  assert(response.headers()['retry-after']);
  console.log('PASS spoofed forwarded addresses cannot bypass route limit');
} finally { await browser.close(); }
