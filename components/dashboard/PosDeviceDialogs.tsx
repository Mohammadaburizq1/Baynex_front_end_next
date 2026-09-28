'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Copy, KeyRound, ShieldOff } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { formatRelativeTime } from '@/lib/utils';
import {
  createPosDevice, reissueActivationCode, revokePosDevice,
  deviceState, DEVICE_STATE_LABEL, DEVICE_STATE_VARIANT, platformLabel, versionLabel,
  type IssuedActivationCode, type PosDevice,
} from '@/lib/api/pos-devices';

// ── Time display ─────────────────────────────────────────────────────────────────────────────

// Full date and time in the store's time zone (falls back to the browser's if the zone is unknown).
export function fullTime(iso: string, timeZone?: string): string {
  const options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };
  try {
    return new Intl.DateTimeFormat('en-GB', { ...options, timeZone }).format(new Date(iso));
  } catch {
    return new Intl.DateTimeFormat('en-GB', options).format(new Date(iso));
  }
}

// "5m ago" with the full timestamp on hover; "Never" / a fallback when there is no time.
export function When({ iso, timeZone, never = 'Never' }: { iso: string | null; timeZone?: string; never?: string }) {
  if (!iso) return <span className="text-slate-500">{never}</span>;
  return <time dateTime={iso} title={fullTime(iso, timeZone)}>{formatRelativeTime(iso)}</time>;
}

export function DeviceStateBadge({ device }: { device: PosDevice }) {
  const state = deviceState(device);
  return <Badge variant={DEVICE_STATE_VARIANT[state]} dot>{DEVICE_STATE_LABEL[state]}</Badge>;
}

// ── Create ───────────────────────────────────────────────────────────────────────────────────

const NAME_SUGGESTIONS = ['Main Counter', 'Counter 2', 'Manager Tablet', 'Front Desk'];

