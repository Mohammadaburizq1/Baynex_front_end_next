// Bulk product import golden path in a real browser against a disposable backend.
//   node product-import-check.mjs setup  <api> <backend.log> <out.json>   create a clean store, category, device, staff
//   node product-import-check.mjs import  <out.json> <ui> <shotDir>        template, errors preview, import, dashboard, storefront
//   node product-import-check.mjs reimport <out.json> <ui> <shotDir>       same file with SKIP, changed file with UPDATE, permissions
// Never point this at a real backend: it registers users and creates stores.
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { deflateRawSync, crc32, deflateSync } from 'node:zlib';
import { chromium } from '@playwright/test';

const [cmd, ...args] = process.argv.slice(2);
const assert = (cond, msg) => { if (!cond) throw new Error('CHECK FAILED: ' + msg); console.log('  ok  ' + msg); };

// ── files: a real .xlsx (numbers as numeric cells, codes as text), a ZIP, PNG pictures ─────────────
function zip(files) {
  const local = [], central = [];
  let offset = 0;
  for (const [name, data] of files) {
    const nameBuf = Buffer.from(name, 'utf8');
    const comp = deflateRawSync(data);
    const crc = crc32(data) >>> 0;
    const h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x0800, 6); h.writeUInt16LE(8, 8);
    h.writeUInt32LE(crc, 14); h.writeUInt32LE(comp.length, 18); h.writeUInt32LE(data.length, 22); h.writeUInt16LE(nameBuf.length, 26);
    local.push(h, nameBuf, comp);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8); c.writeUInt16LE(8, 10);
    c.writeUInt32LE(crc, 16); c.writeUInt32LE(comp.length, 20); c.writeUInt32LE(data.length, 24); c.writeUInt16LE(nameBuf.length, 28);
    c.writeUInt32LE(offset, 42);
    central.push(c, nameBuf);
    offset += 30 + nameBuf.length + comp.length;
  }
  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, cd, end]);
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function col(i) { let s = ''; for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s; return s; }
function xlsx(header, rows) {
  const cell = (v, r, c) => {
    if (v === null || v === undefined || v === '') return '';
    const ref = col(c) + r;
    return typeof v === 'number' ? `<c r="${ref}"><v>${v}</v></c>` : `<c r="${ref}" t="inlineStr"><is><t>${esc(v)}</t></is></c>`;
  };
  const all = [header, ...rows];
  const sheet = `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${
    all.map((row, i) => `<row r="${i + 1}">${row.map((v, c) => cell(v, i + 1, c)).join('')}</row>`).join('')}</sheetData></worksheet>`;
  return zip([
    ['[Content_Types].xml', Buffer.from('<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>')],
    ['_rels/.rels', Buffer.from('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')],
    ['xl/workbook.xml', Buffer.from('<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Products" sheetId="1" r:id="rId1"/></sheets></workbook>')],
    ['xl/_rels/workbook.xml.rels', Buffer.from('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>')],
    ['xl/worksheets/sheet1.xml', Buffer.from(sheet, 'utf8')],
  ]);
}

/** A plain coloured square with a darker band: a real, visible PNG. */
function png(rgb, size = 96) {
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const band = y > size * 0.4 && y < size * 0.6;
    const o = y * (size * 3 + 1) + 1 + x * 3;
    raw[o] = band ? rgb[0] >> 1 : rgb[0]; raw[o + 1] = band ? rgb[1] >> 1 : rgb[1]; raw[o + 2] = band ? rgb[2] >> 1 : rgb[2];
  }
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const HEADER = ['name_en', 'name_ar', 'category', 'sku', 'barcode', 'price', 'sale_price', 'stock', 'image_url', 'description'];

