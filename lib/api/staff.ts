import { apiRequest, API_BASE } from './client';

export interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  active: boolean;
  createdAt: string;
}

export interface PendingStaffInvite {
  id: string;
  email: string;
  fullName?: string;
  expiresAt: string;
  createdAt: string;
}

export interface StaffList {
  members: StaffMember[];
  pendingInvites: PendingStaffInvite[];
}

// Never includes the raw invite token/link — same convention as email-verification and
// password-reset. The invite is delivered by email; the Owner doesn't see or handle the token.
export interface StaffInviteResult {
  id: string;
  email: string;
  fullName?: string;
  expiresAt: string;
}

export async function inviteStaff(storeId: string, email: string, fullName?: string): Promise<StaffInviteResult> {
  return apiRequest<StaffInviteResult>('/api/dashboard/staff/invite', {
    method: 'POST',
    body: JSON.stringify({ storeId, email, fullName: fullName || undefined }),
  });
}

export async function getStaff(storeId: string): Promise<StaffList> {
  return apiRequest<StaffList>(`/api/dashboard/staff?storeId=${encodeURIComponent(storeId)}`);
}

export async function revokeStaffInvite(inviteId: string): Promise<void> {
  await apiRequest(`/api/dashboard/staff/invites/${encodeURIComponent(inviteId)}`, { method: 'DELETE' });
}

// Soft removal (User.active=false) — reversible, not a hard delete. See StaffService.deactivateStaff.
export async function deactivateStaff(userId: string): Promise<void> {
  await apiRequest(`/api/dashboard/staff/${encodeURIComponent(userId)}/deactivate`, { method: 'PUT' });
}

interface ApiEnvelope<T> {
  status: string;
  statusCode: number;
  message: string;
  data: T;
}

interface AcceptInviteResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; fullName: string; email: string | null; role: string };
}

// Unauthenticated — the caller doesn't have a session yet (that's the whole point of accepting
// an invite). Mirrors registerByPhone's shape: on success it returns fresh tokens directly.
export async function acceptStaffInvite(token: string, password: string, fullName?: string): Promise<AcceptInviteResponse> {
  const res = await fetch(`${API_BASE}/api/public/staff/accept-invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password, fullName: fullName || undefined }),
  });
  const body: ApiEnvelope<AcceptInviteResponse> = await res.json();
  if (!res.ok) {
    throw new Error(body.message ?? 'This invite link is invalid or has expired.');
  }
  return body.data;
}
