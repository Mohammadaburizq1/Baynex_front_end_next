import { apiRequest, API_BASE } from './client';

export interface PublicFulfillment {
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  freeDeliveryThreshold?: number | null;
  zones: ApiDeliveryZone[];
}

export async function getPublicFulfillment(slug: string): Promise<PublicFulfillment> {
  const res = await fetch(`${API_BASE}/api/public/stores/${encodeURIComponent(slug)}/fulfillment`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Could not load fulfillment options.');
  return body.data;
}

export interface ApiDeliveryZone {
  id: string;
  storeId: string;
  name: string;
  areas: string[];
  minOrder: number;
  deliveryFee: number;
  estimatedTime?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface DeliveryZonePayload {
  storeId: string;
  name: string;
  areas: string[];
  minOrder: number;
  deliveryFee: number;
  estimatedTime?: string;
  isActive: boolean;
  sortOrder?: number;
}

export async function getDeliveryZones(): Promise<ApiDeliveryZone[]> {
  return apiRequest<ApiDeliveryZone[]>('/api/dashboard/delivery-zones');
}

export async function createDeliveryZone(data: DeliveryZonePayload): Promise<ApiDeliveryZone> {
  return apiRequest<ApiDeliveryZone>('/api/dashboard/delivery-zones', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDeliveryZone(id: string, data: DeliveryZonePayload): Promise<ApiDeliveryZone> {
  return apiRequest<ApiDeliveryZone>(`/api/dashboard/delivery-zones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteDeliveryZone(id: string): Promise<void> {
  return apiRequest(`/api/dashboard/delivery-zones/${id}`, { method: 'DELETE' });
}
