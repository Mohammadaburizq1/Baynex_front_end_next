'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, formatMoney } from '@/lib/utils';
import {
  getPosConflicts,
  resolvePosConflict,
  POS_CONFLICT_LABEL,
  type PosConflict,
} from '@/lib/api/pos-sync';

/**
 * POS-11: discrepancies found while offline POS sales were uploaded (stock sold beyond the central
 * count, products removed or repriced between the sale and its upload). The sale itself is always
 * kept as an order; this panel is where the manager checks and signs each one off. Renders nothing
 * when there is nothing to review.
 */
export function PosConflictsPanel({ storeId, currency, onOpenOrder }: {
  storeId: string;
  currency?: string | null;
  onOpenOrder?: (orderId: string) => void;
}) {
  const { success, error } = useToast();
  const [conflicts, setConflicts] = useState<PosConflict[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const summary = await getPosConflicts(storeId, 'OPEN');
      setConflicts(summary.conflicts);
    } catch {
      // No access to the ORDERS section, or the backend is unreachable: nothing to show here.
      setConflicts([]);
    }
  }, [storeId]);

  useEffect(() => {
    load();
  }, [load]);

  if (conflicts.length === 0) return null;

  async function resolve(conflict: PosConflict) {
    setResolving(conflict.id);
    try {
      await resolvePosConflict(conflict.id, 'Reviewed in the dashboard');
      setConflicts(current => current.filter(c => c.id !== conflict.id));
      success('Marked as reviewed.');
    } catch (e) {
      error(e instanceof Error ? e.message : 'Could not update the conflict. Please try again.');
    } finally {
      setResolving(null);
    }
  }

  return (
    <section className="rounded-xl border border-amber-300 bg-amber-50" aria-label="POS sync conflicts">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        <AlertTriangle size={18} className="text-amber-700 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-sm font-semibold text-amber-900">
          {conflicts.length} POS {conflicts.length === 1 ? 'sale needs' : 'sales need'} review
          <span className="block text-xs font-normal text-amber-800">
            Sales made offline at the counter were kept, but they disagreed with the central catalog or stock when they were uploaded.
          </span>
        </span>
        {expanded ? <ChevronUp size={18} className="text-amber-800" /> : <ChevronDown size={18} className="text-amber-800" />}
      </button>

      {expanded && (
        <ul className="divide-y divide-amber-200 border-t border-amber-200">
          {conflicts.map(c => (
            <li key={c.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={c.type === 'OVERSOLD' ? 'danger' : 'warning'}>{POS_CONFLICT_LABEL[c.type] ?? c.type}</Badge>
                  <span className="text-sm font-medium text-slate-900 break-words">{c.itemName}</span>
                </div>
                <p className="text-sm text-slate-700">{c.detail}</p>
                {c.type === 'PRICE_CHANGED' && c.saleUnitPrice != null && c.currentUnitPrice != null && (
                  <p className="text-xs text-slate-600">
                    Charged {formatMoney(c.saleUnitPrice, currency)} · now {formatMoney(c.currentUnitPrice, currency)}
                  </p>
                )}
                <p className="text-xs text-slate-600">
                  Receipt {c.receiptNumber ?? '—'}
                  {c.deviceName ? ` · ${c.deviceName}` : ''}
                  {' · '}
                  {formatDateTime(c.createdAt)}
                  {c.orderCode && c.orderId && (
                    <>
                      {' · '}
                      {onOpenOrder ? (
                        <button
                          type="button"
                          onClick={() => onOpenOrder(c.orderId!)}
                          className="underline text-primary-700 hover:text-primary-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
                        >
                          order {c.orderCode}
                        </button>
                      ) : (
                        `order ${c.orderCode}`
                      )}
                    </>
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                loading={resolving === c.id}
                icon={<CheckCircle2 size={15} />}
                onClick={() => resolve(c)}
                className="min-h-[44px] shrink-0"
              >
                Mark reviewed
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
