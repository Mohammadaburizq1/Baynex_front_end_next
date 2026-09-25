import { apiRequest, tokenStore, API_BASE } from './client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'MERCHANT_OWNER' | 'MERCHANT_STAFF' | 'CUSTOMER' | 'ADMIN' | string;
  phone?: string;
  phoneVerified: boolean;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    fullName: string;   // backend sends fullName, not name
    email: string | null;
    phone: string | null;
    role: string;
    phoneVerified?: boolean;
  };
}

interface ApiEnvelope<T> {
  status: string;
  statusCode: number;
  message: string;
  data: T;
  errors?: Record<string, string>;
}

function mapUser(raw: LoginResponse['user']): AuthUser {
  return {
    id: raw.id,
    email: raw.email ?? '',
    name: raw.fullName ?? '',
    role: raw.role,
    phone: raw.phone ?? undefined,
    phoneVerified: raw.phoneVerified ?? false,
  };
}

export async function login(identifier: string, password: string): Promise<AuthUser> {
  const id = identifier.trim();
  const isPhone = !id.includes('@');
  const res = await fetch(
    `${API_BASE}/api/auth/${isPhone ? 'login-phone' : 'login'}`,
    {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isPhone ? { phone: id, password } : { email: id, password }),
    },
  );

  const body: ApiEnvelope<LoginResponse> = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? 'Invalid credentials.');
  }

  tokenStore.set(body.data.accessToken, body.data.refreshToken);
  return mapUser(body.data.user);
}

/**
 * Merchant onboarding — phone is the primary identifier. Password is required server-side
 * (min 10 chars, upper/lower/digit/special char) — a weak/missing password comes back as a
 * field-validation error (`body.errors.password`), not `body.message`.
 */
export async function registerByPhone(data: {
  phone: string;
  fullName?: string;
  shopName?: string;
  password: string;
}): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/api/auth/register-phone`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body: ApiEnvelope<LoginResponse> = await res.json();

  if (!res.ok) {
    const msg = body.errors?.password ?? body.message ?? 'Registration failed.';
    if (msg.toLowerCase().includes('phone already registered') || msg.toLowerCase().includes('already registered')) {
      throw new Error('PHONE_EXISTS');
    }
    throw new Error(msg);
  }

  tokenStore.set(body.data.accessToken, body.data.refreshToken);
  return mapUser(body.data.user);
}

/** Verifies the signup OTP sent to a newly-registered phone number. */
export async function verifyPhone(phone: string, code: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/verify-phone`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });

  const body: ApiEnvelope<{ message: string }> = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? 'Invalid or expired code.');
  }
  return body.data.message;
}

/** Resends the signup verification OTP. Always resolves with a generic message. */
export async function resendPhoneVerification(phone: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/verify-phone/resend`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });

  const body: ApiEnvelope<{ message: string }> = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? 'Something went wrong. Please try again.');
  }
  return body.data.message;
}

/** Requests an OTP for phone-based password recovery. Always resolves with a generic message. */
export async function forgotPasswordByPhone(phone: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password-phone`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });

  const body: ApiEnvelope<{ message: string }> = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? 'Something went wrong. Please try again.');
  }
  return body.data.message;
}

/** Completes phone-based password recovery with the OTP and a new password. */
export async function resetPasswordByPhone(phone: string, code: string, newPassword: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/reset-password-phone`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code, newPassword }),
  });

  const body: ApiEnvelope<{ message: string }> = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? 'Invalid or expired code.');
  }
  return body.data.message;
}

/** Always resolves with a generic message — backend never reveals whether the email exists. */
export async function forgotPassword(email: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const body: ApiEnvelope<{ message: string }> = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? 'Something went wrong. Please try again.');
  }
  return body.data.message;
}

export async function resetPassword(token: string, newPassword: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  const body: ApiEnvelope<{ message: string }> = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? 'Invalid or expired link.');
  }
  return body.data.message;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken: tokenStore.getRefresh() }) });
  } catch { /* ignore — clear tokens regardless */ }
  tokenStore.clear();
}

export async function getMe(): Promise<AuthUser> {
  const raw = await apiRequest<LoginResponse['user']>('/api/auth/me');
  return mapUser(raw);
}

export function isAuthenticated(): boolean {
  return !!tokenStore.getAccess();
}
