import { API_BASE } from './client';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AdminAuthResponse {
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

interface AdminLoginResponse {
  mfaRequired: boolean;
  mfaChallengeToken: string | null;
  auth: AdminAuthResponse | null;
}

interface ApiEnvelope<T> {
  status: string;
  statusCode: number;
  message: string;
  data: T;
}

// Separate localStorage keys from the merchant tokens — admin sessions are a
// fully isolated portal on the backend (own refresh scope, own lock/MFA rules),
// so mixing them in one store risks one portal's logout clobbering the other.
const ADMIN_ACCESS_KEY = 'sl_admin_access_token';
const ADMIN_REFRESH_KEY = 'sl_admin_refresh_token';

export const adminTokenStore = {
  getAccess: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(ADMIN_ACCESS_KEY) : null,
  getRefresh: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(ADMIN_REFRESH_KEY) : null,
  set: (access: string, refresh: string) => {
    localStorage.setItem(ADMIN_ACCESS_KEY, access);
    localStorage.setItem(ADMIN_REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ADMIN_ACCESS_KEY);
    localStorage.removeItem(ADMIN_REFRESH_KEY);
  },
};

function mapAdminUser(raw: AdminAuthResponse['user']): AdminUser {
  return {
    id: raw.id,
    email: raw.email ?? '',
    name: raw.fullName ?? '',
    role: raw.role,
  };
}

export type AdminLoginResult =
  | { status: 'mfa-required'; challengeToken: string }
  | { status: 'authenticated'; user: AdminUser };

/** Step 1. SUPER_ADMIN gets mfa-required; other admin roles get tokens directly. */
export async function adminLogin(email: string, password: string): Promise<AdminLoginResult> {
  const res = await fetch(`${API_BASE}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const body: ApiEnvelope<AdminLoginResponse> = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? 'Invalid credentials.');
  }

  if (body.data.mfaRequired) {
    return { status: 'mfa-required', challengeToken: body.data.mfaChallengeToken as string };
  }

  const auth = body.data.auth as AdminAuthResponse;
  adminTokenStore.set(auth.accessToken, auth.refreshToken);
  return { status: 'authenticated', user: mapAdminUser(auth.user) };
}

/** Step 2, only when adminLogin() returned mfa-required. */
export async function adminVerifyMfa(mfaChallengeToken: string, mfaCode: string): Promise<AdminUser> {
  const res = await fetch(`${API_BASE}/api/admin/auth/mfa/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mfaChallengeToken, mfaCode }),
  });

  const body: ApiEnvelope<AdminAuthResponse> = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? 'Invalid code.');
  }

  adminTokenStore.set(body.data.accessToken, body.data.refreshToken);
  return mapAdminUser(body.data.user);
}

/** Always resolves with a generic message — backend never reveals whether the email exists. */
export async function adminForgotPassword(email: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/admin/auth/forgot-password`, {
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

export async function adminResetPassword(token: string, newPassword: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/admin/auth/reset-password`, {
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
