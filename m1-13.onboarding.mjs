// M1-13 merchant onboarding through the real wizard UI (disposable local backend only; the OTP is
// read from the local-profile backend log, where LoggingOtpSender writes it in dev).
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const api = 'http://localhost:8081';
const ui = 'http://localhost:3000';
const log = process.env.M113_BACKEND_LOG;
assert(log, 'set M113_BACKEND_LOG to the disposable backend log file');
const evidence = '.next/m1-13';
const s = Date.now();
const phone = `+96279${String(s).slice(-7)}`;
const password = 'M113-test-only!42';
const storeName = `Onboard Grill ${String(s).slice(-5)}`;
const slug = `m113-onboard-${s}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const shot = name => page.screenshot({ path: `${evidence}/onboarding-${name}.png`, fullPage: true });
try {
  await page.goto(`${ui}/onboarding`);
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${ui}/onboarding`);
  // Step 0: account (phone + password), then the OTP the backend sends.
  await page.getByPlaceholder('+60 1X-XXX XXXX').fill(phone);
  await page.getByPlaceholder('Min. 8 characters').fill(password);
  await page.getByPlaceholder('Re-enter password').fill(password);
  await page.getByRole('button', { name: 'Continue to Design' }).click();
  await expect(page.getByPlaceholder('123456')).toBeVisible({ timeout: 30000 });
  let code;
  await expect.poll(() => {
    const m = [...fs.readFileSync(log, 'utf8').matchAll(/DEV OTP code for (\S+): (\d{4,8})/g)].filter(x => x[1].replace(/\D/g, '') === phone.replace(/\D/g, ''));
    code = m.at(-1)?.[2];
    return code;
  }, { timeout: 20000 }).toBeTruthy();
  await page.getByPlaceholder('123456').fill(code);
  await page.getByRole('button', { name: 'Verify Phone' }).click();
  // Step 1: template.
  // A non-default restaurant design: the create payload also carries sub-category "fast-food".
  await page.getByPlaceholder('Search templates...').fill('Ramen');
  await page.getByRole('button', { name: /Ramen/ }).first().click({ timeout: 30000 });
  await shot('1-template');
  await page.getByRole('button', { name: 'Continue to Business Details' }).click();
  // Step 2: business details.
  await page.getByPlaceholder("e.g. Ahmad's Bakery").fill(storeName);
  const url = page.getByPlaceholder('your-store-name');
  await url.fill(slug);
  await page.waitForTimeout(1500); // slug availability check
  await shot('2-details');
  await page.getByRole('button', { name: 'Continue to Customize' }).click();
  await shot('3-customize');
  // Last step: create.
  const [res] = await Promise.all([
    page.waitForResponse(r => r.url().endsWith('/api/dashboard/stores') && r.request().method() === 'POST', { timeout: 60000 }),
    page.getByRole('button', { name: 'Create Store' }).click(),
  ]);
  const created = await res.json();
  assert.equal(res.status(), 200, JSON.stringify(created));
  assert.equal(created.data.templateKey, 'ramen-shop');
  await page.waitForURL(/\/dashboard\//, { timeout: 60000 });
  await shot('4-dashboard');
  // Persisted on the backend under this merchant, survives reload.
  const token = await page.evaluate(() => localStorage.getItem('sl_access_token'));
  const mine = await (await fetch(`${api}/api/dashboard/stores/my`, { headers: { Authorization: `Bearer ${token}` } })).json();
  const store = mine.data.find(x => x.id === created.data.id);
  assert(store, 'store listed for the merchant');
  assert.equal(store.templateKey, 'ramen-shop');
  await page.reload();
  await expect(page.getByText(store.name).first()).toBeVisible({ timeout: 30000 });
  // Publish (needs a product) and confirm the live storefront renders the chosen design.
  const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const pr = await fetch(`${api}/api/dashboard/products`, { method: 'POST', headers: auth, body: JSON.stringify({ storeId: store.id, nameEn: 'Tonkotsu', slug: 'tonkotsu', price: 6.5, sortOrder: 0 }) });
  assert.equal(pr.status, 200);
  const pub = await fetch(`${api}/api/dashboard/stores/${store.id}`, { method: 'PUT', headers: auth, body: JSON.stringify({ name: store.name, slug: store.slug, categorySlug: store.categorySlug, subCategorySlug: store.subCategorySlug, templateKey: store.templateKey, status: 'ACTIVE' }) });
  assert.equal(pub.status, 200);
  await page.goto(`${ui}/store/${store.slug}`);
  await page.waitForSelector('[data-storefront-template="ramen-shop"]', { state: 'attached', timeout: 90000 });
  await shot('5-live-storefront');
  console.log(`PASS onboarding UI: phone account + OTP, template, details, store ${store.slug} (${store.status}, ${store.currency})`);
} finally {
  await browser.close();
}
