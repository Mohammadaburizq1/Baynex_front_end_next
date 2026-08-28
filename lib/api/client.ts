// Centralised API client — handles auth headers, token refresh, and response unwrapping.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8081';

// ── Token storage ────────────────────────────────────────────────────────────

const ACCESS_KEY = 'sl_access_token';
const REFRESH_KEY = 'sl_refresh_token';

export const tokenStore = {
  getAccess: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(ACCESS_KEY) : null,
  getRefresh: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null,
  set: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    localStorage.setItem('authToken', access); // legacy key used by existing guards
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem('authToken');
  },
};

// ── Backend response envelope ────────────────────────────────────────────────

interface ApiEnvelope<T> {
  status: 'success' | 'error' | 'failure';
  statusCode: number;
  message: string;
  data: T;
}

// ── Token refresh queue ──────────────────────────────────────────────────────

let refreshing = false;
let waitQueue: Array<(token: string | null) => void> = [];

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new Error('No refresh token available.');

  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    tokenStore.clear();
    throw new Error('Session expired. Please log in again.');
  }

  const body: ApiEnvelope<{ accessToken: string; refreshToken: string }> = await res.json();
  tokenStore.set(body.data.accessToken, body.data.refreshToken);
  return body.data.accessToken;
}

// ── Core request function ────────────────────────────────────────────────────

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const buildHeaders = (token: string | null): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  });

  let token = tokenStore.getAccess();
  let res = await fetch(`${API_BASE}${path}`, { ...options, headers: buildHeaders(token) });

  // On 401 — attempt a single token refresh then retry.
  if (res.status === 401 && token) {
    if (!refreshing) {
      refreshing = true;
      let newToken: string | null = null;
      try {
        newToken = await refreshAccessToken();
      } catch {
        waitQueue.forEach(cb => cb(null));
        waitQueue = [];
        refreshing = false;
        throw new Error('Session expired. Please log in again.');
      }
      waitQueue.forEach(cb => cb(newToken));
      waitQueue = [];
      refreshing = false;
      token = newToken;
    } else {
      token = await new Promise<string | null>(resolve => waitQueue.push(resolve));
      if (!token) throw new Error('Session expired. Please log in again.');
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

  // Some endpoints (DELETE, logout) return empty body.
  const text = await res.text();
  if (!text) return undefined as T;

  const body: ApiEnvelope<T> = JSON.parse(text);
  return body.data;
}

export { API_BASE };
