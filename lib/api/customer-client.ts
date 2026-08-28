// Centralised customer-portal API client — mirrors client.ts's shape (token
// storage, auth header injection, 401 refresh-and-retry, envelope unwrapping)
// but targets the customer session instead of the merchant one.
//
// Merchant, admin, and customer are three fully isolated portals on the
// backend, three separate token stores on the frontend: client.ts owns
// sl_access_token, admin has its own store, this one owns sl_customer_*.
// customer-auth.ts is the business layer built on top of this module,
// the same way auth.ts sits on top of client.ts.

import { API_BASE } from './client';

const CUSTOMER_ACCESS_KEY = 'sl_customer_access_token';
const CUSTOMER_REFRESH_KEY = 'sl_customer_refresh_token';

export const customerTokenStore = {
  getAccess: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(CUSTOMER_ACCESS_KEY) : null,
  getRefresh: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(CUSTOMER_REFRESH_KEY) : null,
  set: (access: string, refresh: string) => {
    localStorage.setItem(CUSTOMER_ACCESS_KEY, access);
    localStorage.setItem(CUSTOMER_REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(CUSTOMER_ACCESS_KEY);
    localStorage.removeItem(CUSTOMER_REFRESH_KEY);
  },
};

interface ApiEnvelope<T> {
  status: 'success' | 'error' | 'failure';
  statusCode: number;
  message: string;
  data: T;
}

let refreshing = false;
let waitQueue: Array<(token: string | null) => void> = [];

async function refreshCustomerToken(): Promise<string> {
  const refreshToken = customerTokenStore.getRefresh();
  if (!refreshToken) throw new Error('No refresh token available.');

  const res = await fetch(`${API_BASE}/api/public/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    customerTokenStore.clear();
    throw new Error('Session expired. Please sign in again.');
  }

  const body: ApiEnvelope<{ accessToken: string; refreshToken: string }> = await res.json();
  customerTokenStore.set(body.data.accessToken, body.data.refreshToken);
  return body.data.accessToken;
}

export async function customerApiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const buildHeaders = (token: string | null): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  });

  let token = customerTokenStore.getAccess();
  let res = await fetch(`${API_BASE}${path}`, { ...options, headers: buildHeaders(token) });

  // On 401 — attempt a single token refresh then retry.
  if (res.status === 401 && token) {
    if (!refreshing) {
      refreshing = true;
      let newToken: string | null = null;
      try {
        newToken = await refreshCustomerToken();
      } catch {
        waitQueue.forEach(cb => cb(null));
        waitQueue = [];
        refreshing = false;
        throw new Error('Session expired. Please sign in again.');
      }
      waitQueue.forEach(cb => cb(newToken));
      waitQueue = [];
      refreshing = false;
      token = newToken;
    } else {
      token = await new Promise<string | null>(resolve => waitQueue.push(resolve));
      if (!token) throw new Error('Session expired. Please sign in again.');
    }

    res = await fetch(`${API_BASE}${path}`, { ...options, headers: buildHeaders(token) });
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  const text = await res.text();
  if (!text) return undefined as T;

  const body: ApiEnvelope<T> = JSON.parse(text);
  return body.data;
}
