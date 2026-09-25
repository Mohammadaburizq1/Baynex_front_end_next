import { apiRequest } from './client';

// Mirrors com.byonix.shoplink.domain.enums.DashboardSection / PermissionLevel. Inventory and
// Insights aren't separate backend sections — they read the same PRODUCTS/REPORTS data, see
// Sidebar.tsx's SECTION_FOR_NAV map.
export type DashboardSection =
  | 'PRODUCTS' | 'ORDERS' | 'DELIVERY' | 'CUSTOMERS' | 'REPORTS' | 'OFFERS' | 'APPOINTMENTS' | 'STOREFRONT';
export type PermissionLevel = 'NONE' | 'VIEW' | 'EDIT';

export interface PermissionGrant {
  section: DashboardSection;
  level: PermissionLevel;
}

// Always a complete grid (one entry per DashboardSection) — the backend fills in defaults (EDIT) for any section without
// an explicit row, so callers never have to reason about a missing key.
export type PermissionGrid = Record<DashboardSection, PermissionLevel>;

function toGrid(grants: PermissionGrant[]): PermissionGrid {
  const grid = {} as PermissionGrid;
  for (const g of grants) grid[g.section] = g.level;
  return grid;
}

// Owner-only — another staff member's grid, for the Permissions editor on the Team card.
export async function getStaffPermissions(userId: string): Promise<PermissionGrid> {
  const grants = await apiRequest<PermissionGrant[]>(`/api/dashboard/staff/${encodeURIComponent(userId)}/permissions`);
  return toGrid(grants);
}

// Owner-only — replace-all upsert for the given sections.
export async function updateStaffPermissions(userId: string, grants: PermissionGrant[]): Promise<PermissionGrid> {
  const updated = await apiRequest<PermissionGrant[]>(`/api/dashboard/staff/${encodeURIComponent(userId)}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ grants }),
  });
  return toGrid(updated);
}

// Self-service — any authenticated merchant's own effective grid (owners always come back all-EDIT).
export async function getMyPermissions(): Promise<PermissionGrid> {
  const grants = await apiRequest<PermissionGrant[]>('/api/dashboard/staff/me/permissions');
  return toGrid(grants);
}

export const ALL_EDIT_GRID: PermissionGrid = {
  PRODUCTS: 'EDIT', ORDERS: 'EDIT', DELIVERY: 'EDIT', CUSTOMERS: 'EDIT', REPORTS: 'EDIT', OFFERS: 'EDIT',
  APPOINTMENTS: 'EDIT', STOREFRONT: 'EDIT',
};
