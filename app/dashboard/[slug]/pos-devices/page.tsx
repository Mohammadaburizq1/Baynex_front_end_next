'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, KeyRound, MonitorSmartphone, Plus, RefreshCw, Search, ShieldOff } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { OwnerOnlyGate } from '@/components/dashboard/OwnerOnlyGate';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';
import { dashboardPath } from '@/lib/utils/dashboard-path';
import { getPosConflicts } from '@/lib/api/pos-sync';
import {
  listPosDevices, deviceState, needsAttention, platformLabel, versionLabel, shortDeviceId,
  type IssuedActivationCode, type PosDevice,
} from '@/lib/api/pos-devices';
import {
  ActivationCodeModal, CreateDeviceModal, DeviceDetailsModal, DeviceStateBadge, ReissueCodeModal, RevokeDeviceModal, When,
} from '@/components/dashboard/PosDeviceDialogs';

type Filter = 'ALL' | 'ACTIVE' | 'NOT_CONNECTED' | 'REVOKED';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'NOT_CONNECTED', label: 'Never connected' },
  { value: 'REVOKED', label: 'Revoked' },
];

function matchesFilter(d: PosDevice, f: Filter): boolean {
  switch (f) {
    case 'ALL': return true;
    case 'ACTIVE': return d.status === 'ACTIVE';
    case 'NOT_CONNECTED': return d.status === 'PENDING';
    case 'REVOKED': return d.status === 'REVOKED';
  }
}

function matchesSearch(d: PosDevice, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return d.name.toLowerCase().includes(needle)
    || d.id.toLowerCase().includes(needle)
    || platformLabel(d.platform).toLowerCase().includes(needle);
}

export default function PosDevicesPage() {
  return (
    <OwnerOnlyGate pageTitle="POS Devices" description="Only the store owner can manage POS devices.">
      <PosDevicesContent />
    </OwnerOnlyGate>
  );
}

