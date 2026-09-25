import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const root = process.cwd();
const resolverPath = path.join(root, 'lib', 'utils', 'template-resolver.ts');
const registryPath = path.join(root, 'components', 'storefront', 'StorefrontRenderer.tsx');

function fail(message) {
  throw new Error(message);
}

function idsFromUnion(source) {
  const match = source.match(/export type StorefrontTemplate =([\s\S]*?);/);
  if (!match) fail('Could not find StorefrontTemplate union.');
  return [...match[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
}

function idsFromRegistry(source) {
  const match = source.match(/const TEMPLATE_REGISTRY:[\s\S]*?= \{([\s\S]*?)\n\};/);
  if (!match) fail('Could not find TEMPLATE_REGISTRY.');
  return [...match[1].matchAll(/^\s*'([^']+)':/gm)].map(match => match[1]);
}

function setDifference(left, right) {
  const other = new Set(right);
  return left.filter(id => !other.has(id));
}

const resolverSource = fs.readFileSync(resolverPath, 'utf8');
const registrySource = fs.readFileSync(registryPath, 'utf8');
const resolverIds = idsFromUnion(resolverSource);
const registryIds = idsFromRegistry(registrySource);

if (new Set(resolverIds).size !== resolverIds.length) fail('Resolver template IDs are not unique.');
if (new Set(registryIds).size !== registryIds.length) fail('Registry template IDs are not unique.');

const missingFromRegistry = setDifference(resolverIds, registryIds);
const registryOnly = setDifference(registryIds, resolverIds);
if (missingFromRegistry.length || registryOnly.length) {
  fail(`Resolver/registry mismatch. Missing: ${missingFromRegistry.join(', ') || 'none'}; registry-only: ${registryOnly.join(', ') || 'none'}`);
}

if (!resolverSource.includes("'real-estate-skyline-estate': 'real-estate-skyline'")) {
  fail('Legacy Skyline compatibility alias is missing.');
}
if (!registrySource.includes("'real-estate-skyline': SkylineEstateTemplate")) {
  fail('Canonical Skyline registry entry is missing.');
}

const compiled = ts.transpileModule(resolverSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, { module, exports: module.exports });
const { resolveTemplate, normalizeTemplateId } = module.exports;

function businessTypeFor(id) {
  if (id.startsWith('real-estate-')) return 'real_estate';
  if (id.startsWith('services-')) return 'services';
  if (id.startsWith('medical-')) return 'medical';
  if (id.startsWith('clothing-')) return 'clothing';
  if (id.startsWith('retail-')) return 'retail';
  if (id === 'catalog-inquiry') return 'catalog';
  return 'restaurant';
}

for (const id of resolverIds) {
  const resolved = resolveTemplate({ businessType: businessTypeFor(id), businessSubCategorySlug: id });
  if (resolved !== id) fail(`${id} resolves to ${resolved}, not itself.`);
}

if (normalizeTemplateId('real-estate-skyline-estate') !== 'real-estate-skyline') {
  fail('Legacy Skyline ID does not normalize to the canonical ID.');
}
if (resolveTemplate({ businessType: 'real_estate', businessSubCategorySlug: 'real-estate-skyline-estate' }) !== 'real-estate-skyline') {
  fail('Legacy Skyline ID does not resolve to the Skyline template.');
}
if (resolveTemplate({ businessType: 'real_estate', businessSubCategorySlug: 'unknown-template' }) !== 'real-estate-default') {
  fail('Unknown real-estate IDs do not use the intended default fallback.');
}

console.log(`Template contract passed: ${resolverIds.length} unique resolver IDs match the registry.`);
console.log('Skyline: real-estate-skyline (canonical), real-estate-skyline-estate (legacy compatibility alias).');

// ── Capability contract (M1-12) ─────────────────────────────────────────────────────────────
// What each template is allowed to offer, checked against what its source actually wires up.
// checkout: real cart + POST /orders (guest or signed-in) through CheckoutDrawer or the street-food
//   checkout; delivery/pickup are then offered only as the store's M1-05 fulfillment config allows.
// appointment: real slots + POST /appointments (signed-in customer).
// whatsapp: prefilled WhatsApp message, rendered only when the store has a WhatsApp number.
const FOOD = { family: 'food', checkout: true, appointment: false };
const CONTACT = { checkout: false, appointment: false, whatsapp: true };
const CAPABILITIES = {
  'restaurant-default': { ...FOOD, whatsapp: true },
  ...Object.fromEntries(['coffee-artisan'].map(id => [id, { ...FOOD, whatsapp: true }])),
  ...Object.fromEntries([
    'coffee-urban-rush', 'coffee-cyber-brew', 'coffee-green-leaf', 'coffee-drive-thru', 'coffee-cupping-room',
    'coffee-industrial-brew', 'coffee-matcha-zen', 'coffee-retro-groove', 'coffee-blossom', 'coffee-neon-drip',
    'coffee-luxury-espresso', 'coffee-aurora-brew', 'coffee-tropical-bloom', 'coffee-dark-academia',
    'burger-restaurant', 'dessert-shop', 'ramen-shop', 'mediterranean-restaurant', 'smoothie-bar',
    'korean-grille', 'french-brasserie',
  ].map(id => [id, { ...FOOD, whatsapp: false }])),
  'street-food-pop': { ...FOOD, whatsapp: true },
  'retail-classic': { family: 'retail', checkout: true, appointment: false, whatsapp: false },
  'retail-luxe-boutique': { family: 'retail', checkout: true, appointment: false, whatsapp: false },
  'catalog-inquiry': { family: 'catalog', ...CONTACT },
  ...Object.fromEntries(['clothing-editorial', 'clothing-streetwear', 'clothing-boutique']
    .map(id => [id, { family: 'clothing', checkout: true, appointment: false, whatsapp: true }])),
  ...Object.fromEntries(['real-estate-default', 'real-estate-open-house', 'real-estate-skyline']
    .map(id => [id, { family: 'real-estate', checkout: false, appointment: true, whatsapp: true }])),
  ...Object.fromEntries(['real-estate-prestige', 'real-estate-agency', 'real-estate-corporate', 'real-estate-noir',
    'real-estate-bold', 'real-estate-soleil', 'real-estate-axiom'].map(id => [id, { family: 'real-estate', ...CONTACT }])),
  ...Object.fromEntries(['services-hub', 'services-serenity-spa']
    .map(id => [id, { family: 'services', checkout: false, appointment: true, whatsapp: true }])),
  ...Object.fromEntries(['services-meridian', 'services-volt', 'services-wellness', 'services-studio']
    .map(id => [id, { family: 'services', ...CONTACT }])),
  ...Object.fromEntries(['medical-clinic', 'medical-pharmacy', 'medical-premium']
    .map(id => [id, { family: 'medical', ...CONTACT }])),
};

const manifestIds = Object.keys(CAPABILITIES);
const unmapped = setDifference(resolverIds, manifestIds);
const extra = setDifference(manifestIds, resolverIds);
if (unmapped.length || extra.length) {
  fail(`Capability manifest mismatch. Missing: ${unmapped.join(', ') || 'none'}; unknown: ${extra.join(', ') || 'none'}`);
}

// Registry id -> component source file (clothing ids go through ClothingStorefront).
const importPaths = Object.fromEntries([...registrySource.matchAll(/import (\w+) from '@\/components\/storefront\/([^']+)';/g)]
  .map(match => [match[1], path.join(root, 'components', 'storefront', `${match[2]}.tsx`)]));
const CLOTHING_FILES = {
  'clothing-editorial': 'FashionEditorialTemplate',
  'clothing-streetwear': 'VoidDripTemplate',
  'clothing-boutique': 'PetalStudioTemplate',
};
const registryBody = registrySource.match(/const TEMPLATE_REGISTRY:[\s\S]*?= \{([\s\S]*?)\n\};/)[1];
const componentOf = Object.fromEntries([...registryBody.matchAll(/^\s*'([^']+)': (\w+),/gm)].map(match => [match[1], match[2]]));
function templateFile(id) {
  if (CLOTHING_FILES[id]) return path.join(root, 'components', 'storefront', 'clothing', `${CLOTHING_FILES[id]}.tsx`);
  const file = importPaths[componentOf[id]];
  if (!file || !fs.existsSync(file)) fail(`${id}: component ${componentOf[id]} has no source file.`);
  return file;
}
// A template's own file plus sibling modules it imports (RestaurantDefaultPage is split into parts).
function templateSource(file) {
  let source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(/from '\.\/(\w+)'/g)) {
    const sibling = path.join(path.dirname(file), `${match[1]}.tsx`);
    if (fs.existsSync(sibling)) source += `\n${fs.readFileSync(sibling, 'utf8')}`;
  }
  return source;
}

const problems = [];
const matrix = [];
for (const id of resolverIds) {
  const expected = CAPABILITIES[id];
  const file = templateFile(id);
  const source = templateSource(file);
  const actual = {
    checkout: /CheckoutDrawer|createOrder\(/.test(source) && /readCartDraft/.test(source),
    appointment: /bookAppointment\(/.test(source) && /getUpcomingSlots\(/.test(source),
    whatsapp: /wa\.me|WhatsAppButton/.test(source),
  };
  for (const key of ['checkout', 'appointment', 'whatsapp']) {
    if (actual[key] !== expected[key]) problems.push(`${id}: ${key} expected ${expected[key]} but source says ${actual[key]}`);
  }
  if (!expected.checkout && /add to (cart|bag|order)/i.test(source)) problems.push(`${id}: shows an add-to-cart control without checkout`);
  if (expected.appointment && !/setSlotsError\(true\)/.test(source)) problems.push(`${id}: slot load failure is not distinguished from "no times"`);
  matrix.push({ id, component: path.basename(file, '.tsx'), ...expected });
}

// Patterns that put fake or wrong data on a real storefront.
const FORBIDDEN = [
  [/CURRENCY_SYMBOLS|priceUsd|SAMPLE_DISHES|\bMYR\b|'RM'/, 'hardcoded currency or sample data'],
  // (animation timings such as `delay: x.toFixed(2)` are not money)
  [/^(?!.*\b(delay|dur):).*\.toFixed\(2\)/, 'two-decimal money formatting (use formatMoney with the store currency)'],
  [/^[^`]*\$\{[^}]*(price|total|Price|Total)/, 'literal "$" before a price'],
  [/>[^<{]*\$\s?\d/, 'hardcoded "$" amount in markup'],
  [/alert\(/, 'alert() in a storefront'],
  [/ratingLabel="/, 'hardcoded rating'],
  [/\{\s*(v|num|val):\s*(c|count)\d/, 'animated business statistic (illustrative counter)'],
  [/\bCATEGORIES(_DEFAULT)?\.map\(/, 'hardcoded category filter tabs (use the store\'s product categories)'],
  [/wa\.me\/\$\{\(store\.whatsappNumber \?\? ''\)/, 'WhatsApp link that ignores a missing number'],
];
const FABRICATED = /\b(AGENTS|DOCTORS|PHARMACISTS|TEAM|TESTIMONIALS|CLIENTS)\.map\(/;
const storefrontFiles = fs.readdirSync(path.join(root, 'components', 'storefront'), { recursive: true })
  .filter(name => name.endsWith('.tsx'))
  .map(name => path.join(root, 'components', 'storefront', name));
for (const file of storefrontFiles) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const demoRegions = [];
  lines.forEach((line, index) => {
    const where = `${path.relative(root, file)}:${index + 1}`;
    const open = line.match(/^(\s*)\{data\.demo && \(/);
    if (open) demoRegions.push(open[1]);
    // Illustrative content is allowed inside a data.demo block (the /templates showcase only).
    if (demoRegions.length === 0) {
      for (const [pattern, label] of FORBIDDEN) if (pattern.test(line)) problems.push(`${where}: ${label}`);
    }
    if (FABRICATED.test(line) && demoRegions.length === 0) problems.push(`${where}: illustrative people/reviews rendered outside a data.demo block`);
    const close = line.match(/^(\s*)(<\/>)?\)\}\s*$/);
    if (close && demoRegions.length && close[1] === demoRegions[demoRegions.length - 1]) demoRegions.pop();
  });
}

// Real vs preview data paths.
const previewSource = fs.readFileSync(path.join(root, 'app', 'templates', '[id]', 'page.tsx'), 'utf8');
const realRouteSource = fs.readFileSync(path.join(root, 'app', 'store', '[slug]', 'page.tsx'), 'utf8');
const mockSource = fs.readFileSync(path.join(root, 'lib', 'data', 'mock-stores.ts'), 'utf8');
const rendererSource = registrySource;
const mapperSource = fs.readFileSync(path.join(root, 'lib', 'api', 'storefront-api.ts'), 'utf8');
if (!/demo: true/.test(previewSource)) problems.push('preview route does not mark its mock data as demo');
for (const id of resolverIds) {
  if (!previewSource.includes(`'${id}'`)) problems.push(`preview route does not list ${id}`);
  if (!mockSource.includes(`'${id}': {`)) problems.push(`no preview mock store for ${id}`);
}
if (/mock-stores|local-storefront|getMockStore/.test(realRouteSource)) problems.push('real storefront route imports mock/local data');
if (!/fetchStorefront/.test(realRouteSource)) problems.push('real storefront route does not load backend data');
if (!/openingHours: undefined/.test(rendererSource)) problems.push('real storefront can show preset hours instead of the live M1-03 status');
if (!/currencySuffix: raw\.currency/.test(mapperSource)) problems.push('real storefront currency is not the store ISO code');

if (problems.length) fail(`Capability contract failed:\n  - ${problems.join('\n  - ')}`);

const count = key => matrix.filter(row => row[key]).length;
console.log(`Capability contract passed: ${matrix.length} templates — checkout ${count('checkout')}, appointment ${count('appointment')}, WhatsApp contact ${count('whatsapp')}, contact-only ${matrix.filter(row => !row.checkout && !row.appointment).length}.`);
if (process.argv.includes('--matrix')) console.table(matrix);
