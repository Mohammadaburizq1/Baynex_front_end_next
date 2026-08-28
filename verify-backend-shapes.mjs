// Guards against the class of bug found in the retail-checkout / field-mapping audit tickets:
// lib/api/*.ts silently assuming a JSON shape (`name`, `discountPrice`, `stock`, `orderNumber`,
// uppercase-vs-lowercase enums...) that doesn't match what the real backend actually sends.
// GlobalExceptionHandler used to swallow 500s with no logging, and mock/demo data masked the
// mismatch in the UI, so these went unnoticed until hitting a live backend by hand.
//
// This script seeds minimal real data through the real HTTP API and asserts the *raw* backend
// response for each audited endpoint has exactly the fields lib/api/*.ts's `*Raw` interfaces
// and `map*()` functions depend on — so a backend field rename (or a frontend assumption drift)
// fails loudly here instead of silently in the browser.
//
// Run against a live backend (H2 test profile per shoplink_backend/README.md's "Testing"
// section, or a real Postgres instance) — no Docker required:
//   API_BASE=http://localhost:8081 node verify-backend-shapes.mjs
//
// Deliberately NOT a Playwright/browser test — this is about the wire contract, not UI
// behavior. Keep it in sync with lib/api/*.ts's `*Raw` interfaces when either side changes.

const BASE = process.env.API_BASE ?? 'http://localhost:8081';
const ts = Date.now();

let failures = 0;
function check(label, condition) {
  if (condition) {
    console.log(`  OK   ${label}`);
  } else {
    console.log(`  FAIL ${label}`);
    failures++;
  }
}

function hasField(obj, field, type) {
  const present = Object.prototype.hasOwnProperty.call(obj, field) && obj[field] !== undefined;
  if (!present) return false;
  return type ? typeof obj[field] === type : true;
}

async function post(path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`POST ${path} -> ${res.status}: ${JSON.stringify(json)}`);
  return json.data;
}

async function put(path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`PUT ${path} -> ${res.status}: ${JSON.stringify(json)}`);
  return json.data;
}

