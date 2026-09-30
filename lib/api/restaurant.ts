import { apiRequest } from './client';

// POS-26 restaurant setup (backend DashboardRestaurantController / RestaurantSetupService). Store
// scoping and permissions (ORDERS view to read, POS manager rights to change) are enforced by the
// backend; nothing here is trusted by it.

// restaurantMode: the merchant's explicit choice; null or absent (the backend omits nulls) = follow
// the business type.
export interface RestaurantSettings {
  restaurantMode?: boolean | null;
  effective: boolean;
  byBusinessType: boolean;
}

export interface RestaurantArea {
  id: string;
  name: string;
  sortOrder: number;
  active: boolean;
}

export interface RestaurantTable {
  id: string;
  areaId: string;
  name: string;
  capacity: number | null;
  sortOrder: number;
  active: boolean;
}

export interface AreaInput {
  name: string;
  sortOrder?: number;
  active?: boolean;
}

export interface TableInput {
  areaId: string;
  name: string;
  capacity?: number | null;
  sortOrder?: number;
  active?: boolean;
}

// OPEN | COMPLETED | MERGED | CANCELLED. Money arrives as JSON numbers at scale 3 (display only).
export interface TableOrder {
  id: string;
  orderCode: string;
  ticketNumber: string | null;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  status: string;
  guestCount: number | null;
  waiterName: string | null;
  total: number;
  paid: number;
  openedAt: string | null;
  closedAt: string | null;
  tableId: string | null;
}

const q = (storeId: string) => `storeId=${encodeURIComponent(storeId)}`;

export const getRestaurantSettings = (storeId: string) =>
  apiRequest<RestaurantSettings>(`/api/dashboard/restaurant/settings?${q(storeId)}`);

export const updateRestaurantSettings = (storeId: string, restaurantMode: boolean | null) =>
  apiRequest<RestaurantSettings>(`/api/dashboard/restaurant/settings?${q(storeId)}`, {
    method: 'PUT',
    body: JSON.stringify({ restaurantMode }),
  });

export const listAreas = (storeId: string) => apiRequest<RestaurantArea[]>(`/api/dashboard/restaurant/areas?${q(storeId)}`);

export const createArea = (storeId: string, input: AreaInput) =>
  apiRequest<RestaurantArea>(`/api/dashboard/restaurant/areas?${q(storeId)}`, { method: 'POST', body: JSON.stringify(input) });

export const updateArea = (id: string, input: AreaInput) =>
  apiRequest<RestaurantArea>(`/api/dashboard/restaurant/areas/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(input) });

export const listTables = (storeId: string) => apiRequest<RestaurantTable[]>(`/api/dashboard/restaurant/tables?${q(storeId)}`);

export const createTable = (storeId: string, input: TableInput) =>
  apiRequest<RestaurantTable>(`/api/dashboard/restaurant/tables?${q(storeId)}`, { method: 'POST', body: JSON.stringify(input) });

// Deactivating a table with an open order is refused by the backend (409): settle or move it first.
export const updateTable = (id: string, input: TableInput) =>
  apiRequest<RestaurantTable>(`/api/dashboard/restaurant/tables/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(input) });

export const tableHistory = (tableId: string) =>
  apiRequest<TableOrder[]>(`/api/dashboard/restaurant/tables/${encodeURIComponent(tableId)}/orders`);

export const ORDER_TYPE_LABEL: Record<TableOrder['orderType'], string> = {
  DINE_IN: 'Dine-in',
  TAKEAWAY: 'Takeaway',
  DELIVERY: 'Delivery',
};

export const ORDER_STATE_LABEL: Record<string, string> = {
  OPEN: 'Open',
  COMPLETED: 'Settled',
  MERGED: 'Merged',
  CANCELLED: 'Cancelled',
};
