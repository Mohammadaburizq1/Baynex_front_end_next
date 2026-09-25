'use client';

import { useCallback, useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StockAdjustDialog } from './StockAdjustDialog';
import {
  getInventory,
  getStockHistory,
  REASON_LABELS,
  type HistoryEntry,
  type InventoryRow,
  type StockStatus,
} from '@/lib/api/inventory';

export const STATUS_BADGE: Record<StockStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  UNTRACKED: { label: 'Not counted', variant: 'default' },
  OK: { label: 'In stock', variant: 'success' },
  LOW: { label: 'Low stock', variant: 'warning' },
  OUT: { label: 'Out of stock', variant: 'danger' },
};

interface ProductStockPanelProps {
  storeId: string;
  productId: string;
  canEdit: boolean;
  /** Bump to reload after something elsewhere changed the catalogue (e.g. variants were saved). */
  refreshKey: number;
}

// The stock tab of the product editor: this product's count(s), with adjust + history.
export function ProductStockPanel({ storeId, productId, canEdit, refreshKey }: ProductStockPanelProps) {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState<InventoryRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inventory, entries] = await Promise.all([
        getInventory(storeId),
        getStockHistory(storeId, { productId, limit: 30 }),
      ]);
      setRows(inventory.filter(r => r.productId === productId));
      setHistory(entries);
    } catch {
      setRows([]);
      setHistory([]);
    }
    setLoading(false);
  }, [storeId, productId]);

  useEffect(() => { void load(); }, [load, refreshKey]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-7 h-7 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (rows.length === 0) {
    return <p className="text-sm text-slate-500 py-8 text-center">This item doesn&apos;t have stock to count.</p>;
  }

  return (
    <div className="space-y-5">
      <Card padding="none" className="divide-y divide-surface-200 overflow-hidden">
        {rows.map(row => {
          const badge = STATUS_BADGE[row.status];
          return (
            <div key={row.variantId ?? row.productId} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{row.variantLabel ?? row.name}</p>
                <p className="text-xs text-slate-500">
                  {row.sku ? `SKU ${row.sku} · ` : ''}alert at {row.effectiveThreshold} or fewer
                </p>
              </div>
              <span className="text-lg font-bold text-slate-900 tabular-nums w-14 text-right">
                {row.stock === null ? '—' : row.stock}
              </span>
              <Badge variant={badge.variant}>{badge.label}</Badge>
              {canEdit && (
                <Button variant="secondary" size="sm" onClick={() => setAdjusting(row)}>
                  {row.stock === null ? 'Set count' : 'Adjust'}
                </Button>
              )}
            </div>
          );
        })}
      </Card>

      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
          <History size={15} className="text-slate-400" /> Stock history
        </h3>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">No stock changes recorded yet.</p>
        ) : (
          <HistoryList entries={history} />
        )}
      </div>

      <StockAdjustDialog
        row={adjusting}
        onClose={() => setAdjusting(null)}
        onAdjusted={() => { void load(); }}
      />
    </div>
  );
}

export function HistoryList({ entries }: { entries: HistoryEntry[] }) {
  return (
    <Card padding="none" className="divide-y divide-surface-200 overflow-hidden">
      {entries.map(e => (
        <div key={e.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
          <span className={`w-12 text-right font-semibold tabular-nums ${e.delta < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {e.delta > 0 ? `+${e.delta}` : e.delta}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-slate-800 truncate">
              {e.itemName} <span className="text-slate-400">· {REASON_LABELS[e.reason]}</span>
              {e.reference ? <span className="text-slate-400"> · #{e.reference}</span> : null}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {new Date(e.createdAt).toLocaleString()}
              {e.createdBy ? ` · ${e.createdBy}` : ''}
              {e.note ? ` · ${e.note}` : ''}
            </p>
          </div>
          <span className="text-xs text-slate-500 tabular-nums shrink-0">now {e.stockAfter}</span>
        </div>
      ))}
    </Card>
  );
}
