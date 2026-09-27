import { apiRequest } from './client';

// Conflicts the backend recorded while uploading offline POS sales (PosSyncConflictService).
// The sale itself is always kept as an order; these are what the manager should check.
export type PosConflictType =
  | 'OVERSOLD'
  | 'PRODUCT_DELETED'
  | 'PRODUCT_UNAVAILABLE'
  | 'VARIANT_DELETED'
  | 'VARIANT_UNAVAILABLE'
  | 'PRODUCT_CHANGED'
  | 'PRICE_CHANGED';

export interface PosConflict {
  id: string;
  storeId: string;
  deviceId: string | null;
  deviceName: string | null;
  orderId: string | null;
  orderCode: string | null;
  receiptNumber: string | null;
  type: PosConflictType;
  productId: string | null;
  variantId: string | null;
  itemName: string;
  requestedQuantity: number | null;
  appliedQuantity: number | null;
  shortfall: number | null;
  stockBefore: number | null;
  stockAfter: number | null;
  saleUnitPrice: number | null;
  currentUnitPrice: number | null;
  detail: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
}

export interface PosConflictSummary {
  open: number;
  conflicts: PosConflict[];
}

export const POS_CONFLICT_LABEL: Record<PosConflictType, string> = {
  OVERSOLD: 'Sold beyond stock',
  PRODUCT_DELETED: 'Product deleted',
  PRODUCT_UNAVAILABLE: 'Product switched off',
  VARIANT_DELETED: 'Option deleted',
  VARIANT_UNAVAILABLE: 'Option switched off',
  PRODUCT_CHANGED: 'Product options changed',
  PRICE_CHANGED: 'Price changed after sale',
};

export async function getPosConflicts(storeId: string, status?: 'OPEN' | 'RESOLVED'): Promise<PosConflictSummary> {
  const query = `?storeId=${encodeURIComponent(storeId)}${status ? `&status=${status}` : ''}`;
  return apiRequest<PosConflictSummary>(`/api/dashboard/pos-sync/conflicts${query}`);
}

export async function resolvePosConflict(id: string, note?: string): Promise<PosConflict> {
  return apiRequest<PosConflict>(`/api/dashboard/pos-sync/conflicts/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ note: note?.trim() || null }),
  });
}
