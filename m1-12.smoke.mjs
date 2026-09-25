// M1-12 template smoke check. Run only against a disposable local backend + `next dev`.
// For every registered template id: creates a real published store over HTTP (JOD, no WhatsApp
// number, business hours not configured) and loads both /store/{slug} (real) and /templates/{id}
// (preview showcase). No route interception.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const api = process.env.M112_API_BASE || 'http://localhost:8081';
const ui = process.env.M112_UI_BASE || 'http://localhost:3000';
const suffix = Date.now();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const resolverSource = fs.readFileSync('lib/utils/template-resolver.ts', 'utf8');
const ids = [...resolverSource.match(/export type StorefrontTemplate =([\s\S]*?);/)[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
assert.equal(ids.length, 49);

// Illustrative names from the templates' own demo arrays and clothing presets: none may appear on a real store.
const fabricated = new Set();
for (const file of fs.readdirSync('components/storefront', { recursive: true }).filter(f => f.endsWith('.tsx'))) {
  const source = fs.readFileSync(path.join('components/storefront', file), 'utf8');
  for (const block of source.matchAll(/const (?:AGENTS|DOCTORS|PHARMACISTS|TEAM|TESTIMONIALS|CLIENTS) = \[([\s\S]*?)\];/g)) {
    for (const m of block[1].matchAll(/(?:name|author|n): '([^']+)'/g)) fabricated.add(m[1]);
    if (!/:/.test(block[1])) for (const m of block[1].matchAll(/'([^']+)'/g)) fabricated.add(m[1]);
  }
}
for (const m of fs.readFileSync('lib/data/clothing-presets.ts', 'utf8').matchAll(/name: '([^']+)'/g)) fabricated.add(m[1]);
const PRESET_HOURS = /Mon\s?[–-]\s?(Sun|Fri|Sat)\s+\d/;

function onboardingCategory(id) {
  const food = !/^(retail|catalog|real-estate|services|medical|clothing)/.test(id);
  if (food) {
    const sub = id.startsWith('coffee-') ? 'cafe' : ({ 'burger-restaurant': 'burger-restaurant', 'dessert-shop': 'dessert-shop', 'smoothie-bar': 'healthy-food' })[id] ?? 'fast-food';
    return { categorySlug: 'restaurants-cafes', subCategorySlug: sub };
  }
  if (id.startsWith('clothing-')) return { categorySlug: 'clothes-fashion', subCategorySlug: id };
  if (id.startsWith('services-')) return { categorySlug: 'beauty-salon' };
  return { categorySlug: 'general-store' };
}

let writes = 0;
async function call(pathname, token, body, method = body ? 'POST' : 'GET') {
  if (method !== 'GET' && ++writes % 100 === 0) await sleep(61_000); // dashboard write limit: 120/min/IP
  const res = await fetch(api + pathname, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const json = await res.json();
  assert.equal(res.status, 200, `${method} ${pathname}: ${JSON.stringify(json)}`);
  return json.data;
}

const merchant = await call('/api/auth/register', null, { fullName: 'M112 smoke', email: `m112-${suffix}@example.test`, password: 'M112-test-only!42', phone: '+962790000112' });
const stores = {};
for (const id of ids) {
  const slug = `m112-${id}-${suffix}`.slice(0, 60);
  // Same category/sub-category pairs the onboarding wizard sends (app/onboarding/page.tsx), so a
  // backend that let the coarse sub-category override the chosen template would fail here.
  const body = { name: `Smoke ${id}`, slug, currency: 'JOD', templateKey: id, ...onboardingCategory(id) };
  const store = await call('/api/dashboard/stores', merchant.accessToken, body);
  await call('/api/dashboard/products', merchant.accessToken, { storeId: store.id, nameEn: 'Smoke item', slug: 'smoke-item', price: 10.125, sortOrder: 0 });
  await call(`/api/dashboard/stores/${store.id}`, merchant.accessToken, { ...body, status: 'ACTIVE' }, 'PUT');
  stores[id] = slug;
}
console.log(`Created ${ids.length} published JOD stores (no WhatsApp number).`);

const browser = await chromium.launch({ headless: true });
const rows = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message.split('\n')[0]));

  async function load(url, expected) {
    pageErrors = [];
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    await page.waitForSelector(`[data-storefront-template]`, { state: 'attached', timeout: 120_000 });
    await page.waitForTimeout(1500);
    const rendered = await page.getAttribute('[data-storefront-template]', 'data-storefront-template');
    const text = await page.innerText('body');
    const waLinks = await page.$$eval('a[href*="wa.me"]', as => as.map(a => a.getAttribute('href')));
    return { status: res.status(), rendered, ok: rendered === expected, text, waLinks, errors: [...pageErrors] };
  }

  for (const id of ids) {
    const real = await load(`${ui}/store/${stores[id]}`, id);
    const problems = [];
    if (real.status !== 200) problems.push(`HTTP ${real.status}`);
    if (!real.ok) problems.push(`rendered ${real.rendered}`);
    if (real.errors.length) problems.push(`runtime: ${real.errors.join(' | ')}`);
    if (/Store temporarily unavailable/.test(real.text)) problems.push('error page');
    if (!/smoke item/i.test(real.text)) problems.push('real product not shown');
    const priceShown = /JOD\s?10\.125/.test(real.text);
    if (!priceShown) problems.push('real price not shown as JOD 10.125');
    if (/\$\s?\d/.test(real.text)) problems.push('"$" price on a JOD store');
    if (/\bRM\s?\d|MYR/.test(real.text)) problems.push('RM/MYR on a JOD store');
    if (/10\.13\b/.test(real.text)) problems.push('10.125 rounded to 2 decimals');
    const leaked = [...fabricated].filter(name => real.text.includes(name));
    if (leaked.length) problems.push(`illustrative content: ${leaked.slice(0, 3).join(', ')}`);
    if (real.waLinks.length) problems.push(`WhatsApp links without a number: ${real.waLinks.slice(0, 2).join(', ')}`);
    if (PRESET_HOURS.test(real.text)) problems.push('preset opening hours instead of live status');
    const liveHours = real.text.includes('Hours not available');

    const preview = await load(`${ui}/templates/${id}`, id);
    const previewProblems = [];
    if (preview.status !== 200) previewProblems.push(`HTTP ${preview.status}`);
    if (!preview.ok) previewProblems.push(`rendered ${preview.rendered}`);
    if (preview.errors.length) previewProblems.push(`runtime: ${preview.errors.join(' | ')}`);

    rows.push({ id, real: problems.length ? 'FAIL' : 'PASS', preview: previewProblems.length ? 'FAIL' : 'PASS', priceJOD: priceShown, liveHours, notes: [...problems, ...previewProblems.map(p => `preview ${p}`)].join('; ') });
    process.stdout.write(`${id}: real ${problems.length ? 'FAIL' : 'PASS'}, preview ${previewProblems.length ? 'FAIL' : 'PASS'}${problems.length || previewProblems.length ? ` — ${[...problems, ...previewProblems].join('; ')}` : ''}\n`);
  }
} finally {
  await browser.close();
}
fs.mkdirSync('.next/m1-12', { recursive: true });
fs.writeFileSync('.next/m1-12/smoke.json', JSON.stringify(rows, null, 2));
console.table(rows.map(({ notes, ...r }) => r));
const failed = rows.filter(r => r.real === 'FAIL' || r.preview === 'FAIL');
assert.equal(failed.length, 0, `${failed.length} template(s) failed`);
console.log('M1-12 smoke PASS: 49/49 real storefronts and 49/49 previews');
