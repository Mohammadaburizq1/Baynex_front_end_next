import type { ClothingTemplateContent } from '@/lib/types/clothing-template-content';

// ── Business / Store ──────────────────────────────────────────────────────────

export type BusinessType = 'retail' | 'restaurant' | 'real_estate' | 'services' | 'catalog' | 'clothing';
export type UserRole = 'owner' | 'staff' | 'admin';
// 'active' / 'draft' / 'suspended' mirror the backend StoreStatus enum (lowercased).
// 'inactive' / 'pending' are legacy local-only values used by the (mock) open/closed toggle.
export type StoreStatus = 'active' | 'draft' | 'suspended' | 'inactive' | 'pending';

export interface Store {
  id: string;
  name: string;
  slug: string;
  businessType: BusinessType;
  category: string;
  logo?: string;
  coverImage?: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  timezone: string;
  locale?: string;
  status: StoreStatus;
  // Whether the store is accepting orders right now — separate from `status` (published/draft).
  // Local-only preference; the backend has no concept of this yet.
  acceptingOrders?: boolean;
  theme: string;
  templateContent?: ClothingTemplateContent;
  createdAt: string;
}

// ── Auth / User ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// ── Product / Menu Item ───────────────────────────────────────────────────────

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  categoryId: string;
  images: string[];
  stock: number;
  sku: string;
  status: ProductStatus;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

// Mirrors the backend's PaymentStatus enum (UNPAID/PENDING/PAID/FAILED/REFUNDED/
// PARTIALLY_REFUNDED — see lib/api/orders.ts's PAYMENT_STATUS_FROM_BACKEND), independent of both
// OrderStatus (fulfillment) and PaymentMethod (intent). 'partial' = PARTIALLY_REFUNDED.
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded' | 'partial';
export type PaymentMethod = 'cash' | 'card' | 'online' | 'wallet';
export type FulfillmentType = 'delivery' | 'pickup' | 'dine_in';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  // Copied onto the line when it was bought — they stay true if the variant/add-on is edited later.
  variantLabel?: string;
  sku?: string;
  modifiers?: { groupName: string; optionName: string; priceDelta: number }[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  discountCode?: string;
  tax: number;
  total: number;
  /** Null for orders created before currency snapshots were introduced. */
  currency?: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Customers ─────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
}

// ── Delivery ──────────────────────────────────────────────────────────────────

export interface DeliveryZone {
  id: string;
  name: string;
  areas: string[];
  minOrder: number;
  deliveryFee: number;
  estimatedTime: string;
  isActive: boolean;
}

export interface DeliverySettings {
  zones: DeliveryZone[];
  freeDeliveryThreshold?: number;
  maxDeliveryRadius?: number;
  defaultEstimatedTime: string;
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  lowStockThreshold: number;
  reorderQty: number;
  unitCost: number;
  stockStatus: StockStatus;
  lastUpdated: string;
}

// ── Reports / Analytics ───────────────────────────────────────────────────────

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface ReportSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  avgOrderChange: number;
}

// ── Appointments ──────────────────────────────────────────────────────────────

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  service: string;
  staffMember?: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  price: number;
  createdAt: string;
}

// ── Stat Cards ────────────────────────────────────────────────────────────────

export interface StatCardData {
  title: string;
  value: string | number;
  // Omit when there's no real comparison to show — the card then shows only changeLabel.
  change?: number;
  changeLabel: string;
  icon: string;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';
}

// ── Navigation ────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  roles?: UserRole[];
  businessTypes?: BusinessType[];
}
