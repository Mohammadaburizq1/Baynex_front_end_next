// M1-13 persistence + outage checks against a disposable backend (M1-13: PostgreSQL 16).
// 1) Business hours edited twice through the merchant UI (regression for the save-twice 409).
// 2) Published theme content persists to the real storefront; drafts do not.
// 3) With the backend stopped (run with M113_BACKEND_DOWN=1), the storefront shows its error page,
//    never a demo store.
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const api = 'http://localhost:8081';
const ui = 'http://localhost:3000';
const evidence = '.next/m1-13';
const statePath = `${evidence}/persistence-state.json`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
try {
  if (process.env.M113_BACKEND_DOWN) {
    const slug = `m113-outage-${Date.now()}`; // never fetched, so nothing cached: only the live backend could answer
    const res = await page.goto(`${ui}/store/${slug}?outage=${Date.now()}`);
    await expect(page.getByText('Store temporarily unavailable')).toBeVisible({ timeout: 60000 });
    assert.equal(await page.locator('[data-storefront-template]').count(), 0, 'no storefront (demo or cached) rendered');
    await page.screenshot({ path: `${evidence}/backend-down.png` });
    console.log(`PASS backend down: HTTP ${res.status()}, error page, no demo fallback`);
  } else {
    const s = Date.now();
    const password = 'M113-test-only!42';
    const call = async (method, path, token, body) => {
      const r = await fetch(api + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
      const j = await r.json().catch(() => null);
      assert.equal(r.status, 200, `${method} ${path}: ${JSON.stringify(j)}`);
      return j?.data;
    };
    const email = `m113-persist-${s}@example.test`;
    const m = await call('POST', '/api/auth/register', null, { fullName: 'M113 persist', email, password, phone: '+962790001414' });
    const slug = `m113-persist-${s}`;
    const body = { name: 'Persist Grill', slug, categorySlug: 'general-store', templateKey: 'restaurant-default', currency: 'JOD', timezone: 'Asia/Amman' };
    const store = await call('POST', '/api/dashboard/stores', m.accessToken, body);
    await call('POST', '/api/dashboard/products', m.accessToken, { storeId: store.id, nameEn: 'Persist Plate', slug: 'plate', price: 4, sortOrder: 0 });
    await call('PUT', `/api/dashboard/stores/${store.id}`, m.accessToken, { ...body, status: 'ACTIVE' });
    fs.writeFileSync(statePath, JSON.stringify({ slug }));

    // 1) Business hours through the UI, saved twice.
    await page.goto(`${ui}/login`);
    await page.getByPlaceholder('you@example.com or +60 12-345 6789').fill(email);
    await page.getByPlaceholder('••••••••').fill(password);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.waitForFunction(() => !!localStorage.getItem('sl_access_token'), null, { timeout: 30000 });
    await page.goto(`${ui}/dashboard/${slug}/store-settings`);
    const monday = page.getByRole('switch', { name: 'MONDAY open' });
    await expect(monday).toBeVisible({ timeout: 30000 });
    if ((await monday.getAttribute('aria-checked')) !== 'true') await monday.click();
    await page.getByRole('button', { name: 'Save Business Hours' }).click();
    await expect(page.getByText('Business hours saved.').first()).toBeVisible({ timeout: 15000 });
    const first = await call('GET', `/api/public/stores/${slug}/business-hours`, null);
    assert.equal(first.configured, true);
    await page.reload();
    await page.getByRole('switch', { name: 'MONDAY open' }).click(); // close Monday
    await page.getByRole('button', { name: 'Save Business Hours' }).click();
    await expect(page.getByText('Business hours saved.').first()).toBeVisible({ timeout: 15000 });
    await page.reload();
    await expect(page.getByRole('switch', { name: 'MONDAY open' })).toHaveAttribute('aria-checked', 'false', { timeout: 30000 });
    const second = await call('GET', `/api/public/stores/${slug}/business-hours`, null);
    assert.equal(second.days.find(d => d.dayOfWeek === 'MONDAY').closed, true);
    console.log('PASS business hours saved twice via UI and persisted across reload');

    // 2) Theme content: a draft is not public; published content is, and survives reload.
    await call('PUT', '/api/dashboard/theme-content', m.accessToken, { storeId: store.id, content: { heroTitleEnjoyLine: `Draft line ${s}` } });
    await page.goto(`${ui}/store/${slug}?t=${s}`);
    await expect(page.getByText(`Draft line ${s}`)).toHaveCount(0);
    await call('PUT', '/api/dashboard/theme-content', m.accessToken, { storeId: store.id, content: { heroTitleEnjoyLine: `Published line ${s}` } });
    await call('POST', '/api/dashboard/theme-content/publish', m.accessToken, { storeId: store.id });
    // The storefront caches its fetches for up to 60 s (revalidate: 60): poll until fresh.
    await expect.poll(async () => {
      await page.goto(`${ui}/store/${slug}?t=${Date.now()}`);
      return page.getByText(`Published line ${s}`).count();
    }, { timeout: 150000, intervals: [5000, 10000, 20000] }).toBeGreaterThan(0);
    await page.reload();
    await expect(page.getByText(`Published line ${s}`).first()).toBeVisible();
    console.log('PASS published theme content persists to the real storefront; draft stays private');
  }
} finally {
  await browser.close();
}
