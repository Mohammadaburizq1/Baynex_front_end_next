import type { OrderStatus, PaymentStatus, StockStatus, ProductStatus, BusinessType } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ── Class name utility ────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ── Formatters ────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number, currency = 'MYR'): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('en-MY', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return formatDate(dateStr);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-MY').format(n);
}

export function formatChange(change: number): string {
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
}

// ── Status helpers ────────────────────────────────────────────────────────────

export const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; color: string }> = {
  pending:          { label: 'Pending',          color: 'bg-amber-100 text-amber-700'   },
  confirmed:        { label: 'Confirmed',         color: 'bg-blue-100 text-blue-700'    },
  preparing:        { label: 'Preparing',         color: 'bg-violet-100 text-violet-700'},
  ready:            { label: 'Ready',             color: 'bg-teal-100 text-teal-700'    },
  out_for_delivery: { label: 'Out for Delivery',  color: 'bg-sky-100 text-sky-700'      },
  delivered:        { label: 'Delivered',         color: 'bg-emerald-100 text-emerald-700'},
  cancelled:        { label: 'Cancelled',         color: 'bg-red-100 text-red-700'      },
  refunded:         { label: 'Refunded',          color: 'bg-slate-100 text-slate-600'  },
};

export const PAYMENT_STATUS_MAP: Record<PaymentStatus, { label: string; color: string }> = {
  unpaid:   { label: 'Unpaid',   color: 'bg-red-100 text-red-700'       },
  paid:     { label: 'Paid',     color: 'bg-emerald-100 text-emerald-700'},
  refunded: { label: 'Refunded', color: 'bg-slate-100 text-slate-600'   },
  partial:  { label: 'Partial',  color: 'bg-amber-100 text-amber-700'   },
};

export const STOCK_STATUS_MAP: Record<StockStatus, { label: string; color: string }> = {
  in_stock:    { label: 'In Stock',     color: 'bg-emerald-100 text-emerald-700'},
  low_stock:   { label: 'Low Stock',    color: 'bg-amber-100 text-amber-700'   },
  out_of_stock:{ label: 'Out of Stock', color: 'bg-red-100 text-red-700'       },
};

export const PRODUCT_STATUS_MAP: Record<ProductStatus, { label: string; color: string }> = {
  active:      { label: 'Active',       color: 'bg-emerald-100 text-emerald-700'},
  inactive:    { label: 'Inactive',     color: 'bg-slate-100 text-slate-600'   },
  out_of_stock:{ label: 'Out of Stock', color: 'bg-red-100 text-red-700'       },
};

// ── Business type label ───────────────────────────────────────────────────────

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  retail:      'Retail Store',
  restaurant:  'Restaurant / F&B',
  real_estate: 'Real Estate',
  services:    'Services',
  catalog:     'Catalogue',
};

export const PRODUCT_LABEL: Record<BusinessType, string> = {
  retail:      'Products',
  restaurant:  'Menu',
  real_estate: 'Listings',
  services:    'Services',
  catalog:     'Products',
};
