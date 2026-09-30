'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';
import { POS_CONFLICT_LABEL } from '@/lib/api/pos-sync';
import {
  forceClosePosShift, getPosShift, listPosShifts, MOVEMENT_REASON_LABEL, SHIFT_STATUS_LABEL, shiftMoney, signedShiftMoney,
  type PosShift, type PosShiftDetail, type PosShiftFilter, type PosShiftStatus,
} from '@/lib/api/pos-shifts';

const FILTERS: { value: PosShiftFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'VARIANCE', label: 'Variance' },
];

const STATUS_VARIANT: Record<PosShiftStatus, 'success' | 'primary' | 'warning' | 'danger'> = {
  OPEN: 'primary',
  CLOSED: 'success',
  CLOSED_WITH_VARIANCE: 'warning',
  FORCE_CLOSED: 'danger',
};

function when(iso: string | null, timeZone?: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: timeZone || undefined }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
}

function varianceClass(v: number | null): string {
  if (v === null || v === 0) return 'text-slate-900';
  return v < 0 ? 'text-red-700' : 'text-amber-700';
}

export default function PosShiftsPage() {
  const { store } = useStore();
  const storeId = store.id && !store.id.startsWith('local-') ? store.id : null;
  const [shifts, setShifts] = useState<PosShift[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PosShiftFilter>('ALL');
  const [cashierId, setCashierId] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  // Every shift loaded once (unfiltered) feeds the cashier and device pickers.
  const [known, setKnown] = useState<PosShift[]>([]);

  const load = useCallback(async () => {
    if (!storeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await listPosShifts(storeId, { status: filter, cashierId: cashierId || undefined, deviceId: deviceId || undefined,
        from: from || undefined, to: to || undefined });
      setShifts(rows);
      if (filter === 'ALL' && !cashierId && !deviceId && !from && !to) setKnown(rows);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Shifts could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [storeId, filter, cashierId, deviceId, from, to]);

  useEffect(() => { load(); }, [load]);

  const cashiers = useMemo(() => {
    const m = new Map<string, string>();
    known.forEach(s => { if (s.cashierId) m.set(s.cashierId, s.cashierName); });
    return [...m.entries()];
  }, [known]);
  const devices = useMemo(() => {
    const m = new Map<string, string>();
    known.forEach(s => { if (s.deviceId) m.set(s.deviceId, s.deviceName ?? s.deviceId.slice(0, 8)); });
    return [...m.entries()];
  }, [known]);

  const all = shifts ?? [];
  const open = all.filter(s => s.status === 'OPEN');
  const attention = all.filter(s => s.longOpen || s.reconciliation === 'MISMATCH' || s.lateRecords).length;

  return (
    <>
      <Header title="POS Shifts" subtitle="Cashier shifts and drawer cash on this store's tills" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {!storeId ? (
          <EmptyState icon={<Clock size={28} />} title="Save your store first" description="Shifts come from khanGates POS tills connected to a saved store." />
        ) : loading && shifts === null ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading shifts">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-20" />)}</div>
            {[0, 1, 2].map(i => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : loadError && shifts === null ? (
          <EmptyState icon={<AlertTriangle size={28} />} title="Shifts could not be loaded" description={loadError}
            action={{ label: 'Try again', onClick: load }} />
        ) : (
          <>
            {loadError && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                <span className="flex-1">Could not refresh: {loadError}. Showing the last loaded list.</span>
                <Button size="sm" variant="outline" icon={<RefreshCw size={14} />} onClick={load}>Retry</Button>
              </div>
            )}

            <section className="grid grid-cols-2 lg:grid-cols-3 gap-3" aria-label="Summary">
              <Tile label="Open shifts" value={String(open.length)} hint="in this list" />
              <Tile label="Shifts listed" value={String(all.length)} hint="newest first, at most 200" />
              <Tile label="Needs attention" value={String(attention)} hint="open > 24 h, mismatch or late records" warning={attention > 0} />
            </section>

            <div className="flex flex-col lg:flex-row lg:items-end gap-3">
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter shifts">
                {FILTERS.map(f => (
                  <button key={f.value} type="button" role="tab" aria-selected={filter === f.value} onClick={() => setFilter(f.value)}
                    className={cn('px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer min-h-[36px]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
                      filter === f.value ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-surface-200 text-slate-600 hover:bg-surface-100')}>
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:ml-auto">
                <Select label="Cashier" value={cashierId} onChange={setCashierId} options={cashiers} />
                <Select label="Till" value={deviceId} onChange={setDeviceId} options={devices} />
                <DateInput label="Opened from" value={from} onChange={setFrom} />
                <DateInput label="Opened to" value={to} onChange={setTo} />
              </div>
            </div>

            {all.length === 0 ? (
              <EmptyState icon={<Clock size={28} />} title="No shifts match"
                description="A shift appears here once a till opens it and uploads it. Tills keep working offline and upload when they reconnect." />
            ) : (
              <>
                <div className="hidden md:block bg-white rounded-card border border-surface-200 shadow-card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Shift</th>
                        <th className="px-4 py-3">Cashier · till</th>
                        <th className="px-4 py-3">Opened → closed</th>
                        <th className="px-4 py-3 text-right">Opening</th>
                        <th className="px-4 py-3 text-right">Sales</th>
                        <th className="px-4 py-3 text-right">Expected</th>
                        <th className="px-4 py-3 text-right">Counted</th>
                        <th className="px-4 py-3 text-right">Variance</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {all.map(s => (
                        <tr key={s.id} className="align-top hover:bg-surface-50 cursor-pointer" onClick={() => setDetailId(s.id)}>
                          <td className="px-4 py-3">
                            <button type="button" className="font-medium text-slate-900 hover:text-primary-700 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
                              onClick={e => { e.stopPropagation(); setDetailId(s.id); }}>
                              {s.shiftNumber}
                            </button>
                            <Flags shift={s} />
                          </td>
                          <td className="px-4 py-3 text-slate-700">{s.cashierName}<span className="block text-xs text-slate-500">{s.deviceName ?? '—'}</span></td>
                          <td className="px-4 py-3 text-slate-700">{when(s.openedAt, store.timezone)}<span className="block text-xs text-slate-500">{s.closedAt ? when(s.closedAt, store.timezone) : 'still open'}</span></td>
                          <td className="px-4 py-3 text-right tabular-nums">{shiftMoney(s.totals.openingCash, s.currency)}</td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            {shiftMoney(s.totals.cashSales, s.currency)}
                            <span className="block text-xs text-slate-500">card {shiftMoney(s.totals.terminalSales, s.currency)}</span>
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium">{shiftMoney(s.totals.expectedCash, s.currency)}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{shiftMoney(s.countedCash, s.currency)}</td>
                          <td className={cn('px-4 py-3 text-right tabular-nums font-semibold', varianceClass(s.variance))}>{signedShiftMoney(s.variance, s.currency)}</td>
                          <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[s.status]} dot>{SHIFT_STATUS_LABEL[s.status]}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ul className="md:hidden space-y-3">
                  {all.map(s => (
                    <li key={s.id}>
                      <button type="button" onClick={() => setDetailId(s.id)}
                        className="w-full text-left bg-white rounded-card border border-surface-200 shadow-card p-4 space-y-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">
                        <div className="flex items-start justify-between gap-3">
                          <span className="min-w-0">
                            <span className="block font-semibold text-slate-900 break-words">{s.shiftNumber}</span>
                            <span className="block text-xs text-slate-500">{s.cashierName} · {s.deviceName ?? '—'}</span>
                          </span>
                          <Badge variant={STATUS_VARIANT[s.status]} dot>{SHIFT_STATUS_LABEL[s.status]}</Badge>
                        </div>
                        <dl className="grid grid-cols-3 gap-2 text-xs">
                          <div><dt className="text-slate-500">Expected</dt><dd className="tabular-nums">{shiftMoney(s.totals.expectedCash, s.currency)}</dd></div>
                          <div><dt className="text-slate-500">Counted</dt><dd className="tabular-nums">{shiftMoney(s.countedCash, s.currency)}</dd></div>
                          <div><dt className="text-slate-500">Variance</dt><dd className={cn('tabular-nums font-semibold', varianceClass(s.variance))}>{signedShiftMoney(s.variance, s.currency)}</dd></div>
                        </dl>
                        <Flags shift={s} />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="text-xs text-slate-500">
              Expected cash = opening cash + cash sales + cash in − cash refunds − cash out, computed by khanGates from the sales, returns and
              cash movements the till uploaded. Card-terminal amounts never count. Tills work offline, so figures can change when late uploads
              arrive; a closed shift keeps the till&apos;s own figures beside the server&apos;s.
            </p>
          </>
        )}
      </main>
      <ShiftDetailModal id={detailId} timeZone={store.timezone} onClose={() => setDetailId(null)} onChanged={load} />
    </>
  );
}

function Flags({ shift }: { shift: PosShift }) {
  if (!shift.longOpen && shift.reconciliation !== 'MISMATCH' && !shift.lateRecords) return null;
  return (
    <span className="mt-1 flex flex-wrap gap-1">
      {shift.longOpen && <Badge variant="danger">Open over 24 h</Badge>}
      {shift.reconciliation === 'MISMATCH' && <Badge variant="warning">Till ≠ server</Badge>}
      {shift.lateRecords && <Badge variant="info">Late uploads</Badge>}
    </span>
  );
}

function Tile({ label, value, hint, warning }: { label: string; value: string; hint?: string; warning?: boolean }) {
  return (
    <div className={cn('bg-white rounded-card border shadow-card p-4', warning ? 'border-amber-300' : 'border-surface-200')}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={cn('text-2xl font-bold tabular-nums', warning ? 'text-amber-700' : 'text-slate-900')}>{value}</p>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="text-xs font-medium text-slate-600">
      {label}
      <select value={value} onChange={e => onChange(e.target.value)}
        className="mt-1 block w-full h-9 rounded-btn border border-surface-200 bg-white px-2 text-sm text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400">
        <option value="">All</option>
        {options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
      </select>
    </label>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-xs font-medium text-slate-600">
      {label}
      <input type="date" value={value} onChange={e => onChange(e.target.value)}
        className="mt-1 block w-full h-9 rounded-btn border border-surface-200 bg-white px-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-400" />
    </label>
  );
}

function Row({ label, value, strong, className }: { label: string; value: string; strong?: boolean; className?: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className={cn('tabular-nums text-right', strong && 'font-semibold', className ?? 'text-slate-900')}>{value}</dd>
    </div>
  );
}

function ShiftDetailModal({ id, timeZone, onClose, onChanged }: { id: string | null; timeZone?: string; onClose: () => void; onChanged: () => void }) {
  const { success, error: toastError } = useToast();
  const [detail, setDetail] = useState<PosShiftDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [closing, setClosing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setDetail(null);
    setLoadError(null);
    setConfirming(false);
    setNote('');
    if (!id) return;
    getPosShift(id).then(setDetail).catch(e => setLoadError(e instanceof Error ? e.message : 'The shift could not be loaded.'));
  }, [id]);

  const forceClose = async () => {
    if (!detail || !note.trim()) return;
    setClosing(true);
    try {
      const updated = await forceClosePosShift(detail.shift.id, note);
      setDetail(updated);
      setConfirming(false);
      success(`Shift ${updated.shift.shiftNumber} force-closed.`);
      onChanged();
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'The shift could not be force-closed.');
    } finally {
      setClosing(false);
    }
  };

  const s = detail?.shift;
  const c = s?.currency ?? 'JOD';
  return (
    <Modal open={id !== null} onClose={onClose} title={s ? `Shift ${s.shiftNumber}` : 'Shift'} description={s ? `${s.cashierName} · ${s.deviceName ?? '—'}` : undefined} size="xl">
      {loadError ? (
        <p className="text-sm text-red-700" role="alert">{loadError}</p>
      ) : !detail || !s ? (
        <div className="space-y-2" aria-busy="true"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
      ) : (
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_VARIANT[s.status]} dot>{SHIFT_STATUS_LABEL[s.status]}</Badge>
            <Flags shift={s} />
            <span className="text-xs text-slate-500">{when(s.openedAt, timeZone)} → {s.closedAt ? when(s.closedAt, timeZone) : 'still open'}</span>
          </div>

          <section className="grid md:grid-cols-2 gap-4">
            <dl className="rounded-xl border border-surface-200 p-3">
              <h3 className="text-sm font-semibold text-slate-800 mb-1">Drawer (khanGates, now)</h3>
              <Row label="Opening cash" value={shiftMoney(s.totals.openingCash, c)} />
              <Row label="+ Cash sales" value={shiftMoney(s.totals.cashSales, c)} />
              <Row label="+ Cash in" value={shiftMoney(s.totals.cashIn, c)} />
              <Row label="− Cash refunds" value={shiftMoney(s.totals.cashRefunds, c)} />
              <Row label="− Cash out" value={shiftMoney(s.totals.cashOut, c)} />
              <Row label="Expected cash" value={shiftMoney(s.totals.expectedCash, c)} strong />
              <Row label="Card terminal sales" value={shiftMoney(s.totals.terminalSales, c)} />
              <Row label="Card terminal refunds" value={shiftMoney(s.totals.terminalRefunds, c)} />
              <Row label="Sales · returns" value={`${s.totals.orderCount} · ${s.totals.returnCount}`} />
            </dl>
            <dl className="rounded-xl border border-surface-200 p-3">
              <h3 className="text-sm font-semibold text-slate-800 mb-1">Close and reconciliation</h3>
              <Row label="Counted cash" value={shiftMoney(s.countedCash, c)} strong />
              <Row label="Variance (now)" value={signedShiftMoney(s.variance, c)} strong className={varianceClass(s.variance)} />
              <Row label="Till's expected cash" value={shiftMoney(s.deviceExpectedCash, c)} />
              <Row label="Till's variance" value={signedShiftMoney(s.deviceVariance, c)} />
              <Row label="Server expected at close" value={shiftMoney(s.expectedCashAtClose, c)} />
              <Row label="Reconciliation" value={{ OPEN: 'Shift open', NOT_COUNTED: 'Not counted', MATCHED: 'Till and server match', MISMATCH: 'Till and server differ' }[s.reconciliation]} />
              {s.closedByName && <Row label="Closed by" value={s.closedByName} />}
              {s.closingManagerName && <Row label="Approved by" value={s.closingManagerName} />}
              {s.closeNote && <Row label="Note" value={s.closeNote} />}
              {s.forceClosedByName && <Row label="Force-closed by" value={`${s.forceClosedByName}${s.forceCloseNote ? ` — ${s.forceCloseNote}` : ''}`} />}
            </dl>
          </section>

          {detail.conflicts.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">To review</h3>
              <ul className="space-y-2">
                {detail.conflicts.map(k => (
                  <li key={k.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    <span className="font-medium">{POS_CONFLICT_LABEL[k.type] ?? k.type}</span> — {k.detail}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <List title={`Sales (${detail.orders.length})`} empty="No sales in this shift."
            rows={detail.orders.map(o => [o.receiptNumber ?? o.orderCode, `${o.orderCode} · ${o.paymentMethod === 'CASH' ? 'Cash' : 'Card terminal'}${o.staffName ? ` · ${o.staffName}` : ''}`,
              shiftMoney(o.drawerAmount, c)])} />
          <List title={`Returns (${detail.returns.length})`} empty="No returns in this shift."
            rows={detail.returns.map(r => [r.returnNumber, `${r.kind === 'EXCHANGE' ? 'Exchange' : 'Return'} of ${r.originalOrderCode ?? '—'} · ${r.refundMethod === 'CASH' ? 'cash' : r.refundMethod === 'EXTERNAL_TERMINAL' ? 'card terminal' : 'no money back'}`,
              `−${shiftMoney(r.refundPaidOut, c)}`])} />
          <List title={`Cash in / out (${detail.movements.length})`} empty="No cash movements."
            rows={detail.movements.map(m => [`${m.type === 'CASH_IN' ? 'Cash in' : 'Cash out'} · ${MOVEMENT_REASON_LABEL[m.reason] ?? m.reason}`,
              `${when(m.movedAt, timeZone)} · ${m.staffName}${m.managerName ? ` · approved by ${m.managerName}` : ''}${m.note ? ` · ${m.note}` : ''}`,
              `${m.type === 'CASH_OUT' ? '−' : '+'}${shiftMoney(m.amount, c)}`])} />
          <List title={`Manager approvals (${detail.approvals.length})`} empty="No approvals."
            rows={detail.approvals.map(a => [a.action, `${a.managerName}${a.actingStaffName ? ` for ${a.actingStaffName}` : ''} · ${when(a.approvedAt, timeZone)}`,
              a.verified ? 'Verified' : 'Not verified'])} />

          {s.status === 'OPEN' && (
            <section className="rounded-xl border border-red-200 p-3 space-y-2">
              <h3 className="text-sm font-semibold text-slate-800">Force-close</h3>
              <p className="text-sm text-slate-600">
                Only for a shift the till can no longer close (its data was lost or it was replaced). Nothing is counted, so there is no variance;
                if the till later uploads its own count, it is added. Needs POS manager rights.
              </p>
              {!confirming ? (
                <Button variant="outline" onClick={() => setConfirming(true)} className="min-h-[40px]">Force-close this shift</Button>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-600">Reason (required)
                    <input value={note} onChange={e => setNote(e.target.value)} maxLength={300}
                      className="mt-1 block w-full h-9 rounded-btn border border-surface-200 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
                  </label>
                  <div className="flex gap-2">
                    <Button onClick={forceClose} disabled={closing || !note.trim()} className="min-h-[40px] bg-red-600 hover:bg-red-700">{closing ? 'Closing…' : 'Confirm force-close'}</Button>
                    <Button variant="ghost" onClick={() => setConfirming(false)} className="min-h-[40px]">Cancel</Button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}

function List({ title, empty, rows }: { title: string; empty: string; rows: [string, string, string][] }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-slate-800 mb-2">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="divide-y divide-surface-100 rounded-xl border border-surface-200">
          {rows.map(([a, b, amount], i) => (
            <li key={i} className="flex items-start justify-between gap-3 px-3 py-2 text-sm">
              <span className="min-w-0"><span className="block font-medium text-slate-900 break-words">{a}</span><span className="block text-xs text-slate-500">{b}</span></span>
              <span className="tabular-nums whitespace-nowrap">{amount}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
