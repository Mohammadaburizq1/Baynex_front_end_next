import { apiRequest } from './client';

// com.byonix.shoplink.api.dto.AnalyticsDtos.DailyStoreSalesRow — one row per day that actually
// had sales. A day with zero orders simply has no row at all; callers fill gaps themselves (see
// buildDailySeries in the Reports page) rather than the backend padding a date range with zeros.
export interface ApiDailyStoreSales {
  saleDate: string;
  storeId: string;
  storeName: string;
  totalRevenue: number;
  orderCount: number;
}

// com.byonix.shoplink.api.dto.AnalyticsDtos.TopProductRow — productId/categoryName are null for
// a line item whose product was since deleted (name still comes from the order's own snapshot).
export interface ApiTopProduct {
  productId: string | null;
  name: string;
  categoryName: string | null;
  unitsSold: number;
  revenue: number;
}

export async function getDailyStoreSales(storeId: string, from: string, to: string): Promise<ApiDailyStoreSales[]> {
  const params = new URLSearchParams({ storeId, from, to });
  return apiRequest<ApiDailyStoreSales[]>(`/api/dashboard/analytics/daily-store-sales?${params.toString()}`);
}

export async function getTopProducts(storeId: string, from: string, to: string, limit = 10): Promise<ApiTopProduct[]> {
  const params = new URLSearchParams({ storeId, from, to, limit: String(limit) });
  return apiRequest<ApiTopProduct[]>(`/api/dashboard/analytics/top-products?${params.toString()}`);
}
