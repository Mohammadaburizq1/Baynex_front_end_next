'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, History, LayoutGrid, Pencil, Plus, RefreshCw, UtensilsCrossed } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';
import { shiftMoney } from '@/lib/api/pos-shifts';
import {
  createArea, createTable, getRestaurantSettings, listAreas, listTables, ORDER_STATE_LABEL, ORDER_TYPE_LABEL, tableHistory,
  updateArea, updateRestaurantSettings, updateTable,
  type RestaurantArea, type RestaurantSettings, type RestaurantTable, type TableOrder,
} from '@/lib/api/restaurant';

// POS-26: restaurant setup — whether the POS runs restaurant mode, the floor areas and the tables.
// Everything is saved on the backend, which checks store access and rights (POS manager to change);
// the tills download it on their next sync. Tables with history are deactivated, never deleted.

type ModeChoice = 'AUTO' | 'ON' | 'OFF';

const MODE_OPTIONS: { value: ModeChoice; label: string; hint: string }[] = [
  { value: 'AUTO', label: 'Follow business type', hint: 'On for restaurants and cafés, off for other stores' },
  { value: 'ON', label: 'On', hint: 'Tables, dine-in, takeaway and delivery on the POS' },
  { value: 'OFF', label: 'Off', hint: 'The POS keeps the quick-sale flow only' },
];

function modeOf(s: RestaurantSettings | null): ModeChoice {
  // The backend leaves null fields out of its JSON: "follow the business type" arrives as a missing field.
  if (!s || s.restaurantMode == null) return 'AUTO';
  return s.restaurantMode ? 'ON' : 'OFF';
}

function errorText(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

function when(iso: string | null, timeZone?: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: timeZone || undefined }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
}

