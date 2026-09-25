import { API_BASE } from './client';
import { customerApiRequest, customerTokenStore } from './customer-client';

export interface CustomerUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

interface CustomerProfileResponse {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
}

export interface CustomerOrder {
  id: string;
  storeId: string;
  orderCode: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  customerAddress: string | null;
  deliveryMethod: 'DELIVERY' | 'PICKUP';
  paymentMethod: 'CASH' | 'CARD' | 'WHATSAPP_ONLY';
  paymentStatus: string;
  status: 'NEW' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  deliveryFee: number;
  discount: number;
  discountCode: string | null;
  total: number;
  notes: string | null;
  createdAt: string;
  currency?: string | null;
  items: { id: string; productNameSnapshot: string; quantity: number; unitPrice: number; total: number; variantLabel: string | null; sku: string | null; modifiers: { groupName: string; optionName: string; priceDelta: number }[] }[];
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    role: string;
  };
}

interface ApiEnvelope<T> {
  status: string;
  statusCode: number;
  message: string;
  data: T;
}

export { customerTokenStore };

function mapCustomerUser(raw: { id: string; fullName: string; email: string | null; phone: string | null }): CustomerUser {
  return {
    id: raw.id,
    email: raw.email ?? '',
    name: raw.fullName ?? '',
    phone: raw.phone ?? undefined,
  };
}

export async function customerRegister(data: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<CustomerUser> {
  const res = await fetch(`${API_BASE}/api/public/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body: ApiEnvelope<AuthResponse> = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? 'Registration failed.');
  }

  customerTokenStore.set(body.data.accessToken, body.data.refreshToken);
  return mapCustomerUser(body.data.user);
}

export async function customerLogin(email: string, password: string): Promise<CustomerUser> {
  const res = await fetch(`${API_BASE}/api/public/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const body: ApiEnvelope<AuthResponse> = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? 'Invalid credentials.');
  }

  customerTokenStore.set(body.data.accessToken, body.data.refreshToken);
  return mapCustomerUser(body.data.user);
}

export async function customerMe(): Promise<CustomerUser> {
  const raw = await customerApiRequest<AuthResponse['user']>('/api/public/auth/me');
  return mapCustomerUser(raw);
}

export async function customerProfile(): Promise<CustomerUser> {
  const raw = await customerApiRequest<CustomerProfileResponse>('/api/public/customers/me');
  return mapCustomerUser(raw);
}

export async function updateCustomerProfile(fullName: string): Promise<CustomerUser> {
  const raw = await customerApiRequest<CustomerProfileResponse>('/api/public/customers/me', {
    method: 'PUT',
    body: JSON.stringify({ fullName }),
  });
  return mapCustomerUser(raw);
}

export async function customerOrders(page = 0): Promise<CustomerOrder[]> {
  return customerApiRequest<CustomerOrder[]>(`/api/public/customers/me/orders?page=${page}&size=20`);
}

export async function customerOrder(id: string): Promise<CustomerOrder> {
  return customerApiRequest<CustomerOrder>(`/api/public/customers/me/orders/${encodeURIComponent(id)}`);
}

export async function customerLogout(): Promise<void> {
  try {
    await customerApiRequest('/api/public/auth/logout', { method: 'POST' });
  } catch { /* ignore — clear tokens regardless */ }
  customerTokenStore.clear();
}

export function isCustomerAuthenticated(): boolean {
  return !!customerTokenStore.getAccess();
}

/** Always resolves with a generic message — backend never reveals whether the email exists. */
export async function customerForgotPassword(email: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/public/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const body: ApiEnvelope<{ message: string }> = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? 'Something went wrong. Please try again.');
  }
  return body.data.message;
}

export async function customerResetPassword(token: string, newPassword: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/public/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  const body: ApiEnvelope<{ message: string }> = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? 'Invalid or expired link.');
  }
  return body.data.message;
}
