import { apiRequest } from './client';

// Derived from real orders — there's no Customer entity. Backend groups by customer_id when the
// order was placed by a logged-in account, falling back to phone (or email) for guest orders.
// See OrderRepository.queryCustomerSummaries on the backend for the exact aggregation.
export interface ApiCustomerSummary {
  // Omitted entirely by the backend (not sent as null) for a guest order with no linked account
  // — the global Jackson config drops null fields, so this key can simply be absent.
  customerId?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  orderCount: number;
  totalSpent: number;
  firstOrderAt: string;
  lastOrderAt: string;
}

export async function getCustomerSummaries(storeId: string): Promise<ApiCustomerSummary[]> {
  return apiRequest<ApiCustomerSummary[]>(`/api/dashboard/customers?storeId=${encodeURIComponent(storeId)}`);
}