async function get(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}: ${JSON.stringify(json)}`);
  return json.data;
}

async function run() {
  console.log(`Verifying backend response shapes against ${BASE}\n`);

  // ── Seed: merchant, store, product, publish, customer, order ──────────────────
  const slug = `shape-audit-${ts}`;
  const merchant = await post('/api/auth/register-phone', {
    phone: `+1555${ts}`.slice(0, 15),
    fullName: 'Shape Audit Merchant',
    shopName: 'Shape Audit Shop',
    password: 'StrongPass123!',
  });
  const merchantToken = merchant.accessToken;

  const store = await post('/api/dashboard/stores', {
    name: 'Shape Audit Shop',
    slug,
    categorySlug: 'general-store',
    templateKey: 'retail-classic',
  }, merchantToken);

  const product = await post('/api/dashboard/products', {
    storeId: store.id,
    nameEn: 'Shape Audit Product',
    slug: 'shape-audit-product',
    price: 9.99,
    salePrice: 7.99, // set so the salePrice/discountPrice field-name check below is meaningful —
                      // Jackson's non_null inclusion policy omits unset nullable fields entirely
                      // (not even as `null`), so an unset salePrice wouldn't exercise the check.
    sortOrder: 0,
  }, merchantToken);

  await put(`/api/dashboard/stores/${store.id}`, {
    name: 'Shape Audit Shop',
    slug,
    categorySlug: 'general-store',
    templateKey: 'retail-classic',
    status: 'ACTIVE',
  }, merchantToken);

  const customer = await post('/api/public/auth/register', {
    fullName: 'Shape Audit Customer',
    email: `shape-audit-${ts}@test.com`,
    password: 'StrongPass123!',
  });
  const customerToken = customer.accessToken;

  const order = await post(`/api/public/stores/${slug}/orders`, {
    customerName: 'Shape Audit Customer',
    customerPhone: '+15559990000',
    deliveryMethod: 'PICKUP',
    paymentMethod: 'CASH',
    deliveryFee: 0,
    discount: 0,
    items: [{ productId: product.id, quantity: 1 }],
  }, customerToken);

  // ── lib/api/storefront-api.ts (ApiProductRaw via fetchStorefront) ─────────────
  console.log('GET /api/public/stores/{slug}/products  (storefront-api.ts ApiProductRaw)');
  const publicProducts = await get(`/api/public/stores/${slug}/products`);
  const publicProduct = publicProducts[0];
  check('has nameEn (not name)', hasField(publicProduct, 'nameEn', 'string') && !hasField(publicProduct, 'name'));
  check('has salePrice key (not discountPrice)', 'salePrice' in publicProduct && !('discountPrice' in publicProduct));
  check('has available (boolean)', hasField(publicProduct, 'available', 'boolean'));
  check('has no stock field', !('stock' in publicProduct));

  // ── lib/api/products.ts (ApiProductRaw via getProducts) ────────────────────────
  console.log('\nGET /api/dashboard/products  (products.ts ApiProductRaw)');
  const dashProducts = await get('/api/dashboard/products', merchantToken);
  const dashProduct = dashProducts.find(p => p.id === product.id);
  check('has nameEn (not name)', hasField(dashProduct, 'nameEn', 'string') && !hasField(dashProduct, 'name'));
  check('has storeId', hasField(dashProduct, 'storeId', 'string'));
  check('has slug', hasField(dashProduct, 'slug', 'string'));
  check('has available (boolean)', hasField(dashProduct, 'available', 'boolean'));
  check('has no status field', !('status' in dashProduct));
  check('has no stock field', !('stock' in dashProduct));

  // ── lib/api/orders.ts (ApiOrderRaw via getOrders) ───────────────────────────────
  console.log('\nGET /api/dashboard/orders  (orders.ts ApiOrderRaw)');
  const dashOrders = await get('/api/dashboard/orders', merchantToken);
  const dashOrder = dashOrders.find(o => o.id === order.id);
  check('has orderCode (not orderNumber)', hasField(dashOrder, 'orderCode', 'string') && !hasField(dashOrder, 'orderNumber'));
  check('status is an uppercase backend value', ['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'].includes(dashOrder.status));
  check('has deliveryMethod (not fulfillmentType)', hasField(dashOrder, 'deliveryMethod') && !hasField(dashOrder, 'fulfillmentType'));
  check('has paymentMethod as CASH/CARD/WHATSAPP_ONLY', ['CASH', 'CARD', 'WHATSAPP_ONLY'].includes(dashOrder.paymentMethod));
  check('has no top-level tax field', !('tax' in dashOrder));
  check('has no customerId field', !('customerId' in dashOrder));
  const item = dashOrder.items[0];
  check('item has productNameSnapshot (not productName)', hasField(item, 'productNameSnapshot', 'string') && !hasField(item, 'productName'));
  check('item has total (not totalPrice)', hasField(item, 'total', 'number') && !hasField(item, 'totalPrice'));

  // ── lib/api/stores.ts (ApiStore via getMyStores) — sanity check, already correct ──
  console.log('\nGET /api/dashboard/stores/my  (stores.ts ApiStore)');
  const myStores = await get('/api/dashboard/stores/my', merchantToken);
  const myStore = myStores.find(s => s.id === store.id);
  check('has name', hasField(myStore, 'name', 'string'));
  check('has slug', hasField(myStore, 'slug', 'string'));
  check('has status', hasField(myStore, 'status', 'string'));

  console.log(`\n${failures === 0 ? 'ALL SHAPES OK' : `${failures} SHAPE MISMATCH(ES) FOUND`}`);
  process.exit(failures === 0 ? 0 : 1);
}

run().catch(e => {
  console.error('\nSCRIPT ERROR:', e.message);
  process.exit(2);
});
