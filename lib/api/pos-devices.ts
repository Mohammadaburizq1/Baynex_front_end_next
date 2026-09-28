import { apiRequest } from './client';

// POS devices of a store (backend PosDeviceController / PosDeviceService, POS-02). Owner-only on the
// backend: every call is checked against the caller's own stores there, never trusted from here.

// Mirrors com.byonix.shoplink.domain.enums.PosDeviceStatus.
//   PENDING — created, waiting for an activation code to be used.
//   ACTIVE  — holds a device credential.
//   REVOKED — terminal: the backend refuses new codes and activation for it.
export type PosDeviceStatus = 'PENDING' | 'ACTIVE' | 'REVOKED';

// Mirrors PosDtos.DeviceResponse. Never contains the activation code, the credential or any hash.
export interface PosDevice {
  id: string;
  storeId: string;
  name: string;
  status: PosDeviceStatus;
  platform: string | null;
  appVersion: string | null;
  // When the outstanding activation code stops working (null = no code outstanding).
  activationCodeExpiresAt: string | null;
  activatedAt: string | null;
  lastSeenAt: string | null;
  // Last catalog download by the device (sale uploads do not update it).
  lastSyncAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  // The device's sliding idle credential lapses at this time (30 days after it was last seen).
  credentialExpiresAt: string | null;
}

// Mirrors PosDtos.IssuedActivationCode — the only response that ever carries the plaintext code. Kept
// separate from PosDevice on purpose: hold it in component state only while it is shown, never store it.
export interface IssuedActivationCode {
  device: PosDevice;
  activationCode: string;
  expiresAt: string;
}

export async function listPosDevices(storeId: string): Promise<PosDevice[]> {
  return apiRequest<PosDevice[]>(`/api/dashboard/pos-devices?storeId=${encodeURIComponent(storeId)}`);
}

export async function createPosDevice(storeId: string, name: string): Promise<IssuedActivationCode> {
  return apiRequest<IssuedActivationCode>('/api/dashboard/pos-devices', {
    method: 'POST',
    body: JSON.stringify({ storeId, name: name.trim() }),
  });
}

// A new single-use code for a PENDING or ACTIVE device; the previous code stops working immediately.
// For an ACTIVE device, the installation that uses the new code takes over this device (its old
// credential is replaced). The backend refuses this for REVOKED devices.
export async function reissueActivationCode(deviceId: string): Promise<IssuedActivationCode> {
  return apiRequest<IssuedActivationCode>(`/api/dashboard/pos-devices/${encodeURIComponent(deviceId)}/activation-code`, { method: 'POST' });
}

export async function revokePosDevice(deviceId: string): Promise<PosDevice> {
  return apiRequest<PosDevice>(`/api/dashboard/pos-devices/${encodeURIComponent(deviceId)}/revoke`, { method: 'POST' });
}

// ── What the dashboard shows ─────────────────────────────────────────────────────────────────
//
// There is no live presence tracking: the backend only records when a device last called it
// (lastSeenAt, written at most once a minute) and the POS app has no heartbeat — it calls on start,
// after sales and when its connection comes back. So nothing is ever shown as "Online".

// Seen within this long: shown as "Seen recently". Otherwise the last-seen time is shown as a fact.
export const RECENTLY_SEEN_MS = 15 * 60 * 1000;
// Not seen for this long: flagged for attention (the credential lapses after 30 idle days).
export const STALE_MS = 7 * 24 * 60 * 60 * 1000;

export type PosDeviceState =
  | 'REVOKED'
  | 'ACTIVATION_PENDING'       // waiting, and its code is still valid
  | 'NEVER_CONNECTED'          // waiting, but no valid code: a new one is needed
  | 'NEEDS_REACTIVATION'       // was active, credential lapsed after 30 days without contact
  | 'RECENTLY_SEEN'
  | 'NOT_SEEN_RECENTLY'
  | 'STALE';

export function deviceState(d: PosDevice, now: number = Date.now()): PosDeviceState {
  if (d.status === 'REVOKED') return 'REVOKED';
  if (d.status === 'PENDING') {
    return d.activationCodeExpiresAt && Date.parse(d.activationCodeExpiresAt) > now ? 'ACTIVATION_PENDING' : 'NEVER_CONNECTED';
  }
  if (d.credentialExpiresAt && Date.parse(d.credentialExpiresAt) <= now) return 'NEEDS_REACTIVATION';
  if (!d.lastSeenAt) return 'NEVER_CONNECTED';
  const since = now - Date.parse(d.lastSeenAt);
  if (since <= RECENTLY_SEEN_MS) return 'RECENTLY_SEEN';
  return since >= STALE_MS ? 'STALE' : 'NOT_SEEN_RECENTLY';
}

export const DEVICE_STATE_LABEL: Record<PosDeviceState, string> = {
  REVOKED: 'Revoked',
  ACTIVATION_PENDING: 'Waiting for activation',
  NEVER_CONNECTED: 'Never connected',
  NEEDS_REACTIVATION: 'Needs re-activation',
  RECENTLY_SEEN: 'Seen recently',
  NOT_SEEN_RECENTLY: 'Active',
  STALE: 'Not seen for 7+ days',
};

export const DEVICE_STATE_VARIANT: Record<PosDeviceState, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  REVOKED: 'default',
  ACTIVATION_PENDING: 'info',
  NEVER_CONNECTED: 'warning',
  NEEDS_REACTIVATION: 'danger',
  RECENTLY_SEEN: 'success',
  NOT_SEEN_RECENTLY: 'default',
  STALE: 'warning',
};

// Something the owner should act on.
export function needsAttention(state: PosDeviceState): boolean {
  return state === 'NEVER_CONNECTED' || state === 'NEEDS_REACTIVATION' || state === 'STALE';
}

// The platform string the POS app reports at activation ("windows", "android", "ios", …).
export function platformLabel(platform: string | null): string {
  if (!platform) return 'Unknown';
  const p = platform.toLowerCase();
  if (p === 'windows') return 'Windows';
  if (p === 'android') return 'Android';
  if (p === 'ios') return 'iOS';
  if (p === 'macos') return 'macOS';
  if (p === 'linux') return 'Linux';
  return platform;
}

export function versionLabel(appVersion: string | null): string {
  if (!appVersion) return 'Unknown';
  return /^\d/.test(appVersion) ? `v${appVersion}` : appVersion;
}

// Short identifier for people (the full UUID is in the details view).
export function shortDeviceId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}