// ── API helpers ────────────────────────────────────────────────────────────────────────────────
function client(api) {
  return async function call(method, path, body, token, raw) {
    const res = await fetch(api + path, {
      method,
      headers: { ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
    });
    if (raw) return res;
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${JSON.stringify(json)}`);
    return json.data;
  };
}

async function login(page, ui, email, password) {
  await page.goto(ui + '/login');
  await page.waitForLoadState('networkidle');
  await page.locator('form input[type=text]').first().fill(email);
  await page.locator('input[type=password]').fill(password);
  await Promise.all([
    page.waitForResponse(r => r.url().endsWith('/api/auth/login') && r.request().method() === 'POST'),
    page.locator('button[type=submit]').click(),
  ]);
  await page.waitForURL(u => new URL(u).pathname.startsWith('/dashboard') || new URL(u).pathname.startsWith('/staff'), { timeout: 30000 });
}

/** Pictures from this store's media that actually loaded (not just an <img> tag with a broken link). */
async function loadedImages(page, storeId) {
  return page.evaluate(id => [...document.images].filter(i => (i.currentSrc || i.src).includes(id) && i.complete && i.naturalWidth > 0).length, storeId);
}

async function openImport(page, ui, slug) {
  await page.goto(`${ui}/dashboard/${slug}/products`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Import Products' }).click();
  await page.getByRole('dialog', { name: 'Import products' }).waitFor();
}

async function uploadAndPreview(page, file, zipFile, existing) {
  const dlg = page.getByRole('dialog', { name: 'Import products' });
  await page.setInputFiles('[data-testid=import-file]', file);
  if (zipFile) await page.setInputFiles('[data-testid=import-images]', zipFile);
  if (existing) await dlg.getByLabel(existing).check();
  await Promise.all([
    page.waitForResponse(r => r.url().includes('/product-imports/preview')),
    dlg.getByRole('button', { name: 'Check file' }).click(),
  ]);
  await page.locator('[data-testid=import-preview-table]').waitFor();
  return dlg;
}

async function tiles(dlg) {
  const out = {};
  const all = dlg.locator('div.rounded-card.bg-white');
  for (let i = 0; i < await all.count(); i++) {
    const ps = all.nth(i).locator('p');
    out[(await ps.nth(0).innerText()).trim()] = Number((await ps.nth(1).innerText()).trim());
  }
  return out;
}

async function confirmImport(page, dlg) {
  await Promise.all([
    page.waitForResponse(r => r.url().includes('/confirm')),
    page.locator('[data-testid=import-confirm]').click(),
  ]);
  await page.locator('[data-testid=import-result]').waitFor();
  return tiles(dlg);
}

// ═════════════════════════════════════════════════════════════════════════════════════════════
if (cmd === 'setup') {
  const [api, backendLog, outPath] = args;
  if (!/^http:\/\/(localhost|127\.0\.0\.1):/.test(api)) throw new Error('Disposable localhost backend only');
  const call = client(api);
  const s = Date.now();
  const password = 'Import-disposable-only!42';
  const email = `import-owner-${s}@example.test`;
  const owner = await call('POST', '/api/auth/register', { fullName: 'Import Owner', email, password, phone: `+96279${String(s).slice(-7)}` });
  const token = owner.accessToken;
  const slug = `import-test-${s}`;
  const store = await call('POST', '/api/dashboard/stores', { name: 'Import Test Store', slug, categorySlug: 'general-store', templateKey: 'restaurant-default', currency: 'JOD', timezone: 'Asia/Amman', locale: 'en', status: 'DRAFT' }, token);
  const drinks = await call('POST', '/api/dashboard/categories', { storeId: store.id, nameEn: 'Drinks', nameAr: 'مشروبات', slug: 'drinks', categoryType: 'PRODUCT', sortOrder: 0, active: true }, token);
  // Two pictures uploaded the normal way; their public URLs go into the spreadsheet's image_url column.
  const up = async (bytes, name) => {
    const f = new FormData();
    f.append('file', new Blob([bytes], { type: 'image/png' }), name);
    return (await call('POST', `/api/dashboard/media/images?storeId=${store.id}`, f, token)).url;
  };
  const waterUrl = await up(png([70, 150, 230]), 'water.png');
  await call('PUT', '/api/dashboard/pos-pin', { currentPassword: password, pin: '4821' }, token);
  const device = await call('POST', '/api/dashboard/pos-devices', { storeId: store.id, name: 'Import Check Till' }, token);
  // A staff member with VIEW on products only (read-only): must not be able to import.
  const staffEmail = `import-staff-${s}@example.test`;
  await call('POST', '/api/dashboard/staff/invite', { storeId: store.id, email: staffEmail, fullName: 'Rana Readonly' }, token);
  const inviteToken = [...readFileSync(backendLog, 'utf8').matchAll(/DEV staff invite token for (\S+): (\S+)/g)].filter(m => m[1] === staffEmail).pop()?.[2];
  if (!inviteToken) throw new Error('no invite token in ' + backendLog);
  await call('POST', '/api/public/staff/accept-invite', { token: inviteToken, fullName: 'Rana Readonly', password });
  const staffList = await call('GET', `/api/dashboard/staff?storeId=${store.id}`, undefined, token);
  const staffId = (staffList.members ?? staffList.staff ?? staffList).find(m => m.email === staffEmail).id;
  await call('PUT', `/api/dashboard/staff/${staffId}/permissions`, { grants: [{ section: 'PRODUCTS', level: 'VIEW' }] }, token);

  const dir = outPath.replace(/[^/\\]+$/, '');
  mkdirSync(dir, { recursive: true });
  // The golden file. Coca Cola: pictures from the ZIP (by SKU, two of them). Water: a link. Burger: ZIP by barcode (no SKU cell match).
  writeFileSync(dir + 'products.xlsx', xlsx(HEADER, [
    ['Coca Cola 330ml', 'كوكا كولا ٣٣٠ مل', 'Drinks', 'COKE-330', '5449000000996', 0.75, '', 48, '', 'Chilled can'],
    ['Water 500ml', 'مياه ٥٠٠ مل', 'drinks', 'WATER-500', '6251234567890', 0.35, 0.3, 120, waterUrl, ''],
    ['Classic Burger', 'برجر كلاسيك', '', 'BURGER-1', '6291041500213', 5.25, '', 20, '', 'Beef, cheese'],
  ]));
  writeFileSync(dir + 'products-images.zip', zip([
    ['COKE-330.png', png([200, 30, 40])],
    ['COKE-330_2.png', png([240, 200, 40])],
    ['images/BURGER-1.png', png([160, 90, 40])],
    ['stray-file.png', png([0, 0, 0])],
  ]));
  writeFileSync(dir + 'products-updated.xlsx', xlsx(HEADER, [
    ['Coca Cola 330ml', '', '', 'COKE-330', '5449000000996', 0.8, '', 60, '', ''],
    ['Water 500ml', '', '', 'WATER-500', '6251234567890', 0.4, '', 100, '', ''],
    ['Classic Burger', '', '', 'BURGER-1', '6291041500213', 5.5, '', 25, '', ''],
  ]));
  writeFileSync(dir + 'products-with-errors.xlsx', xlsx(HEADER, [
    ['Tea', '', 'Hot Drinks', 'TEA-1', '1234567890128', 1.2, '', 10, '', ''],
    ['Bad Price', '', '', 'BAD-1', '', 'abc', '', '', '', ''],
    ['Dup A', '', '', 'DUP-A', '9999999999994', 1, '', '', '', ''],
    ['Dup B', '', '', 'DUP-B', '9999999999994', 1, '', -2, 'ftp://nope', ''],
  ]));
  writeFileSync(outPath, JSON.stringify({ api, email, password, token, storeId: store.id, slug, drinks: drinks.id, waterUrl, activationCode: device.activationCode, ownerPin: '4821', ownerName: 'Import Owner', staffEmail, dir }, null, 1));
  console.log(`setup: store ${slug}, category Drinks, device code ${device.activationCode}, read-only staff ${staffEmail}; files in ${dir}`);
}

if (cmd === 'import' || cmd === 'reimport' || cmd === 'storefront') {
  const [seedPath, ui, shots] = args;
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'));
  const call = client(seed.api);
  mkdirSync(shots, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const page = await context.newPage();
  const token = (await call('POST', '/api/auth/login', { email: seed.email, password: seed.password })).accessToken;
  const products = async () => call('GET', `/api/dashboard/products?storeId=${seed.storeId}`, undefined, token);
  await login(page, ui, seed.email, seed.password);

  if (cmd === 'import') {
    await openImport(page, ui, seed.slug);
    // 1. Template download.
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download template (.xlsx)' }).click()]);
    const templatePath = shots + '/downloaded-template.xlsx';
    await download.saveAs(templatePath);
    assert(download.suggestedFilename() === 'khangates-products-template.xlsx' && statSync(templatePath).size > 1000, `template downloaded (${download.suggestedFilename()}, ${statSync(templatePath).size} bytes)`);

    // 2. A file with problems: errors and warnings shown per row before anything is saved.
    let dlg = await uploadAndPreview(page, seed.dir + 'products-with-errors.xlsx');
    let t = await tiles(dlg);
    assert(t.Rows === 4 && t.Errors === 3 && t.Warnings === 1, `errors preview: ${JSON.stringify(t)}`);
    const table = page.locator('[data-testid=import-preview-table]');
    assert(await table.getByText('Bad Price').count() === 1 && await table.getByText(/is not a number/).count() === 1, 'invalid price explained on its row');
    assert(await table.getByText(/appears on rows 4, 5 of this file/).count() === 2, 'duplicate barcode names both rows');
    assert(await table.getByText(/No category "Hot Drinks"/).count() === 1, 'unknown category is a warning');
    await page.screenshot({ path: shots + '/01-preview-errors.png', fullPage: false });
    assert((await products()).length === 0, 'a preview saved nothing');
    await dlg.getByRole('button', { name: 'Change file or options' }).click();

    // 3. The golden file + pictures ZIP.
    dlg = await uploadAndPreview(page, seed.dir + 'products.xlsx', seed.dir + 'products-images.zip');
    t = await tiles(dlg);
    assert(t.Rows === 3 && t.Valid === 3 && t.Errors === 0 && t['New products'] === 3, `golden preview: ${JSON.stringify(t)}`);
    assert(await table.getByText('2 from ZIP').count() === 1 && await table.getByText('1 link').count() === 1 && await table.getByText('1 from ZIP').count() === 1, 'pictures matched per row');
    assert(await dlg.getByText(/stray-file.png/).count() === 1, 'unused ZIP file reported');
    await page.screenshot({ path: shots + '/02-preview-golden.png' });
    const result = await confirmImport(page, dlg);
    assert(result.Created === 3 && result.Failed === 0 && result['Pictures attached'] === 4, `import result: ${JSON.stringify(result)}`);
    await page.screenshot({ path: shots + '/03-import-result.png' });
    const [report] = await Promise.all([page.waitForEvent('download'), dlg.getByRole('button', { name: 'Download report (CSV)' }).click()]);
    await report.saveAs(shots + '/import-report.csv');
    assert(readFileSync(shots + '/import-report.csv', 'utf8').includes('CREATED'), `report downloaded (${report.suggestedFilename()})`);
    await dlg.getByRole('button', { name: 'Done' }).click();

    // 4. Dashboard: the products are ordinary products.
    await page.getByText('Coca Cola 330ml').first().waitFor();
    for (const n of ['Coca Cola 330ml', 'Water 500ml', 'Classic Burger']) assert(await page.getByText(n).count() > 0, `dashboard lists ${n}`);
    await page.screenshot({ path: shots + '/04-dashboard-products.png' });
    const list = await products();
    const bySku = Object.fromEntries(list.map(p => [p.sku, p]));
    assert(list.length === 3, '3 products in the store');
    assert(bySku['COKE-330'].nameAr === 'كوكا كولا ٣٣٠ مل' && bySku['COKE-330'].barcode === '5449000000996' && bySku['COKE-330'].stock === 48
      && bySku['COKE-330'].price === 0.75 && bySku['COKE-330'].categoryId === seed.drinks, 'Coca Cola: Arabic name, barcode, stock 48, price 0.750, category Drinks');
    assert(bySku['WATER-500'].salePrice === 0.3 && bySku['WATER-500'].imageUrl === seed.waterUrl, 'Water: sale price, linked picture');
    assert(bySku['BURGER-1'].categoryId === undefined && bySku['BURGER-1'].stock === 20, 'Burger: uncategorized, stock 20');
    assert(bySku['COKE-330'].images.length === 2 && bySku['COKE-330'].images[0].url.includes('/media/'), `Coca Cola gallery: ${bySku['COKE-330'].images.length} pictures from the ZIP`);
    // The editor shows the gallery.
    await page.goto(`${ui}/dashboard/${seed.slug}/products/${bySku['COKE-330'].id}`);
    await page.waitForLoadState('networkidle');
    const imagesTab = page.getByRole('tab', { name: /images|pictures|photos/i });
    if (await imagesTab.count()) await imagesTab.first().click();
    await page.waitForTimeout(800);
    const galleryImgs = await loadedImages(page, seed.storeId);
    assert(galleryImgs >= 2, `product editor shows the imported pictures (${galleryImgs} loaded <img> from /media)`);
    await page.screenshot({ path: shots + '/05-dashboard-editor-images.png' });

  }

  if (cmd === 'import' || cmd === 'storefront') {
    // 5. Storefront (published): names and pictures.
    const store = (await call('GET', '/api/dashboard/stores/my', undefined, token)).find(s => s.id === seed.storeId);
    await call('PUT', `/api/dashboard/stores/${seed.storeId}`, { name: store.name, slug: store.slug, categorySlug: 'general-store', templateKey: 'restaurant-default', currency: 'JOD', status: 'ACTIVE' }, token);
    const pub = await call('GET', `/api/public/stores/${seed.slug}/products`);
    assert(pub.length === 3 && pub.find(p => p.sku === 'COKE-330' || p.nameEn === 'Coca Cola 330ml').imageUrl.includes('/media/'), 'public storefront API serves the 3 products with pictures');
    await page.goto(`${ui}/store/${seed.slug}`);
    await page.waitForLoadState('networkidle');
    await page.locator('text=Coca Cola 330ml >> visible=true').first().waitFor({ timeout: 30000 });
    for (const n of ['Coca Cola 330ml', 'Water 500ml', 'Classic Burger']) assert(await page.locator(`text=${n} >> visible=true`).count() > 0, `storefront shows ${n}`);
    await page.waitForTimeout(1500);
    const storefrontImgs = await loadedImages(page, seed.storeId);
    assert(storefrontImgs >= 3, `storefront renders the imported pictures (${storefrontImgs} loaded <img>)`);
    await page.screenshot({ path: shots + '/06-storefront.png', fullPage: true });
  }

  if (cmd === 'reimport') {
    const before = await products();
    const galleryBefore = Object.fromEntries(before.map(p => [p.sku, p.images.length]));
    // Same file, SKIP (default): nothing new.
    await openImport(page, ui, seed.slug);
    let dlg = await uploadAndPreview(page, seed.dir + 'products.xlsx', seed.dir + 'products-images.zip');
    let t = await tiles(dlg);
    assert(t['Existing matched'] === 3 && t['New products'] === 0, `re-upload preview: ${JSON.stringify(t)}`);
    const skipButton = page.locator('[data-testid=import-confirm]');
    assert(await skipButton.isDisabled() && (await skipButton.innerText()).trim() === 'Nothing to import', 'SKIP: every row matched and is skipped; nothing to import');
    assert(await page.locator('[data-testid=import-preview-table]').getByText(/by SKU — skipped|by barcode — skipped/).count() === 3, 'each row says which product it matched and that it is skipped');
    await page.screenshot({ path: shots + '/07-reimport-skip.png' });
    assert((await products()).length === 3, 'still 3 products (no duplicates)');
    await dlg.getByRole('button', { name: 'Change file or options' }).click();
    await page.setInputFiles('[data-testid=import-images]', []);

    // Changed prices/stock, UPDATE.
    dlg = await uploadAndPreview(page, seed.dir + 'products-updated.xlsx', null, 'Update existing');
    t = await tiles(dlg);
    assert(t['Existing matched'] === 3, `update preview: ${JSON.stringify(t)}`);
    let r = await confirmImport(page, dlg);
    assert(r.Updated === 3 && r.Created === 0 && r.Failed === 0, `UPDATE result: ${JSON.stringify(r)}`);
    await page.screenshot({ path: shots + '/08-reimport-update.png' });
    const after = await products();
    const s = Object.fromEntries(after.map(p => [p.sku, p]));
    assert(after.length === 3, 'still 3 products');
    assert(s['COKE-330'].price === 0.8 && s['COKE-330'].stock === 60 && s['WATER-500'].price === 0.4 && s['WATER-500'].stock === 100
      && s['BURGER-1'].price === 5.5 && s['BURGER-1'].stock === 25, 'prices and stock updated');
    assert(s['COKE-330'].nameAr === 'كوكا كولا ٣٣٠ مل' && s['COKE-330'].categoryId === seed.drinks && s['WATER-500'].salePrice === 0.3,
      'empty cells kept the Arabic name, category and sale price');
    assert(Object.entries(galleryBefore).every(([sku, n]) => s[sku].images.length === n), `no duplicate pictures: ${JSON.stringify(Object.fromEntries(after.map(p => [p.sku, p.images.length])))}`);
    const history = await call('GET', `/api/dashboard/inventory/history?storeId=${seed.storeId}&productId=${s['COKE-330'].id}`, undefined, token);
    assert(history[0].reason === 'CORRECTION' && history[0].delta === 12, `stock change in the ledger: ${history[0].reason} ${history[0].delta}`);

    // Permissions: read-only staff sees no import and is refused by the API.
    const staffPage = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
    await login(staffPage, ui, seed.staffEmail, seed.password);
    await staffPage.goto(`${ui}/dashboard/${seed.slug}/products`);
    await staffPage.waitForLoadState('networkidle');
    await staffPage.getByText('Coca Cola 330ml').first().waitFor({ timeout: 30000 });
    assert(await staffPage.getByRole('button', { name: 'Import Products' }).count() === 0, 'read-only staff: no Import Products button');
    await staffPage.screenshot({ path: shots + '/09-readonly-staff.png' });
    const staffToken = (await call('POST', '/api/auth/login', { email: seed.staffEmail, password: seed.password })).accessToken;
    const f = new FormData();
    f.append('storeId', seed.storeId);
    f.append('file', new Blob([readFileSync(seed.dir + 'products.xlsx')]), 'products.xlsx');
    const denied = await call('POST', '/api/dashboard/product-imports/preview', f, staffToken, true);
    assert(denied.status === 403, `read-only staff preview -> ${denied.status}`);
  }
  await browser.close();
  console.log(`${cmd}: PASS`);
}
