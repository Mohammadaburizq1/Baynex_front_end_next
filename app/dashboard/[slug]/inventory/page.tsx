'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, History, Package, Search, XCircle } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { SectionAccessGate } from '@/components/dashboard/SectionAccessGate';
import { HistoryList, STATUS_BADGE } from '@/components/dashboard/product-editor/ProductStockPanel';
import { StockAdjustDialog } from '@/components/dashboard/product-editor/StockAdjustDialog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/contexts/StoreContext';
import { BUSINESS_TYPES_WITH_STOCK } from '@/lib/utils';
import {
  getInventory,
  getStockHistory,
  type HistoryEntry,
  type InventoryRow,
  type StockStatus,
} from '@/lib/api/inventory';

type Filter = 'ALL' | StockStatus;

const FILTER_OPTIONS: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'All items' },
  { value: 'LOW', label: 'Low stock' },
  { value: 'OUT', label: 'Out of stock' },
  { value: 'UNTRACKED', label: 'Not counted' },
  { value: 'OK', label: 'In stock' },
];

const rowKey = (r: InventoryRow) => `${r.productId}:${r.variantId ?? ''}`;

export default function InventoryPage() {
  const { store, businessType, permissions } = useStore();
  const { error: toastError } = useToast();
  const tracksStock = BUSINESS_TYPES_WITH_STOCK[businessType] ?? false;
  const canEdit = permissions.PRODUCTS === 'EDIT';
  const synced = !store.id.startsWith('local-');

  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [recent, setRecent] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [adjusting, setAdjusting] = useState<InventoryRow | null>(null);
  const [viewing, setViewing] = useState<InventoryRow | null>(null);
  const [itemHistory, setItemHistory] = useState<HistoryEntry[] | null>(null);

  const load = useCallback(async () => {
    if (!tracksStock || !synced) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [inventory, activity] = await Promise.all([
        getInventory(store.id),
        getStockHistory(store.id, { limit: 20 }),
      ]);
      setRows(inventory);
      setRecent(activity);
    } catch {
      toastError('Could not load inventory.');
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.id, tracksStock, synced]);

  useEffect(() => { void load(); }, [load]);

  // The per-item history modal.
  useEffect(() => {
    if (!viewing) {
      setItemHistory(null);
      return;
    }
    let cancelled = false;
    getStockHistory(store.id, viewing.variantId ? { variantId: viewing.variantId, limit: 50 } : { productId: viewing.productId, limit: 50 })
      .then(list => { if (!cancelled) setItemHistory(list); })
      .catch(() => { if (!cancelled) setItemHistory([]); });
    return () => { cancelled = true; };
  }, [viewing, store.id]);

  const counts = useMemo(() => ({
    total: rows.length,
    low: rows.filter(r => r.status === 'LOW').length,
    out: rows.filter(r => r.status === 'OUT').length,
  }), [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (filter !== 'ALL' && r.status !== filter) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q)
        || (r.variantLabel ?? '').toLowerCase().includes(q)
        || (r.sku ?? '').toLowerCase().includes(q);
    });
  }, [rows, search, filter]);

  if (!tracksStock) {
    return (
      <SectionAccessGate section="PRODUCTS" pageTitle="Inventory">
        <Header title="Inventory" subtitle="Track and manage stock levels" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <EmptyState
            icon={<Package size={28} />}
            title="Inventory doesn't apply to this store"
            description="Stock tracking is for product-based stores. This business type doesn't sell trackable units, so there's nothing to show here."
          />
        </main>
      </SectionAccessGate>
    );
  }

  return (
    <SectionAccessGate section="PRODUCTS" pageTitle="Inventory">
      <Header title="Inventory" subtitle="Track and manage stock levels" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {!synced ? (
          <EmptyState
            icon={<Package size={28} />}
            title="Your store isn't synced yet"
            description="Stock is kept on your account. Finish setting up your store, then come back."
          />
        ) : (
          <>
            {/* Summary chips — click to filter */}
            <div className="flex flex-wrap gap-3">
              <SummaryChip icon={<Package size={16} className="text-indigo-500" />} value={counts.total} label="Items" active={filter === 'ALL'} onClick={() => setFilter('ALL')} />
              <SummaryChip icon={<AlertTriangle size={16} className="text-amber-500" />} value={counts.low} label="Low stock" tone="amber" active={filter === 'LOW'} onClick={() => setFilter(filter === 'LOW' ? 'ALL' : 'LOW')} />
              <SummaryChip icon={<XCircle size={16} className="text-red-500" />} value={counts.out} label="Out of stock" tone="red" active={filter === 'OUT'} onClick={() => setFilter(filter === 'OUT' ? 'ALL' : 'OUT')} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search by name or SKU…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  prefix={<Search size={15} />}
                />
              </div>
              <Select
                aria-label="Filter by stock status"
                options={FILTER_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                value={filter}
                onChange={e => setFilter(e.target.value as Filter)}
                className="sm:w-44"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Package size={28} />}
                title={rows.length === 0 ? 'Nothing to count yet' : 'No items match'}
                description={rows.length === 0
                  ? 'Add products to your store and their stock will show up here.'
                  : 'Try a different search or filter.'}
              />
            ) : (
              <Card padding="none" className="divide-y divide-surface-200 overflow-hidden">
                {filtered.map(row => {
                  const badge = STATUS_BADGE[row.status];
                  return (
                    <div key={rowKey(row)} className="flex flex-wrap items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1 basis-48">
                        <p className="text-sm font-semibold text-slate-900 truncate">{row.name}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {row.variantLabel ? `${row.variantLabel} · ` : ''}
                          {row.sku ? `SKU ${row.sku} · ` : ''}
                          alert at {row.effectiveThreshold} or fewer
                          {!row.available ? ' · hidden' : ''}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-slate-900 tabular-nums w-14 text-right">
                        {row.stock === null ? '—' : row.stock}
                      </span>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                      <div className="flex gap-2 ml-auto">
                        <Button variant="ghost" size="sm" icon={<History size={14} />} onClick={() => setViewing(row)}>
                          History
                        </Button>
                        {canEdit && (
                          <Button variant="secondary" size="sm" onClick={() => setAdjusting(row)}>
                            {row.stock === null ? 'Set count' : 'Adjust'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Card>
            )}

            {recent.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                  <History size={15} className="text-slate-400" /> Recent stock activity
                </h2>
                <HistoryList entries={recent} />
              </section>
            )}
          </>
        )}
      </main>

      <StockAdjustDialog
        row={adjusting}
        onClose={() => setAdjusting(null)}
        onAdjusted={() => { void load(); }}
      />

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Stock history"
        description={viewing ? (viewing.variantLabel ? `${viewing.name} — ${viewing.variantLabel}` : viewing.name) : undefined}
        size="xl"
      >
        {itemHistory === null ? (
          <div className="flex justify-center py-8">
            <div className="w-7 h-7 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
          </div>
        ) : itemHistory.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No stock changes recorded for this item yet.</p>
        ) : (
          <HistoryList entries={itemHistory} />
        )}
      </Modal>
    </SectionAccessGate>
  );
}

function SummaryChip({ icon, value, label, tone, active, onClick }: {
  icon: React.ReactNode; value: number; label: string; tone?: 'amber' | 'red'; active: boolean; onClick: () => void;
}) {
  const border = tone === 'amber' ? 'border-amber-200' : tone === 'red' ? 'border-red-200' : 'border-surface-200';
  const text = tone === 'amber' ? 'text-amber-700' : tone === 'red' ? 'text-red-700' : 'text-slate-900';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-2 bg-white border rounded-xl px-4 py-2.5 shadow-card cursor-pointer transition-shadow duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${border} ${active ? 'ring-2 ring-primary-300' : ''}`}
    >
      {icon}
      <span className={`text-sm font-semibold ${text}`}>{value}</span>
      <span className="text-sm text-slate-500">{label}</span>
    </button>
  );
}
