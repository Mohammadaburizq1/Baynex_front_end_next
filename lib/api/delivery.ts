import { apiRequest } from './client';

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
