import { apiRequest } from './client';

// Mirrors com.byonix.shoplink.api.dto.ThemeContentDtos.DashboardContentResponse. `content` is
// opaque JSON on the backend — callers cast draftContent/publishedContent to whichever shape
// they're editing (TemplateContent or ClothingTemplateContent).
export interface ThemeContentDashboard {
  storeId: string;
  draftContent: Record<string, unknown>;
  publishedContent: Record<string, unknown> | null;
  publishedVersion: number;
  draftUpdatedAt: string | null;
  publishedAt: string | null;
}

export interface ThemeContentVersion {
  version: number;
  publishedAt: string;
}

export async function getThemeContent(storeId: string): Promise<ThemeContentDashboard> {
  return apiRequest<ThemeContentDashboard>(`/api/dashboard/theme-content?storeId=${encodeURIComponent(storeId)}`);
}

export async function saveThemeDraft(
  storeId: string,
  content: Record<string, unknown>,
): Promise<ThemeContentDashboard> {
  return apiRequest<ThemeContentDashboard>('/api/dashboard/theme-content', {
    method: 'PUT',
    body: JSON.stringify({ storeId, content }),
  });
}

export async function publishThemeContent(storeId: string): Promise<ThemeContentDashboard> {
  return apiRequest<ThemeContentDashboard>('/api/dashboard/theme-content/publish', {
    method: 'POST',
    body: JSON.stringify({ storeId }),
  });
}

export async function listThemeContentVersions(storeId: string): Promise<ThemeContentVersion[]> {
  return apiRequest<ThemeContentVersion[]>(`/api/dashboard/theme-content/versions?storeId=${encodeURIComponent(storeId)}`);
}

export async function restoreThemeContentVersion(
  storeId: string,
  version: number,
): Promise<ThemeContentDashboard> {
  return apiRequest<ThemeContentDashboard>('/api/dashboard/theme-content/versions/restore', {
    method: 'POST',
    body: JSON.stringify({ storeId, version }),
  });
}