function PosDevicesContent() {
  const { store, dashboardSlug } = useStore();
  const { success } = useToast();
  // A store not yet saved to khanGates has a placeholder "local-*" id and no devices on the server.
  const storeId = store.id && !store.id.startsWith('local-') ? store.id : null;

  const [devices, setDevices] = useState<PosDevice[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Open conflicts per device id; null = could not be loaded (shown as unknown, never as zero).
  const [conflicts, setConflicts] = useState<Record<string, number> | null>(null);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const [creating, setCreating] = useState<{ name?: string; replacing?: PosDevice } | null>(null);
  const [issued, setIssued] = useState<IssuedActivationCode | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [reissuing, setReissuing] = useState<PosDevice | null>(null);
  const [revoking, setRevoking] = useState<PosDevice | null>(null);
  // Re-render every 30 s so "5m ago" and derived states stay current while the page is open.
  const [, setTick] = useState(0);

  const load = useCallback(async () => {
    if (!storeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      setDevices(await listPosDevices(storeId));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'POS devices could not be loaded.');
    } finally {
      setLoading(false);
    }
    try {
      const summary = await getPosConflicts(storeId, 'OPEN');
      const counts: Record<string, number> = {};
      for (const c of summary.conflicts) {
        if (c.deviceId) counts[c.deviceId] = (counts[c.deviceId] ?? 0) + 1;
      }
      setConflicts(counts);
    } catch {
      setConflicts(null);
    }
  }, [storeId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = window.setInterval(() => setTick(t => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const upsert = useCallback((device: PosDevice) => {
    setDevices(current => {
      const list = current ?? [];
      return list.some(d => d.id === device.id) ? list.map(d => (d.id === device.id ? device : d)) : [device, ...list];
    });
  }, []);

  const all = devices ?? [];
  const visible = useMemo(() => all.filter(d => matchesFilter(d, filter) && matchesSearch(d, query.trim())), [all, filter, query]);
  const states = all.map(d => deviceState(d));
  const summary = {
    total: all.filter(d => d.status !== 'REVOKED').length,
    recent: states.filter(s => s === 'RECENTLY_SEEN').length,
    attention: all.filter((d, i) => needsAttention(states[i]) || (d.status !== 'REVOKED' && (conflicts?.[d.id] ?? 0) > 0)).length,
    revoked: states.filter(s => s === 'REVOKED').length,
  };
  const details = all.find(d => d.id === detailsId) ?? null;
  const conflictsHref = (deviceId: string) => `${dashboardPath(dashboardSlug, 'orders')}?posDevice=${encodeURIComponent(deviceId)}`;

  const onIssued = (result: IssuedActivationCode) => {
    upsert(result.device);
    setCreating(null);
    setReissuing(null);
    setIssued(result);
  };

  const createButton = (
    <Button icon={<Plus size={16} />} onClick={() => setCreating({})} disabled={!storeId}>
      Create POS Device
    </Button>
  );

  return (
    <>
      <Header title="POS Devices" subtitle="Tills connected to this store with khanGates POS" actions={storeId ? createButton : undefined} />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {!storeId ? (
          <EmptyState
            icon={<MonitorSmartphone size={28} />}
            title="Save your store first"
            description="POS devices are registered on khanGates. Finish setting up and publishing your store, then come back here."
          />
        ) : loading && devices === null ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading POS devices">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
            </div>
            {[0, 1, 2].map(i => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : loadError && devices === null ? (
          <EmptyState
            icon={<AlertTriangle size={28} />}
            title="POS devices could not be loaded"
            description={loadError}
            action={{ label: 'Try again', onClick: load }}
          />
        ) : all.length === 0 ? (
          <EmptyState
            icon={<MonitorSmartphone size={28} />}
            title="No POS devices yet"
            description="Create a device to connect khanGates POS on Windows, Android or iOS. You get a one-time code to enter on the till."
            action={{ label: 'Create POS Device', onClick: () => setCreating({}) }}
          />
        ) : (
          <>
            {loadError && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                <span className="flex-1">Could not refresh: {loadError}. Showing the last loaded list.</span>
                <Button size="sm" variant="outline" icon={<RefreshCw size={14} />} onClick={load}>Retry</Button>
              </div>
            )}

            {/* Summary */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Summary">
              <SummaryTile label="Devices" value={summary.total} hint="not revoked" />
              <SummaryTile label="Seen recently" value={summary.recent} hint="in the last 15 min" />
              <SummaryTile label="Needs attention" value={summary.attention} tone={summary.attention > 0 ? 'warning' : undefined} hint="code, sign-in or conflicts" />
              <SummaryTile label="Revoked" value={summary.revoked} />
            </section>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter devices">
                {FILTERS.map(f => (
                  <button
                    key={f.value}
                    type="button"
                    role="tab"
                    aria-selected={filter === f.value}
                    onClick={() => setFilter(f.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer min-h-[36px]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
                      filter === f.value ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-surface-200 text-slate-600 hover:bg-surface-100',
                    )}
                  >
                    {f.label} <span className="opacity-75">({all.filter(d => matchesFilter(d, f.value)).length})</span>
                  </button>
                ))}
              </div>
              <div className="relative sm:ml-auto sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search name, ID or platform"
                  aria-label="Search devices"
                  className="w-full h-9 pl-9 pr-3 rounded-btn border border-surface-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
            </div>

            {visible.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No devices match this filter.</p>
            ) : (
              <>
                {/* Desktop: table */}
                <div className="hidden md:block bg-white rounded-card border border-surface-200 shadow-card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Device</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Platform</th>
                        <th className="px-4 py-3">Last seen</th>
                        <th className="px-4 py-3">Last catalog sync</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {visible.map(d => (
                        <tr key={d.id} className="align-top">
                          <td className="px-4 py-3">
                            <button type="button" onClick={() => setDetailsId(d.id)} className="font-medium text-slate-900 hover:text-primary-700 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded">
                              {d.name}
                            </button>
                            <span className="block font-mono text-xs text-slate-500" title={d.id}>{shortDeviceId(d.id)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <DeviceStateBadge device={d} />
                            <ConflictLink count={conflicts?.[d.id] ?? 0} href={conflictsHref(d.id)} />
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {platformLabel(d.platform)}
                            <span className="block text-xs text-slate-500">{versionLabel(d.appVersion)}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-700"><When iso={d.lastSeenAt} timeZone={store.timezone} /></td>
                          <td className="px-4 py-3 text-slate-700"><When iso={d.lastSyncAt} timeZone={store.timezone} /></td>
                          <td className="px-4 py-3 text-slate-700"><When iso={d.createdAt} timeZone={store.timezone} /></td>
                          <td className="px-4 py-3">
                            <DeviceActions device={d} onView={() => setDetailsId(d.id)} onReissue={setReissuing} onRevoke={setRevoking}
                              onReplace={dev => setCreating({ name: dev.name, replacing: dev })} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: cards */}
                <ul className="md:hidden space-y-3">
                  {visible.map(d => (
                    <li key={d.id} className="bg-white rounded-card border border-surface-200 shadow-card p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <button type="button" onClick={() => setDetailsId(d.id)} className="text-left min-w-0 cursor-pointer">
                          <span className="block font-semibold text-slate-900 break-words">{d.name}</span>
                          <span className="block text-xs text-slate-500">
                            {platformLabel(d.platform)} · {versionLabel(d.appVersion)} · <span className="font-mono">{shortDeviceId(d.id)}</span>
                          </span>
                        </button>
                        <DeviceStateBadge device={d} />
                      </div>
                      <dl className="grid grid-cols-2 gap-2 text-xs">
                        <div><dt className="text-slate-500">Last seen</dt><dd className="text-slate-800"><When iso={d.lastSeenAt} timeZone={store.timezone} /></dd></div>
                        <div><dt className="text-slate-500">Last catalog sync</dt><dd className="text-slate-800"><When iso={d.lastSyncAt} timeZone={store.timezone} /></dd></div>
                      </dl>
                      <ConflictLink count={conflicts?.[d.id] ?? 0} href={conflictsHref(d.id)} />
                      <DeviceActions device={d} onView={() => setDetailsId(d.id)} onReissue={setReissuing} onRevoke={setRevoking}
                        onReplace={dev => setCreating({ name: dev.name, replacing: dev })} stacked />
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="text-xs text-slate-500">
              khanGates has no live connection to tills: “Last seen” is the last time a till contacted the server (it does so on
              start, after sales and when its connection returns). “Seen recently” means within the last 15 minutes. A till not
              seen for 30 days must be re-activated with a new code.
            </p>
          </>
        )}
      </main>

      {storeId && (
        <CreateDeviceModal
          open={creating !== null}
          storeId={storeId}
          initialName={creating?.name}
          replacing={creating?.replacing ?? null}
          onClose={() => setCreating(null)}
          onCreated={result => {
            onIssued(result);
            success(`${result.device.name} created.`);
          }}
        />
      )}
      <ActivationCodeModal issued={issued} timeZone={store.timezone} onClose={() => setIssued(null)} />
      <ReissueCodeModal device={reissuing} onClose={() => setReissuing(null)} onIssued={onIssued} />
      <RevokeDeviceModal
        device={revoking}
        onClose={() => setRevoking(null)}
        onRevoked={device => {
          upsert(device);
          setRevoking(null);
          success(`${device.name} revoked.`);
        }}
      />
      <DeviceDetailsModal
        device={details && !reissuing && !revoking && !creating && !issued ? details : null}
        storeName={store.name}
        timeZone={store.timezone}
        openConflicts={details && conflicts ? conflicts[details.id] ?? 0 : null}
        conflictsHref={details ? conflictsHref(details.id) : '#'}
        onClose={() => setDetailsId(null)}
        onReissue={setReissuing}
        onRevoke={setRevoking}
        onReplace={dev => {
          setDetailsId(null);
          setCreating({ name: dev.name, replacing: dev });
        }}
      />
    </>
  );
}

function SummaryTile({ label, value, hint, tone }: { label: string; value: number; hint?: string; tone?: 'warning' }) {
  return (
    <div className={cn('bg-white rounded-card border shadow-card p-4', tone === 'warning' ? 'border-amber-300' : 'border-surface-200')}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={cn('text-2xl font-bold tabular-nums', tone === 'warning' ? 'text-amber-700' : 'text-slate-900')}>{value}</p>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function ConflictLink({ count, href }: { count: number; href: string }) {
  if (count === 0) return null;
  return (
    <Link href={href} className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-800 underline hover:text-amber-900">
      <AlertTriangle size={12} aria-hidden="true" />
      {count} {count === 1 ? 'conflict needs' : 'conflicts need'} review
    </Link>
  );
}

function DeviceActions({ device, onView, onReissue, onRevoke, onReplace, stacked }: {
  device: PosDevice;
  onView: () => void;
  onReissue: (d: PosDevice) => void;
  onRevoke: (d: PosDevice) => void;
  onReplace: (d: PosDevice) => void;
  stacked?: boolean;
}) {
  const revoked = device.status === 'REVOKED';
  return (
    <div className={cn('flex flex-wrap gap-2', stacked ? '' : 'justify-end')}>
      <Button size="sm" variant="ghost" onClick={onView} className="min-h-[36px]">View</Button>
      {revoked ? (
        <Button size="sm" variant="outline" onClick={() => onReplace(device)} className="min-h-[36px]">Register replacement</Button>
      ) : (
        <>
          <Button size="sm" variant="outline" icon={<KeyRound size={14} />} onClick={() => onReissue(device)} className="min-h-[36px]">
            New code
          </Button>
          <Button size="sm" variant="ghost" icon={<ShieldOff size={14} />} onClick={() => onRevoke(device)}
            className="min-h-[36px] text-red-600 hover:bg-red-50">
            Revoke
          </Button>
        </>
      )}
    </div>
  );
}
