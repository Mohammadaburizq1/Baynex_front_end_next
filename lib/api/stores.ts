import { apiRequest } from './client';

// Fields returned by the backend
export interface ApiStore {
  id: string;
  slug: string;
  name: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  phone?: string;
  whatsappNumber?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  primaryColor?: string;
  secondaryColor?: string;
  categorySlug?: string;
  subCategorySlug?: string;
  templateKey?: string;
  status?: string;
  createdAt?: string;
  freeDeliveryThreshold?: number;
  defaultEstimatedTime?: string;
  pickupAvailable?: boolean;
}

// Fields sent when creating/updating a store (matches backend StoreRequest DTO)
export interface StorePayload {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  phone?: string;
  whatsappNumber?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  primaryColor?: string;
  secondaryColor?: string;
  categorySlug: string;
  subCategorySlug?: string;
  templateKey?: string;
  freeDeliveryThreshold?: number;
  defaultEstimatedTime?: string;
  pickupAvailable?: boolean;
  // Matches backend StoreStatus enum casing (DRAFT / ACTIVE / SUSPENDED).
  status?: 'DRAFT' | 'ACTIVE' | 'SUSPENDED';
}

export async function getMyStores(): Promise<ApiStore[]> {
  return apiRequest<ApiStore[]>('/api/dashboard/stores/my');
}

export async function createStore(data: StorePayload, idempotencyKey?: string): Promise<ApiStore> {
  return apiRequest<ApiStore>('/api/dashboard/stores', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
  });
}

export async function updateStore(id: string, data: Partial<StorePayload>): Promise<ApiStore> {
  return apiRequest<ApiStore>(`/api/dashboard/stores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteStore(id: string): Promise<void> {
  return apiRequest(`/api/dashboard/stores/${id}`, { method: 'DELETE' });
}
