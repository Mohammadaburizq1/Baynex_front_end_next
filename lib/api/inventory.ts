import { apiRequest } from './client';

// Shapes of com.byonix.shoplink.api.dto.InventoryDtos.

export type StockStatus = 'UNTRACKED' | 'OK' | 'LOW' | 'OUT';
export type AdjustMode = 'SET' | 'DELTA';
/** The reasons a merchant can pick; ORDER_* and INITIAL are written by the system. */
export type ManualReason = 'RESTOCK' | 'CORRECTION' | 'DAMAGED' | 'RETURNED';
export type LedgerReason = ManualReason | 'INITIAL' | 'ORDER_PLACED' | 'ORDER_CANCELLED';

/** One stockable thing: a product without variants, or one variant of a product that has them. */
export interface InventoryRow {
  productId: string;
  variantId: string | null;
  name: string;
  variantLabel: string | null;
  sku: string | null;
  /** null = not counted. */
  stock: number | null;
  /** The item's own threshold override; null = the store default. */
  lowStockThreshold: number | null;
  effectiveThreshold: number;
  status: StockStatus;
  available: boolean;
}

export interface StockAlerts { lowCount: number; outCount: number; items: InventoryRow[] }

export interface HistoryEntry {
  id: string;
  productId: string;
  variantId: string | null;
  itemName: string;
  delta: number;
  stockAfter: number;
  reason: LedgerReason;
  /** The order code for sale / cancellation rows. */
  reference: string | null;
  note: string | null;
  /** Who made a merchant-side change; null for a customer's own order. */
  createdBy: string | null;
  createdAt: string;
}

export interface AdjustInput {
  productId: string;
  variantId?: string | null;
  mode: AdjustMode;
  quantity: number;
  reason: ManualReason;
  note?: string;
}

export const REASON_LABELS: Record<LedgerReason, string> = {
  RESTOCK: 'Restock',
  CORRECTION: 'Correction',
  DAMAGED: 'Damaged / lost',
  RETURNED: 'Returned',
  INITIAL: 'Opening count',
  ORDER_PLACED: 'Order placed',
  ORDER_CANCELLED: 'Order cancelled',
};

export function getInventory(storeId: string): Promise<InventoryRow[]> {
  return apiRequest<InventoryRow[]>(`/api/dashboard/inventory?storeId=${encodeURIComponent(storeId)}`);
}

export function getStockAlerts(storeId: string): Promise<StockAlerts> {
  return apiRequest<StockAlerts>(`/api/dashboard/inventory/alerts?storeId=${encodeURIComponent(storeId)}`);
}

export function getStockHistory(
  storeId: string,
  filter: { productId?: string; variantId?: string; limit?: number } = {},
): Promise<HistoryEntry[]> {
  const q = new URLSearchParams({ storeId });
  if (filter.productId) q.set('productId', filter.productId);
  if (filter.variantId) q.set('variantId', filter.variantId);
  if (filter.limit) q.set('limit', String(filter.limit));
  return apiRequest<HistoryEntry[]>(`/api/dashboard/inventory/history?${q.toString()}`);
}

export function adjustStock(input: AdjustInput): Promise<InventoryRow> {
  return apiRequest<InventoryRow>('/api/dashboard/inventory/adjust', {
    method: 'POST',
    body: JSON.stringify({ ...input, variantId: input.variantId ?? undefined }),
  });
}
