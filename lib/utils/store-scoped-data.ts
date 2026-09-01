import type {
  BusinessType,
  Customer,
  DeliveryZone,
  InventoryItem,
  Order,
  Product,
  ProductCategory,
} from '@/lib/types';
import {
  mockDeliveryZones,
  mockInventory,
  mockOrders,
  mockProducts,
  mockCategories,
} from '@/lib/mock-data';

const DEMO_SLUG = 'demo-store';

function key(slug: string, type: string) {
  return `shoplink_${type}_${slug}`;
}

export function isDemoStore(slug: string) {
  return slug === DEMO_SLUG;
}

function readJson<T>(storageKey: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(storageKey: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch { /* ignore */ }
}

export function initStoreData(slug: string) {
  if (isDemoStore(slug)) return;
  writeJson(key(slug, 'products'), []);
  writeJson(key(slug, 'orders'), []);
  writeJson(key(slug, 'inventory'), []);
  writeJson(key(slug, 'delivery_zones'), []);
}

export function loadStoreProducts(slug: string): Product[] {
  if (isDemoStore(slug)) return mockProducts;
  return readJson<Product[]>(key(slug, 'products'), []);
}

export function saveStoreProducts(slug: string, products: Product[]) {
  if (isDemoStore(slug)) return;
  writeJson(key(slug, 'products'), products);
}

export function loadStoreOrders(slug: string): Order[] {
  if (isDemoStore(slug)) return mockOrders;
  return readJson<Order[]>(key(slug, 'orders'), []);
}

export function saveStoreOrders(slug: string, orders: Order[]) {
  if (isDemoStore(slug)) return;
  writeJson(key(slug, 'orders'), orders);
}

export function loadStoreInventory(slug: string): InventoryItem[] {
  if (isDemoStore(slug)) return mockInventory;
  return readJson<InventoryItem[]>(key(slug, 'inventory'), []);
}

export function saveStoreInventory(slug: string, items: InventoryItem[]) {
  if (isDemoStore(slug)) return;
  writeJson(key(slug, 'inventory'), items);
}

export function loadStoreDeliveryZones(slug: string): DeliveryZone[] {
  if (isDemoStore(slug)) return mockDeliveryZones;
  return readJson<DeliveryZone[]>(key(slug, 'delivery_zones'), []);
}

export function saveStoreDeliveryZones(slug: string, zones: DeliveryZone[]) {
  if (isDemoStore(slug)) return;
  writeJson(key(slug, 'delivery_zones'), zones);
}

const CLOTHING_CATEGORIES: ProductCategory[] = [
  { id: 'cat-dresses', name: 'Dresses', slug: 'dresses' },
  { id: 'cat-tops', name: 'Tops', slug: 'tops' },
  { id: 'cat-bottoms', name: 'Bottoms', slug: 'bottoms' },
  { id: 'cat-accessories', name: 'Accessories', slug: 'accessories' },
];

export function loadStoreCategories(businessType: BusinessType): ProductCategory[] {
  if (businessType === 'clothing') return CLOTHING_CATEGORIES;
  if (businessType === 'restaurant') return mockCategories;
  return [
    { id: 'cat-general', name: 'General', slug: 'general' },
    ...CLOTHING_CATEGORIES.slice(0, 2),
  ];
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  activeProducts: number;
  totalCustomers: number;
  pendingOrders: number;
}

export function computeDashboardStats(
  orders: Order[],
  products: Product[],
  customers: Customer[],
): DashboardStats {
  const completed = orders.filter(o => o.status === 'delivered');
  const totalRevenue = completed.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = completed.length > 0 ? totalRevenue / completed.length : 0;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const pendingOrders = orders.filter(
    o => o.status === 'pending' || o.status === 'confirmed',
  ).length;

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    activeProducts,
    totalCustomers: customers.length,
    pendingOrders,
  };
}

export function lowStockProducts(products: Product[], threshold = 10) {
  return products
    .filter(p => p.stock <= threshold)
    .map(p => ({ name: p.name, stock: p.stock }))
    .slice(0, 5);
}
