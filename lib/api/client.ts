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

// Sends the request with the access token, refreshing it once on a 401. Throws on a non-2xx
// response (using the backend envelope's message when there is one); returns the raw Response.
async function authorizedFetch(path: string, options: RequestInit = {}): Promise<Response> {
  // A multipart upload must NOT carry our JSON content type: the browser has to set its own, with
  // the boundary, or the server can't parse the parts.
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const buildHeaders = (token: string | null): Record<string, string> => ({
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
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
  return res;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await authorizedFetch(path, options);

  // Some endpoints (DELETE, logout) return empty body.
  const text = await res.text();
  if (!text) return undefined as T;

  const body: ApiEnvelope<T> = JSON.parse(text);
  return body.data;
}

// For endpoints that return a file rather than the JSON envelope (e.g. the Reports CSV). The
// filename comes from the server's Content-Disposition, falling back to the caller's.
export async function apiDownload(
  path: string,
  fallbackFilename: string,
): Promise<{ blob: Blob; filename: string }> {
  const res = await authorizedFetch(path);
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  return { blob: await res.blob(), filename: match?.[1] ?? fallbackFilename };
}

export { API_BASE };