export default function RestaurantSetupPage() {
  const { success, error } = useToast();
  const { store } = useStore();
  const storeId = store.id && !store.id.startsWith('local-') ? store.id : null;
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [areas, setAreas] = useState<RestaurantArea[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [areaId, setAreaId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [savingMode, setSavingMode] = useState(false);
  const [editArea, setEditArea] = useState<RestaurantArea | 'new' | null>(null);
  const [editTable, setEditTable] = useState<RestaurantTable | 'new' | null>(null);
  const [historyOf, setHistoryOf] = useState<RestaurantTable | null>(null);

  const load = useCallback(async () => {
    if (!storeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const [s, a, t] = await Promise.all([getRestaurantSettings(storeId), listAreas(storeId), listTables(storeId)]);
      setSettings(s);
      setAreas(a);
      setTables(t);
      setAreaId(current => current && a.some(x => x.id === current) ? current : (a.find(x => x.active)?.id ?? a[0]?.id ?? null));
    } catch (e) {
      setLoadError(errorText(e, 'The restaurant setup could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => { load(); }, [load]);

  const visibleAreas = useMemo(() => areas.filter(a => showInactive || a.active), [areas, showInactive]);
  const areaTables = useMemo(
    () => tables.filter(t => t.areaId === areaId && (showInactive || t.active)).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [tables, areaId, showInactive],
  );
  const activeTables = tables.filter(t => t.active).length;

  async function chooseMode(choice: ModeChoice) {
    if (!storeId || choice === modeOf(settings)) return;
    setSavingMode(true);
    try {
      const updated = await updateRestaurantSettings(storeId, choice === 'AUTO' ? null : choice === 'ON');
      setSettings(updated);
      success(updated.effective ? 'Restaurant mode is on. Tills switch on their next sync.' : 'Restaurant mode is off. Tills switch on their next sync.');
    } catch (e) {
      error(errorText(e, 'The setting was not saved.'));
    } finally {
      setSavingMode(false);
    }
  }

  // Swaps the position of two neighbours (areas or tables) with two saves.
  async function moveArea(area: RestaurantArea, dir: -1 | 1) {
    const list = [...visibleAreas].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    const i = list.findIndex(a => a.id === area.id);
    const other = list[i + dir];
    if (!other) return;
    try {
      const [a, b] = await Promise.all([
        updateArea(area.id, { name: area.name, sortOrder: other.sortOrder === area.sortOrder ? i + dir : other.sortOrder }),
        updateArea(other.id, { name: other.name, sortOrder: other.sortOrder === area.sortOrder ? i : area.sortOrder }),
      ]);
      setAreas(prev => prev.map(x => (x.id === a.id ? a : x.id === b.id ? b : x)));
    } catch (e) {
      error(errorText(e, 'The order was not saved.'));
    }
  }

  async function moveTable(table: RestaurantTable, dir: -1 | 1) {
    const i = areaTables.findIndex(t => t.id === table.id);
    const other = areaTables[i + dir];
    if (!other) return;
    try {
      const [a, b] = await Promise.all([
        updateTable(table.id, { ...table, sortOrder: other.sortOrder === table.sortOrder ? i + dir : other.sortOrder }),
        updateTable(other.id, { ...other, sortOrder: other.sortOrder === table.sortOrder ? i : table.sortOrder }),
      ]);
      setTables(prev => prev.map(x => (x.id === a.id ? a : x.id === b.id ? b : x)));
    } catch (e) {
      error(errorText(e, 'The order was not saved.'));
    }
  }

  async function toggleArea(area: RestaurantArea) {
    try {
      const updated = await updateArea(area.id, { name: area.name, active: !area.active });
      setAreas(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      success(updated.active ? `${updated.name} is in use again.` : `${updated.name} is hidden on the tills. Its history stays.`);
    } catch (e) {
      error(errorText(e, 'The area was not changed.'));
    }
  }

  async function toggleTable(table: RestaurantTable) {
    try {
      const updated = await updateTable(table.id, { ...table, active: !table.active });
      setTables(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      success(updated.active ? `${updated.name} is in use again.` : `${updated.name} is deactivated. Its orders stay in the history.`);
    } catch (e) {
      // 409: an open order is on this table.
      error(errorText(e, 'The table was not changed.'));
    }
  }

  const mode = modeOf(settings);

  return (
    <>
      <Header title="Restaurant setup" subtitle="Floor areas and tables for the khanGates POS restaurant mode" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {!storeId ? (
          <EmptyState icon={<UtensilsCrossed size={28} />} title="Save your store first" description="Tables belong to a saved store and reach its POS tills." />
        ) : loading && settings === null ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading restaurant setup">
            <Skeleton className="h-28" />
            <div className="grid lg:grid-cols-[320px_1fr] gap-4"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
          </div>
        ) : loadError && settings === null ? (
          <EmptyState icon={<AlertTriangle size={28} />} title="The restaurant setup could not be loaded" description={loadError}
            action={{ label: 'Try again', onClick: load }} />
        ) : (
          <>
            {loadError && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                <span className="flex-1">Could not refresh: {loadError}</span>
                <Button size="sm" variant="outline" icon={<RefreshCw size={14} />} onClick={load}>Retry</Button>
              </div>
            )}

            <section className="bg-white rounded-card border border-surface-200 shadow-card p-4 md:p-5 space-y-3" aria-labelledby="mode-title">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="mode-title" className="text-base font-semibold text-slate-900">Restaurant POS mode</h2>
                  <p className="text-sm text-slate-600">
                    {settings?.effective ? 'On' : 'Off'} for this store
                    {mode === 'AUTO' ? ` (from its business type: ${settings?.byBusinessType ? 'restaurant or café' : 'not a restaurant'})` : ' (set by you)'}.
                  </p>
                </div>
                <Badge variant={settings?.effective ? 'success' : 'default'} dot>{settings?.effective ? 'Restaurant mode on' : 'Restaurant mode off'}</Badge>
              </div>
              <div className="grid sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Restaurant POS mode">
                {MODE_OPTIONS.map(o => (
                  <button key={o.value} type="button" role="radio" aria-checked={mode === o.value} disabled={savingMode}
                    onClick={() => chooseMode(o.value)}
                    className={cn('text-left rounded-xl border px-4 py-3 min-h-[44px] cursor-pointer transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-60',
                      mode === o.value ? 'border-primary-500 bg-primary-50' : 'border-surface-200 bg-white hover:bg-surface-50')}>
                    <span className="block text-sm font-semibold text-slate-900">{o.label}</span>
                    <span className="block text-xs text-slate-600">{o.hint}</span>
                  </button>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-600 flex-1">{areas.filter(a => a.active).length} areas · {activeTables} tables in use</p>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer min-h-[44px]">
                <input type="checkbox" className="h-4 w-4 accent-primary-500 cursor-pointer" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} />
                Show deactivated
              </label>
            </div>

            <div className="grid lg:grid-cols-[320px_1fr] gap-4">
              <section className="bg-white rounded-card border border-surface-200 shadow-card" aria-labelledby="areas-title">
                <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                  <h2 id="areas-title" className="text-sm font-semibold text-slate-900">Areas</h2>
                  <Button size="sm" icon={<Plus size={14} />} onClick={() => setEditArea('new')}>Add area</Button>
                </div>
                {visibleAreas.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-slate-600">Add an area such as Main Hall, Terrace or Upstairs.</p>
                ) : (
                  <ul className="divide-y divide-surface-100">
                    {[...visibleAreas].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)).map((a, i, list) => (
                      <li key={a.id} className={cn('flex items-center gap-1 px-2', areaId === a.id && 'bg-primary-50')}>
                        <button type="button" onClick={() => setAreaId(a.id)}
                          className="flex-1 text-left px-2 py-3 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded">
                          <span className={cn('block text-sm font-medium', a.active ? 'text-slate-900' : 'text-slate-500 line-through')}>{a.name}</span>
                          <span className="block text-xs text-slate-500">{tables.filter(t => t.areaId === a.id && t.active).length} tables{a.active ? '' : ' · deactivated'}</span>
                        </button>
                        <IconButton label={`Move ${a.name} up`} disabled={i === 0} onClick={() => moveArea(a, -1)}><ArrowUp size={16} /></IconButton>
                        <IconButton label={`Move ${a.name} down`} disabled={i === list.length - 1} onClick={() => moveArea(a, 1)}><ArrowDown size={16} /></IconButton>
                        <IconButton label={`Edit ${a.name}`} onClick={() => setEditArea(a)}><Pencil size={16} /></IconButton>
                        <button type="button" onClick={() => toggleArea(a)}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 min-h-[44px] cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">
                          {a.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="bg-white rounded-card border border-surface-200 shadow-card" aria-labelledby="tables-title">
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-surface-100">
                  <h2 id="tables-title" className="text-sm font-semibold text-slate-900">
                    Tables{areaId ? ` · ${areas.find(a => a.id === areaId)?.name ?? ''}` : ''}
                  </h2>
                  <Button size="sm" icon={<Plus size={14} />} disabled={!areas.some(a => a.active)} onClick={() => setEditTable('new')}>Add table</Button>
                </div>
                {!areaId ? (
                  <EmptyState icon={<LayoutGrid size={24} />} title="Add an area first" description="Tables are placed in an area." />
                ) : areaTables.length === 0 ? (
                  <EmptyState icon={<LayoutGrid size={24} />} title="No tables in this area" description="Add tables such as T1, T2 or VIP-1, with how many they seat." />
                ) : (
                  <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
                    {areaTables.map((t, i) => (
                      <li key={t.id} className={cn('rounded-xl border p-3 space-y-2', t.active ? 'border-surface-200' : 'border-dashed border-surface-300 bg-surface-50')}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className={cn('text-lg font-bold break-words', t.active ? 'text-slate-900' : 'text-slate-500')}>{t.name}</p>
                            <p className="text-xs text-slate-600">{t.capacity ? `Seats ${t.capacity}` : 'No capacity set'}</p>
                          </div>
                          {!t.active && <Badge variant="default">Deactivated</Badge>}
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <IconButton label={`Move ${t.name} earlier`} disabled={i === 0} onClick={() => moveTable(t, -1)}><ArrowUp size={16} /></IconButton>
                          <IconButton label={`Move ${t.name} later`} disabled={i === areaTables.length - 1} onClick={() => moveTable(t, 1)}><ArrowDown size={16} /></IconButton>
                          <IconButton label={`Edit ${t.name}`} onClick={() => setEditTable(t)}><Pencil size={16} /></IconButton>
                          <IconButton label={`History of ${t.name}`} onClick={() => setHistoryOf(t)}><History size={16} /></IconButton>
                          <button type="button" onClick={() => toggleTable(t)}
                            className="ml-auto text-xs font-medium text-slate-600 hover:text-slate-900 px-2 min-h-[44px] cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">
                            {t.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </main>

      {editArea !== null && storeId && (
        <AreaDialog storeId={storeId} area={editArea === 'new' ? null : editArea} onClose={() => setEditArea(null)}
          onSaved={saved => {
            setAreas(prev => (prev.some(a => a.id === saved.id) ? prev.map(a => (a.id === saved.id ? saved : a)) : [...prev, saved]));
            setAreaId(saved.id);
            setEditArea(null);
            success(`${saved.name} saved.`);
          }} />
      )}
      {editTable !== null && storeId && (
        <TableDialog storeId={storeId} table={editTable === 'new' ? null : editTable} areas={areas.filter(a => a.active)}
          defaultAreaId={areaId} onClose={() => setEditTable(null)}
          onSaved={saved => {
            setTables(prev => (prev.some(t => t.id === saved.id) ? prev.map(t => (t.id === saved.id ? saved : t)) : [...prev, saved]));
            setAreaId(saved.areaId);
            setEditTable(null);
            success(`${saved.name} saved.`);
          }} />
      )}
      {historyOf && <HistoryDialog table={historyOf} timeZone={store.timezone} currency={store.currency || 'JOD'} onClose={() => setHistoryOf(null)} />}
    </>
  );
}

function IconButton({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick}
      className="inline-flex items-center justify-center h-11 w-11 rounded-lg text-slate-600 hover:bg-surface-100 hover:text-slate-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">
      {children}
    </button>
  );
}

function AreaDialog({ storeId, area, onClose, onSaved }: {
  storeId: string; area: RestaurantArea | null; onClose: () => void; onSaved: (a: RestaurantArea) => void;
}) {
  const [name, setName] = useState(area?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) {
      setProblem('Enter a name, e.g. Main Hall.');
      return;
    }
    setSaving(true);
    setProblem(null);
    try {
      onSaved(area ? await updateArea(area.id, { name: trimmed }) : await createArea(storeId, { name: trimmed }));
    } catch (e) {
      setProblem(errorText(e, 'The area was not saved.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={area ? `Edit ${area.name}` : 'Add an area'} size="sm"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button loading={saving} onClick={save}>Save</Button></>}>
      <Input label="Area name" value={name} maxLength={80} autoFocus onChange={e => setName(e.target.value)} error={problem ?? undefined}
        onKeyDown={e => { if (e.key === 'Enter') save(); }} />
    </Modal>
  );
}

function TableDialog({ storeId, table, areas, defaultAreaId, onClose, onSaved }: {
  storeId: string; table: RestaurantTable | null; areas: RestaurantArea[]; defaultAreaId: string | null;
  onClose: () => void; onSaved: (t: RestaurantTable) => void;
}) {
  const [name, setName] = useState(table?.name ?? '');
  const [areaId, setAreaId] = useState(table?.areaId ?? defaultAreaId ?? areas[0]?.id ?? '');
  const [capacity, setCapacity] = useState(table?.capacity ? String(table.capacity) : '');
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function save() {
    const trimmed = name.trim();
    const seats = capacity.trim() === '' ? null : Number(capacity);
    if (!trimmed) return setProblem('Enter the table name or number, e.g. T1.');
    if (!areaId) return setProblem('Choose an area.');
    if (seats !== null && (!Number.isInteger(seats) || seats < 1 || seats > 200)) return setProblem('Seats must be a whole number from 1 to 200.');
    setSaving(true);
    setProblem(null);
    try {
      const input = { areaId, name: trimmed, capacity: seats, sortOrder: table?.sortOrder, active: table?.active ?? true };
      onSaved(table ? await updateTable(table.id, input) : await createTable(storeId, { areaId, name: trimmed, capacity: seats }));
    } catch (e) {
      setProblem(errorText(e, 'The table was not saved.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={table ? `Edit ${table.name}` : 'Add a table'} size="sm"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button loading={saving} onClick={save}>Save</Button></>}>
      <div className="space-y-3">
        <Input label="Table name or number" value={name} maxLength={40} autoFocus onChange={e => setName(e.target.value)} hint="Unique among the tables in use, e.g. T1 or VIP-1" />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="table-area" className="text-sm font-medium text-slate-700">Area</label>
          <select id="table-area" value={areaId} onChange={e => setAreaId(e.target.value)}
            className="h-11 rounded-lg border border-surface-200 bg-white px-3 text-sm text-slate-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400">
            {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <Input label="Seats (optional)" type="number" inputMode="numeric" min={1} max={200} value={capacity} onChange={e => setCapacity(e.target.value)}
          hint="More guests than seats is only a warning on the POS" />
        {problem && <p className="text-sm text-red-600" role="alert">{problem}</p>}
      </div>
    </Modal>
  );
}

function HistoryDialog({ table, timeZone, currency, onClose }: { table: RestaurantTable; timeZone?: string; currency: string; onClose: () => void }) {
  const [orders, setOrders] = useState<TableOrder[] | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    tableHistory(table.id)
      .then(rows => { if (!cancelled) setOrders(rows); })
      .catch(e => { if (!cancelled) setProblem(errorText(e, 'The history could not be loaded.')); });
    return () => { cancelled = true; };
  }, [table.id]);

  return (
    <Modal open onClose={onClose} title={`${table.name} · order history`} size="xl">
      {problem ? (
        <p className="text-sm text-red-600" role="alert">{problem}</p>
      ) : orders === null ? (
        <div className="space-y-2" aria-busy="true">{[0, 1, 2].map(i => <Skeleton key={i} className="h-12" />)}</div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-slate-600">No orders on this table yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr><th className="py-2 pr-3">Order</th><th className="py-2 pr-3">Opened</th><th className="py-2 pr-3">Waiter</th><th className="py-2 pr-3">Guests</th><th className="py-2 pr-3 text-right">Total</th><th className="py-2">State</th></tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {orders.map(o => (
                <tr key={o.id}>
                  <td className="py-2 pr-3 font-medium text-slate-900">{o.orderCode}<span className="block text-xs text-slate-500">{o.ticketNumber ?? ''} · {ORDER_TYPE_LABEL[o.orderType]}{o.tableId !== table.id ? ' · moved' : ''}</span></td>
                  <td className="py-2 pr-3 text-slate-700">{when(o.openedAt, timeZone)}</td>
                  <td className="py-2 pr-3 text-slate-700">{o.waiterName ?? '—'}</td>
                  <td className="py-2 pr-3 text-slate-700">{o.guestCount ?? '—'}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{shiftMoney(o.total, currency)}<span className="block text-xs text-slate-500">paid {shiftMoney(o.paid, currency)}</span></td>
                  <td className="py-2"><Badge variant={o.status === 'OPEN' ? 'primary' : o.status === 'COMPLETED' ? 'success' : 'default'}>{ORDER_STATE_LABEL[o.status] ?? o.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
