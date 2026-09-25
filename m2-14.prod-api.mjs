// M2-14 security/trust validation against a backend running the *prod* profile over TLS
// (disposable PostgreSQL, self-signed cert). Real HTTP; raw Set-Cookie / CORS / HSTS headers are read.
// Usage: NODE_TLS_REJECT_UNAUTHORIZED=0 M214_API=https://localhost:18443 M214_PG_DB=... node m2-14.prod-api.mjs
import assert from 'node:assert/strict';
import { createHmac, createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const api = process.env.M214_API || 'https://localhost:18443';
const pgDb = process.env.M214_PG_DB || 'khangates_m214_prod';
const origin = process.env.M214_ORIGIN || 'https://shop.khangates.test';
assert(new URL(api).hostname === 'localhost', 'Disposable localhost backend required');
const s = Date.now();
const password = 'M214-disposable-only!42';
const results = [];
const secretsSeen = new Set(); // raw tokens that must never appear in logs/bodies
async function step(name, fn) {
  try { const note = await fn(); results.push({ step: name, result: 'PASS', note: note ?? '' }); console.log(`PASS ${name}${note ? ` — ${note}` : ''}`); }
  catch (e) { results.push({ step: name, result: 'FAIL', note: String(e.message).split('\n')[0].slice(0, 300) }); console.log(`FAIL ${name} — ${String(e.message).slice(0, 900).replace(/\n/g, ' | ')} @ ${(String(e.stack).split('\n').find(l => l.includes('m2-14.prod-api')) ?? '').trim()}`); }
}
const png1x1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function http(method, path, { token, body, headers = {}, cookie, raw } = {}) {
  const res = await fetch(api + path, {
    method, redirect: 'manual',
    headers: { ...(body !== undefined && !raw ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(cookie ? { Cookie: cookie } : {}), ...headers },
    ...(raw ? { body: raw } : body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let json = null; try { json = JSON.parse(text); } catch { /* csv or empty */ }
  return { status: res.status, json, text, headers: res.headers, setCookies: res.headers.getSetCookie() };
}
// Waits out a route window only where the test is not about rate limiting.
async function ok(method, path, opts = {}, expected = [200, 201]) {
  let r = await http(method, path, opts);
  for (let i = 0; r.status === 429 && i < 3; i++) { await sleep(61_000); r = await http(method, path, opts); }
  assert(expected.includes(r.status), `${method} ${path} -> ${r.status} ${r.text.slice(0, 200)}`);
  return r.json?.data ?? r.json;
}
const denied = async (label, method, path, opts) => {
  const r = await http(method, path, opts);
  assert([401, 403, 404].includes(r.status), `${label}: ${method} ${path} expected denial, got ${r.status} ${r.text.slice(0, 160)}`);
  return r.status;
};
const psql = sql => execFileSync('docker', ['exec', 'khangates-m2-validation', 'psql', '-U', 'm2_test', '-d', pgDb, '-At', '-v', 'ON_ERROR_STOP=1', '-c', sql], { encoding: 'utf8' }).trim();
const cookieOf = (setCookies, name) => setCookies.find(c => c.startsWith(name + '='));
const cookiePair = header => header.split(';')[0];
const attrs = header => Object.fromEntries(header.split(';').slice(1).map(p => p.trim().split('=')).map(([k, v]) => [k.toLowerCase(), v ?? true]));
const num = Number;
const day = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const allOpen = { days: day.map(d => ({ dayOfWeek: d, closed: false, open24Hours: true, openTime: null, closeTime: null })) };
const allClosed = { days: day.map(d => ({ dayOfWeek: d, closed: true, open24Hours: false, openTime: null, closeTime: null })) };
function totp(secret) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bits = [...secret.replace(/=+$/, '')].map(c => alphabet.indexOf(c).toString(2).padStart(5, '0')).join('');
  const key = Buffer.from(bits.match(/.{8}/g).map(b => parseInt(b, 2)));
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const d = createHmac('sha1', key).update(counter).digest();
  const o = d[d.length - 1] & 15;
  return String((d.readUInt32BE(o) & 0x7fffffff) % 1000000).padStart(6, '0');
}
const noLeak = (label, text) => {
  for (const bad of ['Exception', '\tat ', 'at com.byonix', 'org.hibernate', 'org.springframework', 'SQLState', 'select ', 'insert into', 'jdbc:', 'stackTrace', 'trace']) {
    assert(!text.includes(bad), `${label} leaks "${bad}": ${text.slice(0, 200)}`);
  }
  for (const secret of secretsSeen) assert(!text.includes(secret), `${label} leaks a token`);
};

// ── 1. production config / platform headers ─────────────────────────────────────────────────────
await step('Prod platform: HSTS on TLS (no preload), security headers, health only, Swagger/OpenAPI/extra actuator blocked', async () => {
  const h = await http('GET', '/actuator/health');
  assert.equal(h.status, 200);
  const hsts = h.headers.get('strict-transport-security');
  assert.match(hsts, /max-age=31536000/); assert.match(hsts, /includeSubDomains/); assert(!/preload/i.test(hsts), 'preload must be off');
  assert.equal(h.headers.get('x-frame-options'), 'DENY'); assert.equal(h.headers.get('x-content-type-options'), 'nosniff');
  assert.deepEqual(Object.keys(h.json), ['groups', 'status'], 'health must not show details');
  const blocked = {};
  for (const p of ['/swagger-ui.html', '/swagger-ui/index.html', '/v3/api-docs', '/v3/api-docs/swagger-config', '/actuator', '/actuator/env', '/actuator/beans',
    '/actuator/configprops', '/actuator/heapdump', '/actuator/loggers', '/actuator/mappings', '/actuator/metrics', '/actuator/threaddump', '/actuator/health/db']) {
    const r = await http('GET', p);
    blocked[p] = r.status;
    assert([401, 403, 404].includes(r.status), `${p} -> ${r.status}`);
    assert(!r.text.includes('"openapi"') && !r.text.includes('swagger-ui') && !r.text.includes('"propertySources"'), `${p} exposes docs/config`);
  }
  const probes = [await http('GET', '/actuator/health/liveness'), await http('GET', '/actuator/health/readiness')];
  return `HSTS "${hsts}"; ${Object.entries(blocked).map(([p, c]) => `${p}=${c}`).join(' ')}; probes ${probes.map(p => p.status).join('/')}`;
});

await step('CORS: exact HTTPS origin allowed with credentials, unknown/HTTP/wildcard-style origins get no CORS grant', async () => {
  const pre = o => http('OPTIONS', '/api/auth/login', { headers: { Origin: o, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' } });
  const good = await pre(origin);
  assert.equal(good.status, 200); assert.equal(good.headers.get('access-control-allow-origin'), origin);
  assert.equal(good.headers.get('access-control-allow-credentials'), 'true');
  const notes = [];
  for (const o of ['https://evil.example', 'http://shop.khangates.test', 'https://shop.khangates.test.evil.example', 'http://localhost:3000', 'null', '*']) {
    const r = await pre(o);
    assert.notEqual(r.status, 200, `${o} preflight must fail`);
    assert.equal(r.headers.get('access-control-allow-origin'), null, `${o} got ACAO`);
    notes.push(`${o}=${r.status}`);
  }
  const simple = await http('GET', '/actuator/health', { headers: { Origin: 'https://evil.example' } });
  assert.equal(simple.headers.get('access-control-allow-origin'), null);
  const simpleGood = await http('GET', '/actuator/health', { headers: { Origin: origin } });
  assert.notEqual(simpleGood.headers.get('access-control-allow-origin'), '*');
  return notes.join(' ');
});

// ── accounts (single IP: 5 merchant + 5 customer registrations per 5 min) ───────────────────────
let phoneSeq = 10;
const regMerchant = async label => {
  const email = `m214-${label}-${s}@example.test`;
  const send = () => http("POST", "/api/auth/register", { body: { fullName: `M214 ${label}`, email, password, phone: `+96279${String(s).slice(-5)}${++phoneSeq}` }, headers: { Origin: origin } });
  let r = await send(); for (let i = 0; r.status === 429 && i < 6; i++) { await sleep(61_000); r = await send(); }
  assert.equal(r.status, 200, `register ${label}: ${r.status} ${r.text.slice(0, 200)}`);
  assert.equal(r.json.data.refreshToken, undefined, 'prod must not return refresh token in JSON');
  const c = cookieOf(r.setCookies, 'shoplink_refresh'); assert(c, 'refresh cookie set on register');
  secretsSeen.add(cookiePair(c).split('=')[1]);
  return { ...r.json.data, email, token: r.json.data.accessToken, cookie: cookiePair(c) };
};
const regCustomer = async label => {
  const email = `m214-${label}-${s}@example.test`;
  const send = () => http("POST", "/api/public/auth/register", { body: { fullName: `M214 ${label}`, email, password } });
  let r = await send(); for (let i = 0; r.status === 429 && i < 6; i++) { await sleep(61_000); r = await send(); }
  assert.equal(r.status, 200, `register ${label}: ${r.status} ${r.text.slice(0, 200)}`);
  assert.equal(r.json.data.refreshToken, undefined);
  const c = cookieOf(r.setCookies, 'shoplink_customer_refresh'); assert(c);
  secretsSeen.add(cookiePair(c).split('=')[1]);
  return { ...r.json.data, email, token: r.json.data.accessToken, cookie: cookiePair(c), id: r.json.data.user.id };
};
const A = await regMerchant('merchant-a');
const B = await regMerchant('merchant-b');
const L = await regMerchant('lockme');
const C1 = await regCustomer('customer-1');
const C2 = await regCustomer('customer-2');
const SA = await regCustomer('super-admin');
const RO = await regCustomer('readonly-admin');

// ── cookie + merchant auth ──────────────────────────────────────────────────────────────────────
let merchantCookie;
await step('Merchant auth: login -> dashboard; HttpOnly+Secure+SameSite=Strict+Path=/ cookie (7d); rotate on refresh; replay/invalid rejected; logout clears + revokes', async () => {
  const r = await http('POST', '/api/auth/login', { body: { email: A.email, password }, headers: { Origin: origin } });
  assert.equal(r.status, 200); assert.equal(r.json.data.refreshToken, undefined);
  const c = cookieOf(r.setCookies, 'shoplink_refresh'); assert(c, 'refresh cookie');
  const a = attrs(c);
  assert(a.httponly && a.secure, `flags ${c.replace(/=[^;]+/, '=<redacted>')}`); assert.equal(a.samesite, 'Strict'); assert.equal(a.path, '/'); assert.equal(a['max-age'], String(7 * 86400));
  const token = r.json.data.accessToken; merchantCookie = cookiePair(c); secretsSeen.add(merchantCookie.split('=')[1]);
  await ok('GET', '/api/dashboard/stores/my', { token });
  assert.equal((await http('POST', '/api/auth/refresh', { body: { refreshToken: merchantCookie.split('=')[1] } })).status, 401, 'body refresh token must be ignored in COOKIE mode');
  const ref = await http('POST', '/api/auth/refresh', { cookie: merchantCookie });
  assert.equal(ref.status, 200, `cookie refresh ${ref.status}`); assert.equal(ref.json.data.refreshToken, undefined);
  const rotated = cookiePair(cookieOf(ref.setCookies, 'shoplink_refresh')); assert.notEqual(rotated, merchantCookie, 'refresh cookie must rotate');
  secretsSeen.add(rotated.split('=')[1]);
  assert.equal((await http('POST', '/api/auth/refresh', { cookie: merchantCookie })).status, 401, 'replayed rotated cookie rejected');
  assert.equal((await http('POST', '/api/auth/refresh', { cookie: 'shoplink_refresh=not-a-real-token' })).status, 401, 'garbage cookie rejected');
  assert.equal((await http('POST', '/api/auth/refresh', {})).status, 401, 'no cookie rejected');
  // replay detection revokes the family: re-login for a clean session
  const r2 = await http('POST', '/api/auth/login', { body: { email: A.email, password } });
  const c2 = cookiePair(cookieOf(r2.setCookies, 'shoplink_refresh')); secretsSeen.add(c2.split('=')[1]);
  const t2 = r2.json.data.accessToken;
  const out = await http('POST', '/api/auth/logout', { token: t2, cookie: c2 });
  assert.equal(out.status, 200);
  const cleared = cookieOf(out.setCookies, 'shoplink_refresh'); assert(cleared, 'logout clears cookie');
  assert.equal(attrs(cleared)['max-age'], '0'); assert(attrs(cleared).httponly && attrs(cleared).secure); assert.equal(attrs(cleared).samesite, 'Strict');
  assert.equal((await http('POST', '/api/auth/refresh', { cookie: c2 })).status, 401, 'refresh after logout rejected');
  const after = await http('GET', '/api/dashboard/stores/my', { token: t2 });
  // logout-all bumps tokenVersion: every access token of the account stops working immediately
  const lTok = L.token;
  assert.equal((await http('GET', '/api/dashboard/stores/my', { token: lTok })).status, 200);
  assert.equal((await http('POST', '/api/auth/logout-all', { token: lTok, cookie: L.cookie })).status, 200);
  assert.equal((await http('GET', '/api/dashboard/stores/my', { token: lTok })).status, 401, 'access token dead after logout-all');
  assert.equal((await http('POST', '/api/auth/refresh', { cookie: L.cookie })).status, 401, 'refresh dead after logout-all');
  A.token = (await http('POST', '/api/auth/refresh', { cookie: rotated })).json?.data?.accessToken ?? A.token;
  return `single-session logout: refresh revoked, cookie cleared, access JWT still ${after.status} until expiry (<=15 min); logout-all: access 401 + refresh 401; replayed refresh 401`;
});

await step('Customer auth: HttpOnly+Secure+Strict cookie (30d); cookie refresh; profile/history protected; logout revokes', async () => {
  const r = await http('POST', '/api/public/auth/login', { body: { email: C1.email, password } });
  assert.equal(r.status, 200); assert.equal(r.json.data.refreshToken, undefined);
  const c = cookieOf(r.setCookies, 'shoplink_customer_refresh'); const a = attrs(c);
  assert(a.httponly && a.secure); assert.equal(a.samesite, 'Strict'); assert.equal(a['max-age'], String(30 * 86400));
  const cp = cookiePair(c); secretsSeen.add(cp.split('=')[1]);
  assert.equal((await http('GET', '/api/public/customers/me', { token: 'expired-or-garbage' })).status, 401, 'bad access -> 401 so the client refreshes');
  const ref = await http('POST', '/api/public/auth/refresh', { cookie: cp });
  assert.equal(ref.status, 200); assert.equal(ref.json.data.refreshToken, undefined);
  const newCookie = cookiePair(cookieOf(ref.setCookies, 'shoplink_customer_refresh')); secretsSeen.add(newCookie.split('=')[1]);
  const tok = ref.json.data.accessToken;
  assert.equal((await ok('GET', '/api/public/customers/me', { token: tok })).email, C1.email);
  await ok('GET', '/api/public/customers/me/orders', { token: tok });
  assert.equal((await http('POST', '/api/public/auth/refresh', { cookie: merchantCookie.replace('shoplink_refresh', 'shoplink_customer_refresh') })).status, 401, 'merchant token is not a customer refresh token');
  const out = await http('POST', '/api/public/auth/logout', { token: tok, cookie: newCookie });
  assert.equal(out.status, 200); assert.equal(attrs(cookieOf(out.setCookies, 'shoplink_customer_refresh'))['max-age'], '0');
  assert.equal((await http('POST', '/api/public/auth/refresh', { cookie: newCookie })).status, 401);
  assert.equal((await http('GET', '/api/public/customers/me')).status, 401, 'guest cannot read profile');
  assert.equal((await http('GET', '/api/public/customers/me/orders')).status, 401, 'guest cannot read history');
  C1.token = (await ok('POST', '/api/public/auth/login', { body: { email: C1.email, password } })).accessToken;
});

await step('Admin: customer/merchant tokens cannot reach admin; customer creds refused on admin login; SUPER_ADMIN needs real TOTP (no dev bypass), 1d scoped cookie; READ_ONLY_ADMIN denied SUPER_ADMIN actions; admin token not a merchant/customer', async () => {
  for (const [who, t] of [['customer', C1.token], ['merchant', A.token]]) {
    await denied(`${who}->admin`, 'GET', '/api/admin/security/login-attempts', { token: t });
    await denied(`${who}->admin me`, 'GET', '/api/admin/auth/me', { token: t });
    await denied(`${who}->block-ip`, 'POST', '/api/admin/security/block-ip', { token: t, body: { ipAddress: '203.0.113.9', reason: 'x' } });
  }
  const custAdminLogin = await http('POST', '/api/admin/auth/login', { body: { email: C1.email, password } });
  assert.notEqual(custAdminLogin.status, 200, 'customer credentials must not log into admin');
  // a forged token claiming SUPER_ADMIN (unsigned / tampered)
  const [hdr, payload] = C1.token.split('.');
  const claims = JSON.parse(Buffer.from(payload, 'base64url')); claims.role = 'SUPER_ADMIN'; claims.roles = ['ROLE_SUPER_ADMIN'];
  const tampered = `${hdr}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.${C1.token.split('.')[2]}`;
  const none = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.`;
  assert.equal((await http('GET', '/api/admin/auth/me', { token: tampered })).status, 401, 'tampered JWT');
  assert.equal((await http('GET', '/api/admin/auth/me', { token: none })).status, 401, 'alg=none JWT');
  psql(`UPDATE app_users SET role='SUPER_ADMIN' WHERE id='${SA.id}'; UPDATE app_users SET role='READ_ONLY_ADMIN' WHERE id='${RO.id}'`);
  const adminLogin = async (u) => {
    const r = await http('POST', '/api/admin/auth/login', { body: { email: u.email, password } });
    assert.equal(r.status, 200, `admin login ${r.status} ${r.text.slice(0, 120)}`);
    if (!r.json.data.mfaRequired) return r;
    const ch = r.json.data.mfaChallengeToken;
    const setup = await ok('POST', '/api/admin/auth/mfa/setup', { body: { mfaChallengeToken: ch } });
    assert.equal((await http('POST', '/api/admin/auth/mfa/verify', { body: { mfaChallengeToken: ch, mfaCode: '000000' } })).status, 401, 'dev MFA bypass disabled');
    return http('POST', '/api/admin/auth/mfa/verify', { body: { mfaChallengeToken: ch, mfaCode: totp(setup.secret) } });
  };
  const sa = await adminLogin(SA);
  assert.equal(sa.status, 200); assert.equal(sa.json.data.refreshToken, undefined);
  const sac = cookieOf(sa.setCookies, 'shoplink_admin_refresh'); assert(sac);
  assert(attrs(sac).httponly && attrs(sac).secure); assert.equal(attrs(sac).samesite, 'Strict'); assert.equal(attrs(sac)['max-age'], String(86400));
  secretsSeen.add(cookiePair(sac).split('=')[1]);
  const saTok = sa.json.data.accessToken;
  await ok('GET', '/api/admin/auth/me', { token: saTok });
  await ok('GET', '/api/admin/security/login-attempts', { token: saTok });
  assert.equal(await denied('admin->dashboard', 'GET', '/api/dashboard/stores/my', { token: saTok }), 403, 'valid admin token on dashboard is a role denial (403), not 401');
  assert.equal(await denied('admin->customer', 'GET', '/api/public/customers/me', { token: saTok }), 403, 'role denial is 403');
  assert.equal((await http('POST', '/api/auth/refresh', { cookie: cookiePair(sac).replace('shoplink_admin_refresh', 'shoplink_refresh') })).status, 401, 'admin refresh token not usable as merchant');
  const ro = await adminLogin(RO);
  assert.equal(ro.status, 200);
  assert.equal(ro.json.data.mfaRequired, false); assert.equal(ro.json.data.auth.refreshToken, undefined);
  const roTok = ro.json.data.auth.accessToken; // non-MFA admin login nests the session under data.auth (lib/api/admin-auth.ts)
  const roMe = await http('GET', '/api/admin/auth/me', { token: roTok });
  assert.equal(roMe.status, 200, `READ_ONLY_ADMIN session must be valid (keys ${Object.keys(ro.json.data)}; me ${roMe.status} ${roMe.text.slice(0, 120)})`);
  const roNotes = [];
  for (const [m, p, b] of [['POST', '/api/admin/security/block-ip', { ipAddress: '203.0.113.9', reason: 'm214', permanent: false }], ['POST', `/api/admin/security/users/${C1.user.id}/unlock`], ['POST', `/api/admin/security/users/${C1.user.id}/force-password-reset`]]) {
    roNotes.push(await denied('read-only admin', m, p, { token: roTok, body: b }));
  }
  const out = await http('POST', '/api/admin/auth/logout', { token: saTok, cookie: cookiePair(sac) });
  assert.equal(attrs(cookieOf(out.setCookies, 'shoplink_admin_refresh'))['max-age'], '0');
  assert.equal((await http('POST', '/api/admin/auth/refresh', { cookie: cookiePair(sac) })).status, 401);
  return `SUPER_ADMIN MFA=${sa.json.data.mfaRequired ?? 'completed'}; READ_ONLY write actions -> ${roNotes.join('/')}`;
});

// ── merchant setup (store A + store B) ──────────────────────────────────────────────────────────
const slugA = `m214-grill-${s}`, slugB = `m214-other-${s}`;
const bodyA = { name: 'Trust Grill', slug: slugA, categorySlug: 'general-store', templateKey: 'restaurant-default', currency: 'JOD', timezone: 'Asia/Amman', locale: 'en',
  pickupAvailable: true, freeDeliveryThreshold: 50, whatsappNumber: '+962790001414', phone: '+962790001415', email: 'store-a@example.test' };
const bodyB = { name: 'Other Grill', slug: slugB, categorySlug: 'general-store', templateKey: 'restaurant-default', currency: 'JOD', pickupAvailable: false };
const F = {};
await step('Setup two merchants: stores, category, stock product with add-on, variants, zones, hours, offers, slots, publish', async () => {
  F.storeA = await ok('POST', '/api/dashboard/stores', { token: A.token, body: bodyA });
  F.catA = await ok('POST', '/api/dashboard/categories', { token: A.token, body: { storeId: F.storeA.id, nameEn: 'Mains', slug: 'mains', categoryType: 'PRODUCT', sortOrder: 0, active: true } });
  F.burger = await ok('POST', '/api/dashboard/products', { token: A.token, body: { storeId: F.storeA.id, categoryId: F.catA.id, nameEn: 'Trust Burger', slug: 'trust-burger', price: 5.25, sortOrder: 0, stock: 10 } });
  await ok('PUT', `/api/dashboard/products/${F.burger.id}/modifier-groups`, { token: A.token, body: { groups: [{ name: 'Extras', minSelect: 0, maxSelect: 2, options: [{ name: 'Cheese', priceDelta: 0.5, preselected: false, available: true }] }] } });
  F.cheese = (await ok('GET', `/api/dashboard/products/${F.burger.id}/modifier-groups`, { token: A.token }))[0].options[0].id;
  F.shake = await ok('POST', '/api/dashboard/products', { token: A.token, body: { storeId: F.storeA.id, categoryId: F.catA.id, nameEn: 'Trust Shake', slug: 'trust-shake', price: 3, sortOrder: 1 } });
  await ok('PUT', `/api/dashboard/products/${F.shake.id}/variants`, { token: A.token, body: { options: [{ name: 'Size', values: [{ label: 'S' }, { label: 'M' }] }],
    variants: [{ selection: ['S'], sku: `TS-S-${s}`, price: 3, stock: 5, available: true }, { selection: ['M'], sku: `TS-M-${s}`, price: 3.5, stock: 5, available: true }] } });
  F.shakeM = (await ok('GET', `/api/dashboard/products/${F.shake.id}/variants`, { token: A.token })).variants.find(v => v.label === 'M').id;
  F.water = await ok('POST', '/api/dashboard/products', { token: A.token, body: { storeId: F.storeA.id, categoryId: F.catA.id, nameEn: 'Still Water', slug: 'still-water', price: 1, sortOrder: 2 } });
  F.zoneA = await ok('POST', '/api/dashboard/delivery-zones', { token: A.token, body: { storeId: F.storeA.id, name: 'Downtown', areas: ['Abdali'], minOrder: 5, deliveryFee: 2.5, estimatedTime: '30 min', isActive: true, sortOrder: 0 } });
  F.zoneOff = await ok('POST', '/api/dashboard/delivery-zones', { token: A.token, body: { storeId: F.storeA.id, name: 'Closed zone', minOrder: 0, deliveryFee: 1, isActive: false, sortOrder: 1 } });
  await ok('PUT', `/api/dashboard/stores/${F.storeA.id}/business-hours`, { token: A.token, body: allOpen });
  F.offerA = await ok('POST', '/api/dashboard/offers', { token: A.token, body: { storeId: F.storeA.id, code: 'TRUST10', discountType: 'PERCENTAGE', discountValue: 10, active: true } });
  F.slotA = await ok('POST', '/api/dashboard/appointment-slots', { token: A.token, body: { storeId: F.storeA.id, startsAt: new Date(Date.now() + 2 * 864e5).toISOString(), endsAt: new Date(Date.now() + 2 * 864e5 + 36e5).toISOString(), capacity: 3, active: true } });
  await ok('PUT', `/api/dashboard/stores/${F.storeA.id}`, { token: A.token, body: { ...bodyA, status: 'ACTIVE' } });

  F.storeB = await ok('POST', '/api/dashboard/stores', { token: B.token, body: bodyB });
  F.catB = await ok('POST', '/api/dashboard/categories', { token: B.token, body: { storeId: F.storeB.id, nameEn: 'B cat', slug: 'b-cat', categoryType: 'PRODUCT', sortOrder: 0, active: true } });
  F.prodB = await ok('POST', '/api/dashboard/products', { token: B.token, body: { storeId: F.storeB.id, categoryId: F.catB.id, nameEn: 'B Burger', slug: 'b-burger', price: 4, sortOrder: 0, stock: 20 } });
  F.zoneB = await ok('POST', '/api/dashboard/delivery-zones', { token: B.token, body: { storeId: F.storeB.id, name: 'B zone', minOrder: 0, deliveryFee: 0.5, isActive: true, sortOrder: 0 } });
  F.offerB = await ok('POST', '/api/dashboard/offers', { token: B.token, body: { storeId: F.storeB.id, code: 'BONLY', discountType: 'PERCENTAGE', discountValue: 50, active: true } });
  F.slotB = await ok('POST', '/api/dashboard/appointment-slots', { token: B.token, body: { storeId: F.storeB.id, startsAt: new Date(Date.now() + 3 * 864e5).toISOString(), endsAt: new Date(Date.now() + 3 * 864e5 + 36e5).toISOString(), capacity: 2, active: true } });
  await ok('PUT', `/api/dashboard/stores/${F.storeB.id}`, { token: B.token, body: { ...bodyB, status: 'ACTIVE' } });
  F.orderB = await ok('POST', `/api/public/stores/${slugB}/orders`, { body: { customerName: 'B guest', customerPhone: '+962790009999', customerEmail: 'bguest@example.test', deliveryMethod: 'DELIVERY', customerAddress: 'x', deliveryZoneId: F.zoneB.id, paymentMethod: 'CASH', items: [{ productId: F.prodB.id, quantity: 1 }] } });
  F.apptB = await ok('POST', `/api/public/stores/${slugB}/appointments`, { token: C2.token, body: { slotId: F.slotB.id, customerName: 'C2', customerPhone: '+962790008888' } });
  return `A=${slugA} B=${slugB}`;
});

const order = (extra, items) => ({ customerName: 'API Buyer', customerPhone: '+962790002222', customerEmail: 'buyer@example.test', paymentMethod: 'CASH', deliveryMethod: 'PICKUP', items, ...extra });
const stockOf = async () => (await ok('GET', `/api/dashboard/products/${F.burger.id}`, { token: A.token })).stock;
const placeA = (extra, items, token) => http('POST', `/api/public/stores/${slugA}/orders`, { token, body: order(extra, items) });
let publicOrders = 1; // store B guest order above

// ── guest checkout ──────────────────────────────────────────────────────────────────────────────
await step('Guest checkout (prod/PG): add-on + delivery zone + discount; backend pricing; JOD snapshot; stock -1 exactly once; tracking code', async () => {
  const before = await stockOf();
  const r = await placeA({ deliveryMethod: 'DELIVERY', customerAddress: 'Abdali 1', deliveryZoneId: F.zoneA.id, discountCode: 'TRUST10', subtotal: 0.01, total: 0.01, deliveryFee: 0, discount: 99,
    customerName: 'Guest Trust', customerEmail: 'guest-trust@example.test', customerPhone: '+962790003333' },
  [{ productId: F.burger.id, quantity: 1, modifierOptionIds: [F.cheese], unitPrice: 0.001 }, { productId: F.water.id, quantity: 1 }]); publicOrders++;
  assert.equal(r.status, 200, r.text.slice(0, 200));
  const o = r.json.data; F.guestOrder = o;
  // (5.25 + 0.5 + 1) = 6.75, 10% = 0.675, fee 2.5 -> 8.575
  assert.equal(num(o.subtotal), 6.75); assert.equal(num(o.discount), 0.675); assert.equal(num(o.deliveryFee), 2.5); assert.equal(num(o.total), 8.575);
  assert.equal(o.currency, 'JOD'); assert.match(o.orderCode, /^[A-Z0-9]{6,12}$/);
  assert.equal(await stockOf(), before - 1);
  const snap = psql(`SELECT currency FROM customer_orders WHERE id='${o.id}'`); assert.equal(snap, 'JOD');
  return `order ${o.orderCode} total JOD ${o.total} (client prices ignored); stock ${before}->${before - 1}`;
});

// ── authenticated checkout ──────────────────────────────────────────────────────────────────────
await step('Authenticated checkout: owned by token customer (forged customerId ignored); in own history; detail owner-only', async () => {
  const r = await placeA({ customerId: C2.id, userId: C2.id, customerName: 'C1 Buyer', customerEmail: C2.email }, [{ productId: F.shake.id, variantId: F.shakeM, quantity: 1 }], C1.token); publicOrders++;
  assert.equal(r.status, 200, r.text.slice(0, 200));
  F.c1Order = r.json.data;
  assert.equal(num(F.c1Order.total), 3.5);
  assert.equal(psql(`SELECT customer_id FROM customer_orders WHERE id='${F.c1Order.id}'`), C1.user.id, 'order owner is the authenticated customer');
  const h1 = await ok('GET', '/api/public/customers/me/orders', { token: C1.token });
  const list1 = h1.content ?? h1.items ?? h1;
  assert(list1.some(o => o.id === F.c1Order.id || o.orderCode === F.c1Order.orderCode), 'in C1 history');
  const h2 = await ok('GET', '/api/public/customers/me/orders', { token: C2.token });
  assert(!(h2.content ?? h2.items ?? h2).some(o => o.orderCode === F.c1Order.orderCode), 'not in C2 history');
  await ok('GET', `/api/public/customers/me/orders/${F.c1Order.id}`, { token: C1.token });
  return `order ${F.c1Order.orderCode}`;
});

// ── customer isolation ──────────────────────────────────────────────────────────────────────────
await step('Customer isolation: C2 cannot read/update C1 profile, history or order detail; guest/merchant cannot use customer APIs', async () => {
  const codes = [];
  codes.push(await denied('C2 -> C1 order', 'GET', `/api/public/customers/me/orders/${F.c1Order.id}`, { token: C2.token }));
  codes.push(await denied('C2 -> guest order', 'GET', `/api/public/customers/me/orders/${F.guestOrder.id}`, { token: C2.token }));
  codes.push(await denied('guest -> C1 order', 'GET', `/api/public/customers/me/orders/${F.c1Order.id}`));
  codes.push(await denied('merchant -> customer me', 'GET', '/api/public/customers/me', { token: A.token })); assert.equal(codes.at(-1), 403, 'merchant token on customer API is a role denial (403)');
  for (const p of [`/api/public/customers/${C1.user.id}`, `/api/public/customers/${C1.user.id}/orders`]) codes.push(await denied('path id', 'GET', p, { token: C2.token }));
  const upd = await ok('PUT', '/api/public/customers/me', { token: C2.token, body: { fullName: 'C2 Renamed', id: C1.user.id, email: C1.email, phone: '+962700000000' } });
  assert.equal(upd.email, C2.email, 'email is read-only'); assert.equal(upd.id, C2.id);
  assert.equal((await ok('GET', '/api/public/customers/me', { token: C1.token })).fullName, 'M214 customer-1', 'C1 profile untouched');
  assert.equal(psql(`SELECT full_name FROM app_users WHERE id='${C2.id}'`), 'C2 Renamed', 'fullName persisted');
  return codes.join('/');
});

// ── public tracking ─────────────────────────────────────────────────────────────────────────────
await step('Public tracking: code+email / code+phone succeed; wrong contact rejected; no PII/internal IDs; code or ID alone insufficient', async () => {
  const look = (b, headers) => http('POST', `/api/public/stores/${slugA}/orders/lookup`, { body: b, headers });
  const e = await look({ orderCode: F.guestOrder.orderCode, email: 'guest-trust@example.test' });
  assert.equal(e.status, 200, e.text);
  assert.deepEqual(Object.keys(e.json.data).sort(), ['createdAt', 'currency', 'deliveryMethod', 'orderCode', 'status', 'total']);
  for (const pii of ['guest-trust', '+962790003333', 'Abdali', 'Guest Trust', F.guestOrder.id, F.storeA.id]) assert(!e.text.includes(pii), `tracking leaks ${pii}`);
  assert.equal((await look({ orderCode: F.guestOrder.orderCode, phone: '+962790003333' })).status, 200);
  const wrong = await look({ orderCode: F.guestOrder.orderCode, email: 'someone-else@example.test' });
  assert.notEqual(wrong.status, 200);
  assert.notEqual((await look({ orderCode: F.guestOrder.orderCode, phone: '+962790000000' })).status, 200);
  assert.notEqual((await look({ orderCode: F.guestOrder.orderCode })).status, 200, 'code alone');
  assert.notEqual((await http('POST', `/api/public/stores/${slugB}/orders/lookup`, { body: { orderCode: F.guestOrder.orderCode, email: 'guest-trust@example.test' } })).status, 200, 'other store slug');
  for (const p of [`/api/public/orders/${F.guestOrder.id}`, `/api/public/stores/${slugA}/orders/${F.guestOrder.id}`, `/api/dashboard/orders/${F.guestOrder.id}`]) await denied('id-only', 'GET', p);
  noLeak('wrong-contact', wrong.text);
  return `wrong contact -> ${wrong.status}`;
});

await step('Tracking brute force: per-code budget (10/5min) holds across spoofed X-Forwarded-For; then per-IP route budget', async () => {
  const code = F.c1Order.orderCode; // fresh budget for this code
  let firstBlocked = null;
  for (let i = 1; i <= 12; i++) {
    const r = await http('POST', `/api/public/stores/${slugA}/orders/lookup`, { body: { orderCode: code, email: `guess${i}@example.test` }, headers: { 'X-Forwarded-For': `198.51.100.${i}`, 'X-Real-IP': `198.51.100.${i}` } });
    if (r.status === 429) { firstBlocked = i; noLeak('429', r.text); break; }
  }
  assert(firstBlocked && firstBlocked <= 11, `per-code budget never tripped (${firstBlocked})`);
  const legit = await http('POST', `/api/public/stores/${slugA}/orders/lookup`, { body: { orderCode: code, email: C1.email } });
  assert.equal(legit.status, 429, 'budget is shared: even the correct credential waits out the window');
  let ipBlocked = null;
  for (let i = 0; i < 25; i++) {
    const r = await http('POST', `/api/public/stores/${slugA}/orders/lookup`, { body: { orderCode: `ZZ${String(i).padStart(6, '0')}`, phone: '+962790000001' }, headers: { 'X-Forwarded-For': `203.0.113.${i}` } });
    if (r.status === 429) { ipBlocked = i; break; }
  }
  assert(ipBlocked !== null, 'per-IP lookup budget never tripped');
  return `code budget tripped at guess ${firstBlocked}; IP budget tripped after ${ipBlocked} more (spoofed XFF ignored)`;
});

// ── acceptance matrix / business hours ──────────────────────────────────────────────────────────
await step('Business hours x accepting orders: OPEN+on ok; OPEN+off ORDERS_PAUSED; CLOSED+on STORE_CLOSED; CLOSED+off rejected; no stock side effects', async () => {
  const before = await stockOf();
  const place = () => { publicOrders++; return placeA({}, [{ productId: F.burger.id, quantity: 1 }]); };
  await ok('PUT', `/api/dashboard/stores/${F.storeA.id}/accepting-orders`, { token: A.token, body: { acceptingOrders: false } });
  const paused = await place();
  await ok('PUT', `/api/dashboard/stores/${F.storeA.id}/business-hours`, { token: A.token, body: allClosed });
  const closedPaused = await place();
  await ok('PUT', `/api/dashboard/stores/${F.storeA.id}/accepting-orders`, { token: A.token, body: { acceptingOrders: true } });
  const closed = await place();
  await ok('PUT', `/api/dashboard/stores/${F.storeA.id}/business-hours`, { token: A.token, body: allOpen });
  assert.equal(paused.status, 409); assert.equal(paused.json.code, 'ORDERS_PAUSED');
  assert.equal(closed.status, 409); assert.equal(closed.json.code, 'STORE_CLOSED');
  assert.equal(closedPaused.status, 409);
  assert.equal(await stockOf(), before, 'rejected orders leave stock');
  assert.equal((await ok('GET', `/api/public/stores/${slugA}/business-hours`)).canAcceptOrders, true);
  return `closed+paused -> ${closedPaused.json.code}; NOT_CONFIGURED covered by store B order (no hours set)`;
});

// ── delivery / pickup ───────────────────────────────────────────────────────────────────────────
await step('Delivery/pickup attacks: below minimum, missing address, other-store zone, inactive zone, forged fee, free threshold, pickup fee 0, pickup disabled', async () => {
  const del = (o, items) => { publicOrders++; return placeA({ deliveryMethod: 'DELIVERY', customerAddress: 'Abdali 1', deliveryZoneId: F.zoneA.id, ...o }, items); };
  const w = q => [{ productId: F.water.id, quantity: q }];
  assert.notEqual((await del({}, w(1))).status, 200, 'below minOrder');
  assert.notEqual((await del({ customerAddress: '' }, w(6))).status, 200, 'address required');
  assert.notEqual((await del({ deliveryZoneId: F.zoneB.id }, w(6))).status, 200, 'other store zone');
  assert.notEqual((await del({ deliveryZoneId: F.zoneOff.id }, w(6))).status, 200, 'inactive zone');
  assert.notEqual((await del({ deliveryZoneId: '00000000-0000-0000-0000-000000000000' }, w(6))).status, 200, 'unknown zone');
  const forged = await del({ deliveryFee: 0 }, w(6)); assert.equal(forged.status, 200); assert.equal(num(forged.json.data.deliveryFee), 2.5);
  const free = await del({}, w(50)); assert.equal(free.status, 200); assert.equal(num(free.json.data.deliveryFee), 0);
  const pickup = await placeA({ deliveryMethod: 'PICKUP', deliveryZoneId: F.zoneA.id, deliveryFee: 9 }, w(1)); publicOrders++;
  assert.equal(pickup.status, 200); assert.equal(num(pickup.json.data.deliveryFee), 0);
  assert.equal(psql(`SELECT count(*) FROM information_schema.columns WHERE table_name='customer_orders' AND column_name LIKE '%zone%'`), '0'); // a zone is never persisted on an order
  const bPickup = await http('POST', `/api/public/stores/${slugB}/orders`, { body: order({ deliveryMethod: 'PICKUP' }, [{ productId: F.prodB.id, quantity: 1 }]) }); publicOrders++;
  assert.notEqual(bPickup.status, 200, 'pickup disabled store B');
  const bOffer = await placeA({ discountCode: 'BONLY' }, w(1)); publicOrders++;
  assert.notEqual(bOffer.status, 200, "store B's discount code must not apply at A");
  F.freeOrder = free.json.data;
  return `forged fee -> 2.500; free delivery at 50.000; pickup fee 0, no zone; B pickup -> ${bPickup.status}`;
});

// ── order lifecycle / inventory ─────────────────────────────────────────────────────────────────
await step('Order lifecycle NEW->CONFIRMED->PREPARING->READY->DELIVERED; invalid transitions rejected; stock untouched; history reflects state', async () => {
  const before = await stockOf();
  const id = F.guestOrder.id;
  // forward skips are allowed by design (OrderService.validateTransition); backward/terminal changes are not
  for (const st of ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED']) assert.equal((await ok('PUT', `/api/dashboard/orders/${id}/status`, { token: A.token, body: { status: st } })).status, st);
  assert((await http('PUT', `/api/dashboard/orders/${id}/status`, { token: A.token, body: { status: 'NEW' } })).status >= 400, 'backwards rejected');
  assert((await http('PUT', `/api/dashboard/orders/${id}/status`, { token: A.token, body: { status: 'CANCELLED' } })).status >= 400, 'cancel after delivered rejected');
  assert.equal(await stockOf(), before, 'lifecycle does not move stock');
  for (const st of ['CONFIRMED', 'PREPARING']) await ok('PUT', `/api/dashboard/orders/${F.c1Order.id}/status`, { token: A.token, body: { status: st } });
  const d = await ok('GET', `/api/public/customers/me/orders/${F.c1Order.id}`, { token: C1.token });
  assert.equal(d.status, 'PREPARING');
  const moves = psql(`SELECT count(*) FROM inventory_adjustments WHERE reference='${F.guestOrder.orderCode}'`);
  assert.equal(moves, '1', 'exactly one ledger row (the sale) for the guest order');
  return `stock ${before} unchanged; ledger rows for order ${moves}`;
});

await step('Inventory: order -1 once, rejected orders (out-of-stock, invalid product) no change, cancel restores once, re-cancel no double restore', async () => {
  const before = await stockOf();
  const o = await placeA({}, [{ productId: F.burger.id, quantity: 2 }]); publicOrders++;
  assert.equal(o.status, 200); assert.equal(await stockOf(), before - 2);
  const oos = await placeA({}, [{ productId: F.burger.id, quantity: 999 }]); publicOrders++;
  assert.notEqual(oos.status, 200);
  const bad = await placeA({}, [{ productId: F.prodB.id, quantity: 1 }]); publicOrders++;
  assert.notEqual(bad.status, 200, 'other store product');
  assert.equal(await stockOf(), before - 2);
  await ok('PUT', `/api/dashboard/orders/${o.json.data.id}/status`, { token: A.token, body: { status: 'CANCELLED' } });
  assert.equal(await stockOf(), before);
  // re-cancel is an idempotent no-op by design (OrderService.updateStatus skips same-status side effects)
  const again = await http('PUT', `/api/dashboard/orders/${o.json.data.id}/status`, { token: A.token, body: { status: 'CANCELLED' } });
  assert(again.status >= 400 || (again.status === 200 && again.json.data.status === 'CANCELLED'), `re-cancel ${again.status}`);
  assert.equal(await stockOf(), before, 'no double restore');
  assert.equal(psql(`SELECT count(*) FROM inventory_adjustments WHERE reference='${o.json.data.orderCode}' AND reason='ORDER_CANCELLED'`), '1', 'exactly one restore ledger row');
  const inv = await ok('GET', `/api/dashboard/inventory?storeId=${F.storeA.id}`, { token: A.token });
  assert(inv.some(r => r.productId === F.burger.id && num(r.stock ?? r.quantity) === before));
  return `burger ${before}->${before - 2}->(rejects)->${before - 2}->(cancel)->${before}; oos ${oos.status}, foreign product ${bad.status}`;
});

// ── settings / theme ────────────────────────────────────────────────────────────────────────────
await step('Business settings persist: currency/timezone/locale, contacts, fulfillment, hours, accepting orders', async () => {
  const upd = { ...bodyA, status: 'ACTIVE', timezone: 'Asia/Dubai', locale: 'ar', phone: '+962790001499', whatsappNumber: '+962790001498', freeDeliveryThreshold: 60 };
  await ok('PUT', `/api/dashboard/stores/${F.storeA.id}`, { token: A.token, body: upd });
  const hours = { days: allOpen.days.map(d => d.dayOfWeek === 'FRIDAY' ? { dayOfWeek: 'FRIDAY', closed: false, open24Hours: false, openTime: '09:00', closeTime: '17:00' } : d) };
  await ok('PUT', `/api/dashboard/stores/${F.storeA.id}/business-hours`, { token: A.token, body: hours });
  await ok('PUT', `/api/dashboard/stores/${F.storeA.id}/business-hours`, { token: A.token, body: hours }); // second save (PG unique regression)
  const mine = (await ok('GET', '/api/dashboard/stores/my', { token: A.token })).find(x => x.id === F.storeA.id);
  assert.equal(mine.timezone, 'Asia/Dubai'); assert.equal(mine.locale, 'ar'); assert.equal(mine.currency, 'JOD');
  assert.equal(mine.whatsappNumber, '+962790001498'); assert.equal(num(mine.freeDeliveryThreshold), 60); assert.equal(mine.pickupAvailable, true);
  const bh = await ok('GET', `/api/dashboard/stores/${F.storeA.id}/business-hours`, { token: A.token });
  const fri = (bh.days ?? bh).find(d => d.dayOfWeek === 'FRIDAY'); assert.match(String(fri.openTime), /^09:00/);
  const pub = await ok('GET', `/api/public/stores/${slugA}`);
  assert.equal(pub.timezone, 'Asia/Dubai');
  await ok('PUT', `/api/dashboard/stores/${F.storeA.id}`, { token: A.token, body: { ...bodyA, status: 'ACTIVE' } });
  await ok('PUT', `/api/dashboard/stores/${F.storeA.id}/business-hours`, { token: A.token, body: allOpen });
});

await step('Theme draft/publish: live A; draft B leaves live A; preview (dashboard draft) shows B; publish -> live B; persists', async () => {
  const stateA = { hero: { title: `Live A ${s}` } }, stateB = { hero: { title: `Draft B ${s}` } };
  await ok('PUT', '/api/dashboard/theme-content', { token: A.token, body: { storeId: F.storeA.id, content: stateA } });
  await ok('POST', '/api/dashboard/theme-content/publish', { token: A.token, body: { storeId: F.storeA.id } });
  assert.equal((await ok('GET', `/api/public/stores/${slugA}/theme-content`)).hero.title, stateA.hero.title);
  await ok('PUT', '/api/dashboard/theme-content', { token: A.token, body: { storeId: F.storeA.id, content: stateB } });
  assert.equal((await ok('GET', `/api/public/stores/${slugA}/theme-content`)).hero.title, stateA.hero.title, 'live stays A');
  const dash = await ok('GET', `/api/dashboard/theme-content?storeId=${F.storeA.id}`, { token: A.token });
  assert.equal(JSON.stringify(dash).includes(stateB.hero.title), true, 'preview/draft shows B');
  await ok('POST', '/api/dashboard/theme-content/publish', { token: A.token, body: { storeId: F.storeA.id } });
  assert.equal((await ok('GET', `/api/public/stores/${slugA}/theme-content`)).hero.title, stateB.hero.title);
  assert.equal((await ok('GET', `/api/public/stores/${slugA}/theme-content`)).hero.title, stateB.hero.title, 'persists on reload');
});

// ── staff permissions ───────────────────────────────────────────────────────────────────────────
const staff = {};
await step('Staff: invite created (email disabled -> no delivery claim); REPORTS-only staff reads reports, is denied orders; no-REPORTS staff denied reports; staff denied staff admin + store B', async () => {
  for (const key of ['reports', 'orders']) {
    const email = `m214-staff-${key}-${s}@example.test`;
    const inv = await http('POST', '/api/dashboard/staff/invite', { token: A.token, body: { storeId: F.storeA.id, email, fullName: `Staff ${key}` } });
    assert([200, 201].includes(inv.status), `invite ${inv.status} ${inv.text.slice(0, 160)}`);
    assert(!/sent|delivered/i.test(inv.text), 'invite response must not claim delivery');
    const raw = `m214-invite-${key}-${s}-${Math.random().toString(36).slice(2)}`;
    psql(`UPDATE staff_invites SET token_hash='${createHash('sha256').update(raw).digest('base64')}' WHERE lower(email)='${email}'`); // email is disabled: plant a known token
    const acc = await http('POST', '/api/public/staff/accept-invite', { body: { token: raw, fullName: `Staff ${key}`, password } });
    assert.equal(acc.status, 200, `accept ${acc.status} ${acc.text.slice(0, 160)}`);
    assert.equal(acc.json.data.refreshToken, undefined);
    staff[key] = { token: acc.json.data.accessToken, id: acc.json.data.user.id };
    assert.equal((await http('POST', '/api/public/staff/accept-invite', { body: { token: raw, password } })).status >= 400, true, 'invite single-use');
  }
  const grants = lv => ['PRODUCTS', 'ORDERS', 'DELIVERY', 'CUSTOMERS', 'REPORTS', 'OFFERS', 'APPOINTMENTS', 'STOREFRONT'].map(section => ({ section, level: lv[section] ?? 'NONE' }));
  await ok('PUT', `/api/dashboard/staff/${staff.reports.id}/permissions`, { token: A.token, body: { grants: grants({ REPORTS: 'VIEW' }) } });
  await ok('PUT', `/api/dashboard/staff/${staff.orders.id}/permissions`, { token: A.token, body: { grants: grants({ ORDERS: 'VIEW', PRODUCTS: 'EDIT' }) } });
  const today = new Date(), from = new Date(today - 2 * 864e5).toISOString().slice(0, 10), to = new Date(+today + 2 * 864e5).toISOString().slice(0, 10);
  const q = `from=${from}&to=${to}&storeId=${F.storeA.id}`;
  await ok('GET', `/api/dashboard/analytics/daily-store-sales?${q}`, { token: staff.reports.token });
  await ok('GET', `/api/dashboard/analytics/orders.csv?${q}`, { token: staff.reports.token });
  const n = [];
  n.push(await denied('reports staff -> orders list', 'GET', `/api/dashboard/orders?storeId=${F.storeA.id}`, { token: staff.reports.token }));
  n.push(await denied('reports staff -> order status', 'PUT', `/api/dashboard/orders/${F.c1Order.id}/status`, { token: staff.reports.token, body: { status: 'READY' } }));
  n.push(await denied('reports staff -> product edit', 'POST', '/api/dashboard/products', { token: staff.reports.token, body: { storeId: F.storeA.id, nameEn: 'x', slug: `x-${s}`, price: 1, sortOrder: 9 } }));
  n.push(await denied('orders staff -> reports', 'GET', `/api/dashboard/analytics/daily-store-sales?${q}`, { token: staff.orders.token }));
  n.push(await denied('orders staff -> csv', 'GET', `/api/dashboard/analytics/orders.csv?${q}`, { token: staff.orders.token }));
  n.push(await denied('orders VIEW staff -> order status edit', 'PUT', `/api/dashboard/orders/${F.c1Order.id}/status`, { token: staff.orders.token, body: { status: 'READY' } }));
  await ok('GET', `/api/dashboard/orders/${F.c1Order.id}`, { token: staff.orders.token });
  n.push(await denied('staff -> staff admin', 'GET', `/api/dashboard/staff?storeId=${F.storeA.id}`, { token: staff.orders.token }));
  n.push(await denied('staff -> invite', 'POST', '/api/dashboard/staff/invite', { token: staff.orders.token, body: { storeId: F.storeA.id, email: `evil-${s}@example.test` } }));
  n.push(await denied('staff -> own permissions', 'PUT', `/api/dashboard/staff/${staff.orders.id}/permissions`, { token: staff.orders.token, body: { grants: grants({ REPORTS: 'EDIT' }) } }));
  n.push(await denied('staff -> store B order', 'GET', `/api/dashboard/orders/${F.orderB.id}`, { token: staff.orders.token }));
  n.push(await denied('staff -> store settings', 'PUT', `/api/dashboard/stores/${F.storeA.id}`, { token: staff.orders.token, body: { ...bodyA, status: 'ACTIVE' } }));
  assert.equal((await ok('GET', `/api/dashboard/orders/${F.c1Order.id}`, { token: A.token })).status, 'PREPARING', 'denied edit left order unchanged');
  return `denials ${n.join('/')}`;
});

// ── reports / CSV ───────────────────────────────────────────────────────────────────────────────
await step('Reports on PostgreSQL: real metrics, CSV totals reconcile, formula injection neutralised, B cannot export A', async () => {
  const inj = await placeA({ customerName: '=HYPERLINK("http://evil","x")', notes: '+cmd|calc', customerEmail: 'inj@example.test' }, [{ productId: F.water.id, quantity: 1 }]); publicOrders++;
  assert.equal(inj.status, 200);
  const today = new Date(), from = new Date(today - 2 * 864e5).toISOString().slice(0, 10), to = new Date(+today + 2 * 864e5).toISOString().slice(0, 10);
  const q = `from=${from}&to=${to}&storeId=${F.storeA.id}`;
  const daily = await ok('GET', `/api/dashboard/analytics/daily-store-sales?${q}`, { token: A.token });
  assert(daily.length > 0, 'daily rows');
  const revenue = daily.reduce((a, r) => a + num(r.revenue ?? r.totalRevenue ?? r.grossSales ?? 0), 0);
  const count = daily.reduce((a, r) => a + num(r.orderCount ?? r.orders ?? 0), 0);
  const top = await ok('GET', `/api/dashboard/analytics/top-products?${q}`, { token: A.token });
  assert(top.length > 0);
  const csv = await http('GET', `/api/dashboard/analytics/orders.csv?${q}`, { token: A.token });
  assert.equal(csv.status, 200); assert.match(csv.headers.get('content-type'), /text\/csv/);
  assert(!csv.text.includes(',=HYPERLINK') && !csv.text.includes('"=HYPERLINK'), 'formula cell must be neutralised');
  assert(csv.text.includes("'=HYPERLINK") || csv.text.includes("'=HYPER"), 'escaped with leading quote');
  const lines = csv.text.trim().split(/\r?\n/);
  const head = lines[0].replace(/^﻿/, '').split(',').map(h => h.replace(/"/g, '').toLowerCase());
  const ti = head.findIndex(h => h === 'total' || h.startsWith('total'));
  const si = head.findIndex(h => h === 'status');
  const parse = l => { const out = []; let cur = '', q2 = false; for (const ch of l) { if (ch === '"') q2 = !q2; else if (ch === ',' && !q2) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out; };
  const rows = lines.slice(1).map(parse);
  const counted = rows.filter(r => si < 0 || r[si] !== 'CANCELLED');
  const csvTotal = counted.reduce((a, r) => a + num(r[ti]), 0);
  assert(!csv.text.includes('Other Grill') && !csv.text.includes('bguest@'), 'no store B data in A CSV');
  const deny = [];
  deny.push(await denied('B -> A csv', 'GET', `/api/dashboard/analytics/orders.csv?${q}`, { token: B.token }));
  deny.push(await denied('B -> A daily', 'GET', `/api/dashboard/analytics/daily-store-sales?${q}`, { token: B.token }));
  deny.push(await denied('B -> A top', 'GET', `/api/dashboard/analytics/top-products?${q}`, { token: B.token }));
  const bAll = await http('GET', `/api/dashboard/analytics/daily-store-sales?from=${from}&to=${to}`, { token: B.token });
  if (bAll.status === 200) assert(!JSON.stringify(bAll.json).includes(F.storeA.id), 'unscoped B report excludes A');
  F.report = { revenue, count, csvTotal: Math.round(csvTotal * 1000) / 1000, rows: rows.length };
  assert(Math.abs(csvTotal - revenue) < 0.0005, `CSV total ${csvTotal} != report revenue ${revenue} (head ${head.join('|')})`);
  return `revenue ${revenue.toFixed(3)} over ${count} orders; CSV ${rows.length} rows (${counted.length} non-cancelled) total ${csvTotal.toFixed(3)}; B denied ${deny.join('/')}`;
});

// ── tenant isolation ────────────────────────────────────────────────────────────────────────────
await step('Merchant tenant isolation: A attempts on every store-B resource are refused; B data unchanged', async () => {
  const t = { token: A.token };
  const calls = [
    ['PUT', `/api/dashboard/stores/${F.storeB.id}`, { ...bodyB, name: 'pwned', status: 'ACTIVE' }],
    ['DELETE', `/api/dashboard/stores/${F.storeB.id}`],
    ['PUT', `/api/dashboard/stores/${F.storeB.id}/accepting-orders`, { acceptingOrders: false }],
    ['GET', `/api/dashboard/stores/${F.storeB.id}/business-hours`], ['PUT', `/api/dashboard/stores/${F.storeB.id}/business-hours`, allClosed],
    ['GET', `/api/dashboard/products/${F.prodB.id}`], ['PUT', `/api/dashboard/products/${F.prodB.id}`, { storeId: F.storeB.id, nameEn: 'pwned', slug: 'b-burger', price: 0.001, sortOrder: 0 }],
    ['DELETE', `/api/dashboard/products/${F.prodB.id}`], ['POST', '/api/dashboard/products', { storeId: F.storeB.id, nameEn: 'inj', slug: `inj-${s}`, price: 1, sortOrder: 0 }],
    ['PUT', `/api/dashboard/products/${F.prodB.id}/variants`, { options: [], variants: [] }], ['GET', `/api/dashboard/products/${F.prodB.id}/modifier-groups`],
    ['GET', `/api/dashboard/categories?storeId=${F.storeB.id}`], ['PUT', `/api/dashboard/categories/${F.catB.id}`, { storeId: F.storeB.id, nameEn: 'pwned', slug: 'b-cat', categoryType: 'PRODUCT', sortOrder: 0, active: true }],
    ['DELETE', `/api/dashboard/categories/${F.catB.id}`], ['POST', '/api/dashboard/categories', { storeId: F.storeB.id, nameEn: 'inj', slug: `inj-${s}`, categoryType: 'PRODUCT', sortOrder: 0, active: true }],
    ['GET', `/api/dashboard/inventory?storeId=${F.storeB.id}`], ['GET', `/api/dashboard/inventory/history?storeId=${F.storeB.id}`],
    ['POST', '/api/dashboard/inventory/adjust', { productId: F.prodB.id, mode: 'SET', quantity: 0, reason: 'CORRECTION' }],
    ['GET', `/api/dashboard/orders?storeId=${F.storeB.id}`], ['GET', `/api/dashboard/orders/${F.orderB.id}`],
    ['PUT', `/api/dashboard/orders/${F.orderB.id}/status`, { status: 'CANCELLED' }], ['PUT', `/api/dashboard/orders/${F.orderB.id}/payment-status`, { status: 'PAID' }],
    ['PUT', `/api/dashboard/delivery-zones/${F.zoneB.id}`, { storeId: F.storeB.id, name: 'pwned', minOrder: 0, deliveryFee: 0, isActive: true, sortOrder: 0 }],
    ['DELETE', `/api/dashboard/delivery-zones/${F.zoneB.id}`], ['POST', '/api/dashboard/delivery-zones', { storeId: F.storeB.id, name: 'inj', minOrder: 0, deliveryFee: 0, isActive: true, sortOrder: 0 }],
    ['GET', `/api/dashboard/appointment-slots?storeId=${F.storeB.id}`], ['POST', '/api/dashboard/appointment-slots', { storeId: F.storeB.id, startsAt: new Date(Date.now() + 5 * 864e5).toISOString(), endsAt: new Date(Date.now() + 5 * 864e5 + 36e5).toISOString(), capacity: 1 }],
    ['DELETE', `/api/dashboard/appointment-slots/${F.slotB.id}`], ['GET', `/api/dashboard/appointments?storeId=${F.storeB.id}`],
    ['PUT', `/api/dashboard/appointments/${F.apptB.id}/status`, { status: 'CANCELLED' }],
    ['GET', `/api/dashboard/offers?storeId=${F.storeB.id}`], ['PUT', `/api/dashboard/offers/${F.offerB.id}`, { storeId: F.storeB.id, code: 'BONLY', discountType: 'PERCENTAGE', discountValue: 100, active: true }],
    ['DELETE', `/api/dashboard/offers/${F.offerB.id}`], ['POST', '/api/dashboard/offers', { storeId: F.storeB.id, code: 'INJ', discountType: 'PERCENTAGE', discountValue: 100, active: true }],
    ['GET', `/api/dashboard/customers?storeId=${F.storeB.id}`],
    ['GET', `/api/dashboard/theme-content?storeId=${F.storeB.id}`], ['PUT', '/api/dashboard/theme-content', { storeId: F.storeB.id, content: { hero: { title: 'pwned' } } }],
    ['POST', '/api/dashboard/theme-content/publish', { storeId: F.storeB.id }], ['GET', `/api/dashboard/theme-content/versions?storeId=${F.storeB.id}`],
    ['GET', `/api/dashboard/staff?storeId=${F.storeB.id}`], ['POST', '/api/dashboard/staff/invite', { storeId: F.storeB.id, email: `inj-${s}@example.test` }],
    ['GET', `/api/dashboard/staff/${B.user.id}/permissions`], ['PUT', `/api/dashboard/staff/${B.user.id}/deactivate`],
  ];
  const codes = {};
  const bMarkers = [F.storeB.id, 'Other Grill', 'B Burger', 'B cat', 'BONLY', 'B zone', F.orderB.id, F.prodB.id, F.slotB.id, 'bguest@'];
  for (const [m, p, b] of calls) {
    const r = await http(m, p, { ...t, body: b });
    let c = r.status;
    if (c === 200 && m === 'GET') { // list endpoints scope to the caller's own stores and ignore a foreign storeId
      for (const mk of bMarkers) assert(!r.text.includes(mk), `A->B ${m} ${p} returned store B data (${mk})`);
      c = '200(own data only)';
    } else assert([401, 403, 404].includes(c), `A->B ${m} ${p} expected denial, got ${c} ${r.text.slice(0, 160)}`);
    codes[c] = (codes[c] ?? 0) + 1;
  }
  const up = await fetch(`${api}/api/dashboard/media/images?storeId=${F.storeB.id}`, { method: 'POST', headers: { Authorization: `Bearer ${A.token}` }, body: (() => { const f = new FormData(); f.append('file', new Blob([png1x1], { type: 'image/png' }), 'a.png'); return f; })() });
  assert([401, 403, 404].includes(up.status), `A->B media upload ${up.status}`);
  // B's data unchanged
  const bStore = (await ok('GET', '/api/dashboard/stores/my', { token: B.token })).find(x => x.id === F.storeB.id);
  assert.equal(bStore.name, 'Other Grill'); assert.equal(bStore.status, 'ACTIVE');
  assert.equal((await ok('GET', `/api/dashboard/products/${F.prodB.id}`, { token: B.token })).nameEn, 'B Burger');
  assert.equal((await ok('GET', `/api/dashboard/orders/${F.orderB.id}`, { token: B.token })).status, 'NEW');
  assert.equal(num((await ok('GET', `/api/dashboard/products/${F.prodB.id}`, { token: B.token })).stock), 19);
  assert.equal(psql(`SELECT count(*) FROM staff_invites WHERE store_id='${F.storeB.id}'`), '0');
  // unscoped lists never include B
  for (const p of ['/api/dashboard/delivery-zones', '/api/dashboard/offers', '/api/dashboard/appointment-slots', '/api/dashboard/appointments', '/api/dashboard/orders']) {
    const r = await http('GET', p, t);
    if (r.status === 200) assert(!r.text.includes(F.storeB.id) && !r.text.includes('BONLY') && !r.text.includes('B zone'), `${p} leaks B`);
  }
  return `${calls.length + 1} cross-store calls refused (${Object.entries(codes).map(([k, v]) => `${k}x${v}`).join(', ')}); B data intact`;
});

// ── media ───────────────────────────────────────────────────────────────────────────────────────
async function upload(name, bytes, type, storeId = F.storeA.id) {
  const f = new FormData(); f.append('file', new Blob([bytes], { type }), name);
  const r = await fetch(`${api}/api/dashboard/media/images?storeId=${storeId}`, { method: 'POST', headers: { Authorization: `Bearer ${A.token}` }, body: f });
  const text = await r.text(); let json = null; try { json = JSON.parse(text); } catch {}
  return { status: r.status, json, text };
}
await step('Media: valid PNG stored under generated name inside root; oversize, disguised/disallowed types, SVG, traversal names rejected or neutralised; traversal reads 404', async () => {
  const good = await upload('../../../../evil.png', png1x1, 'image/png');
  assert.equal(good.status, 200, good.text.slice(0, 200));
  const url = good.json.data.url;
  assert.match(url, new RegExp(`/media/${F.storeA.id}/[0-9a-f-]{36}\\.png$`)); assert(!url.includes('evil') && !url.includes('..'));
  const path = new URL(url).pathname;
  const served = await http('GET', path); assert.equal(served.status, 200);
  assert.equal(served.headers.get('x-content-type-options'), 'nosniff');
  const results2 = {};
  results2.oversize = (await upload('big.png', Buffer.concat([png1x1, Buffer.alloc(5 * 1024 * 1024 + 10)]), 'image/png')).status;
  results2.html = (await upload('x.png', Buffer.from('<html><script>alert(1)</script></html>'), 'image/png')).status;
  results2.svg = (await upload('x.svg', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>'), 'image/svg+xml')).status;
  results2.exe = (await upload('x.exe', Buffer.from('MZ\x90\x00'), 'application/octet-stream')).status;
  results2.empty = (await upload('x.png', Buffer.alloc(0), 'image/png')).status;
  for (const [k, v] of Object.entries(results2)) assert([400, 413, 415].includes(v), `${k} -> ${v}`);
  const reads = {};
  for (const p of [`/media/${F.storeA.id}/..%2F..%2Fapplication.yml`, `/media/${F.storeA.id}/../../etc/passwd`, `/media/..%2F${F.storeA.id}/x.png`, `/media/${F.storeA.id}/%2e%2e%5cwin.ini`, `/media/not-a-uuid/x.png`, `/media/${F.storeA.id}/x.svg`]) {
    const r = await http("GET", p); reads[p.slice(-18)] = r.status; assert([400, 401, 403, 404].includes(r.status) && !r.text.includes("root:") && !r.text.includes("datasource"), `${p} -> ${r.status}`);
  }
  return `good ${path.split('/').pop()}; rejects ${Object.entries(results2).map(([k, v]) => `${k}=${v}`).join(' ')}`;
});

// ── failed login persistence / lock ─────────────────────────────────────────────────────────────
await step('Failed logins persist (no rollback), success resets, merchant lock at threshold 5 blocks correct password', async () => {
  await sleep(61_000); // fresh 10/min login route window
  const login = pw => http('POST', '/api/auth/login', { body: { email: L.email, password: pw } });
  const count = () => psql(`SELECT failed_login_count || '|' || coalesce(locked_until::text,'null') FROM app_users WHERE lower(email)='${L.email}'`);
  for (let i = 0; i < 2; i++) { const r = await login('Wrong-password-1!'); assert.equal(r.status, 401); noLeak('bad login', r.text); }
  assert.equal(count(), '2|null', 'two failures persisted');
  assert.equal((await login(password)).status, 200);
  assert.equal(count(), '0|null', 'success resets');
  // The lock is proven on merchant B, which has no recent failures: on L the per-email throttle
  // (5 failures / 15 min, counted across the reset above) would refuse attempts before the counter reaches 5.
  const loginB = pw => http('POST', '/api/auth/login', { body: { email: B.email, password: pw } });
  const countB = () => psql(`SELECT failed_login_count || '|' || coalesce(locked_until::text,'null') FROM app_users WHERE lower(email)='${B.email}'`);
  const statuses = [];
  for (let i = 0; i < 5; i++) statuses.push((await loginB('Wrong-password-1!')).status);
  assert.deepEqual(statuses, [401, 401, 401, 401, 401]);
  const [n, lockedUntil] = countB().split('|');
  assert.equal(n, '5'); assert.notEqual(lockedUntil, 'null', 'locked_until set');
  const locked = await loginB(password);
  assert.notEqual(locked.status, 200, 'correct password refused while locked');
  noLeak('locked', locked.text);
  const unknownUser = await http('POST', '/api/auth/login', { body: { email: `nobody-${s}@example.test`, password: 'Wrong-password-1!' } });
  return `fail statuses ${statuses.join(',')}; locked login -> ${locked.status} "${locked.json?.message}"; unknown user "${unknownUser.json?.message}"`;
});

// ── email / reset wording ───────────────────────────────────────────────────────────────────────
await step('Email disabled (acknowledged): reset responses generic and do not claim delivery for unknown vs known accounts', async () => {
  const known = await http('POST', '/api/public/auth/forgot-password', { body: { email: C1.email } });
  const unknown = await http('POST', '/api/public/auth/forgot-password', { body: { email: `nobody-${s}@example.test` } });
  assert.equal(known.status, 200); assert.equal(known.text, unknown.text, 'no account enumeration');
  assert(!/\bsent\b|delivered|we emailed/i.test(known.json.data.message), `claims delivery: ${known.json.data.message}`);
  return `"${known.json.data?.message}"`;
});

// ── errors / leakage ────────────────────────────────────────────────────────────────────────────
await step('Error leakage: malformed JSON, bad UUID, type mismatch, SQL-ish input, unknown route, huge payload -> generic bodies with no stack/SQL/tokens', async () => {
  const cases = [
    ['POST', `/api/public/stores/${slugA}/orders`, { raw: '{"items": [', headers: { 'Content-Type': 'application/json' } }],
    ['GET', '/api/dashboard/orders/not-a-uuid', { token: A.token }],
    ['GET', `/api/dashboard/analytics/daily-store-sales?from=yesterday&to=x&storeId=${F.storeA.id}`, { token: A.token }],
    ['GET', `/api/public/stores/${encodeURIComponent("x' OR 1=1; --")}`, {}],
    ['POST', `/api/public/stores/${slugA}/orders`, { body: order({ customerName: "'; DROP TABLE orders; --" }, [{ productId: 'nope', quantity: -1 }]) }],
    ['GET', '/api/does-not-exist', {}],
    ['PUT', `/api/dashboard/orders/${F.c1Order.id}/status`, { token: A.token, body: { status: 'EXPLODED' } }],
    ['GET', '/api/dashboard/stores/my', { token: `${A.token}x` }],
  ];
  const codes = [];
  for (const [m, p, o] of cases) {
    const r = await http(m, p, o); codes.push(r.status);
    assert(r.status >= 400 && r.status < 500, `${m} ${p} -> ${r.status}: ${r.text.slice(0, 200)}`);
    noLeak(`${m} ${p}`, r.text);
    assert(!r.text.includes('customerEmail') && !r.text.includes('@example.test'), 'no PII in error');
  }
  assert.equal(psql("SELECT to_regclass('public.customer_orders') IS NOT NULL"), 't', 'SQL-ish input dropped nothing');
  return codes.join('/');
});

// ── rate limiting (last: burns budgets) ─────────────────────────────────────────────────────────
await step('Rate limits trigger per real client IP; spoofed X-Forwarded-For/X-Real-IP/Forwarded do not reset them (login, customer login, admin login, guest orders, forgot-password)', async () => {
  const burst = async (path, bodyFn, max) => {
    for (let i = 1; i <= max; i++) {
      const r = await http('POST', path, { body: bodyFn(i), headers: { 'X-Forwarded-For': `192.0.2.${i}`, 'X-Real-IP': `192.0.2.${i}`, Forwarded: `for=192.0.2.${i}`, 'CF-Connecting-IP': `192.0.2.${i}` } });
      if (r.status === 429) { assert(r.headers.get('retry-after')); noLeak('429', r.text); return i; }
    }
    return null;
  };
  const out = {};
  out.login = await burst('/api/auth/login', i => ({ email: `rl-${i}-${s}@example.test`, password: 'Wrong-password-1!' }), 15);
  out.customerLogin = await burst('/api/public/auth/login', i => ({ email: `rl-${i}-${s}@example.test`, password: 'Wrong-password-1!' }), 15);
  out.adminLogin = await burst('/api/admin/auth/login', i => ({ email: `rl-${i}-${s}@example.test`, password: 'Wrong-password-1!' }), 10);
  out.forgot = await burst('/api/public/auth/forgot-password', i => ({ email: `rl-${i}-${s}@example.test` }), 10);
  out.guestOrder = await burst(`/api/public/stores/${slugA}/orders`, () => order({}, [{ productId: F.water.id, quantity: 1 }]), 25);
  for (const [k, v] of Object.entries(out)) assert(v !== null, `${k} limit never triggered`);
  return Object.entries(out).map(([k, v]) => `${k}@${v}`).join(' ') + ` (guest orders placed before burst: ${publicOrders})`;
});

console.table(results.map(r => ({ step: r.step.slice(0, 70), result: r.result })));
const failed = results.filter(r => r.result !== 'PASS');
console.log(failed.length ? `M2-14 prod API FAIL (${failed.length})` : 'M2-14 prod API PASS');
process.exitCode = failed.length ? 1 : 0;
