import { apiRequest, API_BASE } from './client';
import { customerApiRequest } from './customer-client';

export type AppointmentStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface ApiAppointmentSlot {
  id: string;
  storeId: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  bookedCount: number;
  active: boolean;
}

export interface SlotFormData {
  startsAt: string;
  endsAt: string;
  capacity?: number;
  active?: boolean;
}

export interface ApiAppointment {
  id: string;
  storeId: string;
  slotId: string;
  slotStartsAt: string;
  slotEndsAt: string;
  productId?: string;
  productName?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
}

// ── Dashboard (merchant-authenticated) ──────────────────────────────────────────

export async function getAppointmentSlots(storeId?: string): Promise<ApiAppointmentSlot[]> {
  const query = storeId ? `?storeId=${encodeURIComponent(storeId)}` : '';
  return apiRequest<ApiAppointmentSlot[]>(`/api/dashboard/appointment-slots${query}`);
}

export async function createAppointmentSlot(storeId: string, data: SlotFormData): Promise<ApiAppointmentSlot> {
  return apiRequest<ApiAppointmentSlot>('/api/dashboard/appointment-slots', {
    method: 'POST',
    body: JSON.stringify({ storeId, ...data }),
  });
}

export async function deleteAppointmentSlot(id: string): Promise<void> {
  return apiRequest(`/api/dashboard/appointment-slots/${id}`, { method: 'DELETE' });
}

export async function getAppointments(storeId?: string): Promise<ApiAppointment[]> {
  const query = storeId ? `?storeId=${encodeURIComponent(storeId)}` : '';
  return apiRequest<ApiAppointment[]>(`/api/dashboard/appointments${query}`);
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<ApiAppointment> {
  return apiRequest<ApiAppointment>(`/api/dashboard/appointments/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// ── Storefront (customer-authenticated, public read) ────────────────────────────

export async function getUpcomingSlots(slug: string): Promise<ApiAppointmentSlot[]> {
  const res = await fetch(`${API_BASE}/api/public/stores/${slug}/appointment-slots`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Could not load available times.');
  return body.data;
}

export interface BookAppointmentPayload {
  slotId: string;
  productId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  notes?: string;
}

// Customer-authenticated — mirrors checkout.ts's createOrder (booking requires a logged-in
// customer account, same as placing a real order).
export async function bookAppointment(slug: string, payload: BookAppointmentPayload): Promise<ApiAppointment> {
  return customerApiRequest<ApiAppointment>(`/api/public/stores/${slug}/appointments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