export function CreateDeviceModal({ open, storeId, initialName, replacing, onClose, onCreated }: {
  open: boolean;
  storeId: string;
  initialName?: string;
  // Set when registering a replacement for a revoked device (the revoked one stays revoked).
  replacing?: PosDevice | null;
  onClose: () => void;
  onCreated: (issued: IssuedActivationCode) => void;
}) {
  const { error } = useToast();
  const [name, setName] = useState(initialName ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setName(initialName ?? '');
  }, [open, initialName]);

  const trimmed = name.trim();
  const invalid = trimmed.length === 0 || trimmed.length > 80;

  async function submit() {
    if (invalid || saving) return;
    setSaving(true);
    try {
      onCreated(await createPosDevice(storeId, trimmed));
    } catch (e) {
      error(e instanceof Error ? e.message : 'The device could not be created. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={replacing ? 'Register a replacement device' : 'Create POS device'}
      description={replacing
        ? `"${replacing.name}" is revoked and cannot be activated again. A new device gets its own activation code.`
        : 'Give the till a name your staff will recognise. You get a one-time activation code next.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} loading={saving} disabled={invalid}>Create and get code</Button>
        </>
      }
    >
      <form onSubmit={e => { e.preventDefault(); submit(); }} className="space-y-3">
        <Input
          label="Device name"
          required
          autoFocus
          maxLength={80}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Main Counter"
          error={trimmed.length > 80 ? 'At most 80 characters' : undefined}
        />
        {!replacing && (
          <div className="flex flex-wrap gap-2" aria-label="Name suggestions">
            {NAME_SUGGESTIONS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setName(s)}
                className="px-2.5 py-1 rounded-full border border-surface-200 text-xs text-slate-600 hover:bg-surface-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </form>
    </Modal>
  );
}

// ── Activation code (shown once) ─────────────────────────────────────────────────────────────

function useCountdown(expiresAt: string | null): number {
  const [left, setLeft] = useState(() => (expiresAt ? Date.parse(expiresAt) - Date.now() : 0));
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setLeft(Date.parse(expiresAt) - Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);
  return left;
}

// The plaintext code exists only in the create/reissue response. It lives in the parent's state while
// this dialog is open and is dropped on close; it is never stored and cannot be fetched again.
export function ActivationCodeModal({ issued, timeZone, onClose }: {
  issued: IssuedActivationCode | null;
  timeZone?: string;
  onClose: () => void;
}) {
  const { success, error } = useToast();
  const left = useCountdown(issued?.expiresAt ?? null);
  if (!issued) return null;
  const expired = left <= 0;
  const minutes = Math.floor(Math.max(left, 0) / 60000);
  const seconds = Math.floor((Math.max(left, 0) % 60000) / 1000);

  async function copy() {
    try {
      await navigator.clipboard.writeText(issued!.activationCode);
      success('Activation code copied.');
    } catch {
      error('Could not copy. Select the code and copy it manually.');
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Activation code for ${issued.device.name}`}
      description="Enter this code in khanGates POS on the device you want to connect."
      footer={<Button onClick={onClose}>Done</Button>}
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <code
            aria-label="Activation code"
            className={`flex-1 select-all text-center font-mono text-2xl sm:text-3xl font-bold tracking-[0.2em] rounded-lg border px-4 py-3 ${expired ? 'text-slate-400 line-through border-surface-200 bg-surface-50' : 'text-slate-900 border-primary-200 bg-primary-50'}`}
          >
            {issued.activationCode}
          </code>
          <Button variant="outline" icon={<Copy size={15} />} onClick={copy} disabled={expired} className="min-h-[44px]">
            Copy
          </Button>
        </div>
        <p className={`text-sm font-medium ${expired ? 'text-red-600' : 'text-slate-700'}`} aria-live="polite">
          {expired
            ? 'This code has expired. Close this and generate a new code.'
            : `Expires in ${minutes}:${String(seconds).padStart(2, '0')} (at ${fullTime(issued.expiresAt, timeZone)}).`}
        </p>
        <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
          <li>It can be used once, on one device. After that it stops working.</li>
          <li>It will not be shown again. If you lose it, generate a new code.</li>
          <li>Treat it like a password: anyone with it can connect a till to your store until it is used or expires.</li>
        </ul>
      </div>
    </Modal>
  );
}

// ── Reissue ──────────────────────────────────────────────────────────────────────────────────

export function ReissueCodeModal({ device, onClose, onIssued }: {
  device: PosDevice | null;
  onClose: () => void;
  onIssued: (issued: IssuedActivationCode) => void;
}) {
  const { error } = useToast();
  const [busy, setBusy] = useState(false);
  if (!device) return null;
  const active = device.status === 'ACTIVE';

  async function confirm() {
    setBusy(true);
    try {
      onIssued(await reissueActivationCode(device!.id));
    } catch (e) {
      error(e instanceof Error ? e.message : 'A new code could not be generated. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={busy ? () => {} : onClose}
      title={`New activation code for ${device.name}?`}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={confirm} loading={busy} icon={<KeyRound size={15} />}>Generate new code</Button>
        </>
      }
    >
      <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1.5">
        <li>Any earlier code for this device stops working immediately.</li>
        {active ? (
          <>
            <li>The till currently connected keeps working until the new code is used.</li>
            <li>
              When the new code is entered on a till, <strong>that</strong> till becomes “{device.name}” and the
              previously connected installation is signed out.
            </li>
          </>
        ) : (
          <li>Use it to connect the till this device entry is meant for.</li>
        )}
      </ul>
    </Modal>
  );
}

// ── Revoke ───────────────────────────────────────────────────────────────────────────────────

export function RevokeDeviceModal({ device, onClose, onRevoked }: {
  device: PosDevice | null;
  onClose: () => void;
  onRevoked: (device: PosDevice) => void;
}) {
  const { error } = useToast();
  const [busy, setBusy] = useState(false);
  const [understood, setUnderstood] = useState(false);
  useEffect(() => setUnderstood(false), [device?.id]);
  if (!device) return null;

  async function confirm() {
    if (!understood) return;
    setBusy(true);
    try {
      onRevoked(await revokePosDevice(device!.id));
    } catch (e) {
      error(e instanceof Error ? e.message : 'The device could not be revoked. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={busy ? () => {} : onClose}
      title={`Revoke ${device.name}?`}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="danger" onClick={confirm} loading={busy} disabled={!understood} icon={<ShieldOff size={15} />}>
            Revoke device
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1.5">
          <li>khanGates rejects this device from now on: it can no longer sync, download the catalog or upload sales.</li>
          <li>Any activation code it has stops working.</li>
          <li>Sales already uploaded stay in your orders. Nothing on the server is deleted.</li>
          <li>
            Sales still waiting on the till are not deleted by the server; the till keeps them but cannot take
            new sales. To upload them, register a new device and enter its code on that till.
          </li>
          <li><strong>This cannot be undone</strong> — a revoked device cannot be activated again.</li>
        </ul>
        <label className="flex items-start gap-2 text-sm text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-red-600"
            checked={understood}
            onChange={e => setUnderstood(e.target.checked)}
          />
          I understand that “{device.name}” will stop working.
        </label>
      </div>
    </Modal>
  );
}

// ── Details ──────────────────────────────────────────────────────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-3 py-2 border-b border-surface-100 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900 min-w-0 break-words">{children}</dd>
    </div>
  );
}

export function DeviceDetailsModal({ device, storeName, timeZone, openConflicts, conflictsHref, onClose, onReissue, onRevoke, onReplace }: {
  device: PosDevice | null;
  storeName: string;
  timeZone?: string;
  // null = conflicts could not be loaded (unknown), not zero.
  openConflicts: number | null;
  conflictsHref: string;
  onClose: () => void;
  onReissue: (d: PosDevice) => void;
  onRevoke: (d: PosDevice) => void;
  onReplace: (d: PosDevice) => void;
}) {
  if (!device) return null;
  const state = deviceState(device);
  const revoked = device.status === 'REVOKED';
  const full = (iso: string | null, never = '—') => (iso ? `${fullTime(iso, timeZone)} (${formatRelativeTime(iso)})` : never);

  return (
    <Modal
      open
      onClose={onClose}
      title={device.name}
      size="lg"
      footer={
        revoked ? (
          <>
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button onClick={() => onReplace(device)}>Register replacement</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button variant="outline" icon={<KeyRound size={15} />} onClick={() => onReissue(device)}>New code</Button>
            <Button variant="danger" icon={<ShieldOff size={15} />} onClick={() => onRevoke(device)}>Revoke</Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={DEVICE_STATE_VARIANT[state]} dot>{DEVICE_STATE_LABEL[state]}</Badge>
          <span className="text-sm text-slate-600">{platformLabel(device.platform)} · {versionLabel(device.appVersion)}</span>
        </div>

        {state === 'NEEDS_REACTIVATION' && (
          <p className="text-sm text-red-700 flex gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
            This till has not contacted khanGates for 30 days, so its sign-in expired. Generate a new code and enter it on the till.
          </p>
        )}
        {state === 'NEVER_CONNECTED' && (
          <p className="text-sm text-amber-800 flex gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
            No till has connected yet and there is no valid code. Generate a new code to connect one.
          </p>
        )}

        <dl>
          <Row label="Name">{device.name}</Row>
          <Row label="Device ID"><code className="font-mono text-xs select-all">{device.id}</code></Row>
          <Row label="Store">{storeName}</Row>
          <Row label="Platform">{platformLabel(device.platform)}</Row>
          <Row label="App version">{versionLabel(device.appVersion)}</Row>
          <Row label="Activation">
            {device.activatedAt ? `Activated ${full(device.activatedAt)}` : 'Not activated yet'}
            {device.activationCodeExpiresAt && !revoked && (
              <span className="block text-xs text-slate-500">
                A code is outstanding until {fullTime(device.activationCodeExpiresAt, timeZone)}.
              </span>
            )}
          </Row>
          <Row label="Last seen">{full(device.lastSeenAt, 'Never')}</Row>
          <Row label="Last catalog sync">{full(device.lastSyncAt, 'Never')}</Row>
          {device.credentialExpiresAt && !revoked && (
            <Row label="Sign-in lapses">
              {full(device.credentialExpiresAt)}
              <span className="block text-xs text-slate-500">Extended every time the till contacts khanGates (30 days without contact).</span>
            </Row>
          )}
          <Row label="Created">{full(device.createdAt)}</Row>
          {device.revokedAt && <Row label="Revoked">{full(device.revokedAt)}</Row>}
          <Row label="Sync conflicts">
            {openConflicts === null ? (
              <span className="text-slate-500">Could not be loaded</span>
            ) : openConflicts === 0 ? (
              'None to review'
            ) : (
              <Link href={conflictsHref} className="text-primary-700 underline hover:text-primary-800">
                {openConflicts} {openConflicts === 1 ? 'conflict needs' : 'conflicts need'} review
              </Link>
            )}
          </Row>
        </dl>
        <p className="text-xs text-slate-500">
          “Last seen” is the last time this till contacted khanGates; the till does not report in while idle, so it is not live
          presence. Sales waiting to upload are counted on the till itself and are not visible here.
        </p>
      </div>
    </Modal>
  );
}
