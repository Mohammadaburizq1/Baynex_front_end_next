'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import {
  adjustStock,
  REASON_LABELS,
  type InventoryRow,
  type ManualReason,
} from '@/lib/api/inventory';

type Mode = 'ADD' | 'REMOVE' | 'SET';

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'ADD', label: 'Add stock' },
  { value: 'REMOVE', label: 'Remove stock' },
  { value: 'SET', label: 'Set exact count' },
];

const REASON_OPTIONS: { value: ManualReason; label: string }[] = (
  ['RESTOCK', 'CORRECTION', 'DAMAGED', 'RETURNED'] as ManualReason[]
).map(r => ({ value: r, label: REASON_LABELS[r] }));

const DEFAULT_REASON: Record<Mode, ManualReason> = { ADD: 'RESTOCK', REMOVE: 'DAMAGED', SET: 'CORRECTION' };

interface StockAdjustDialogProps {
  /** null = closed. */
  row: InventoryRow | null;
  onClose: () => void;
  onAdjusted: (row: InventoryRow) => void;
}

// One place to change a stock count. Every change carries a reason and goes into the item's
// history, so "why is this at 3?" is always answerable — that's why the count isn't just an
// editable field on the product any more.
export function StockAdjustDialog({ row, onClose, onAdjusted }: StockAdjustDialogProps) {
  const [mode, setMode] = useState<Mode>('ADD');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<ManualReason>('RESTOCK');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!row) return;
    // Nothing counted yet → only "set" makes sense (there's no baseline to add to).
    const initial: Mode = row.stock === null ? 'SET' : 'ADD';
    setMode(initial);
    setReason(DEFAULT_REASON[initial]);
    setQuantity('');
    setNote('');
    setError('');
  }, [row]);

  if (!row) return null;

  const amount = Number(quantity);
  const validAmount = quantity.trim() !== '' && Number.isInteger(amount) && amount >= 0 && (mode === 'SET' || amount > 0);
  const current = row.stock;
  const next = !validAmount
    ? null
    : mode === 'SET' ? amount : (current ?? 0) + (mode === 'ADD' ? amount : -amount);
  const title = row.variantLabel ? `${row.name} — ${row.variantLabel}` : row.name;

  function changeMode(m: Mode) {
    setMode(m);
    setReason(DEFAULT_REASON[m]);
    setError('');
  }

  async function submit() {
    if (!row || !validAmount) return;
    if (next !== null && next < 0) {
      setError(`That would take stock below zero (currently ${current ?? 0}).`);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await adjustStock({
        productId: row.productId,
        variantId: row.variantId,
        mode: mode === 'SET' ? 'SET' : 'DELTA',
        quantity: mode === 'REMOVE' ? -amount : amount,
        reason,
        note: note.trim() || undefined,
      });
      onAdjusted(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update stock.');
    }
    setSaving(false);
  }

  return (
    <Modal
      open
      onClose={() => { if (!saving) onClose(); }}
      title="Adjust stock"
      description={title}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" loading={saving} disabled={!validAmount} onClick={submit}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-btn px-3 py-2">{error}</p>
        )}
        <p className="text-sm text-slate-600">
          Current stock:{' '}
          <span className="font-semibold text-slate-900">{current === null ? 'not counted yet' : current}</span>
        </p>

        <Select
          label="What are you doing?"
          options={row.stock === null ? MODE_OPTIONS.filter(o => o.value === 'SET') : MODE_OPTIONS}
          value={mode}
          onChange={e => changeMode(e.target.value as Mode)}
        />
        <Input
          label={mode === 'SET' ? 'New count' : 'How many'}
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={quantity}
          onChange={e => { setQuantity(e.target.value); setError(''); }}
          hint={next !== null ? `Stock will be ${next}.` : undefined}
        />
        <Select
          label="Reason"
          options={REASON_OPTIONS}
          value={reason}
          onChange={e => setReason(e.target.value as ManualReason)}
        />
        <Textarea
          label="Note (optional)"
          rows={2}
          maxLength={300}
          placeholder="e.g. Delivery from supplier, counted the shelf…"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>
    </Modal>
  );
}
