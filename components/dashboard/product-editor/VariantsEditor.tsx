'use client';

import { useMemo, useRef, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Toggle } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { saveVariants, type ApiVariants } from '@/lib/api/products';

const MAX_OPTIONS = 3;
const MAX_VARIANTS = 200;
const SUGGESTED_OPTIONS = ['Size', 'Color', 'Material'];

interface ValueState { id?: string; label: string }
interface OptionState { id?: string; name: string; values: ValueState[] }

interface RowState {
  /** Present for a variant that already exists. */
  id?: string;
  /** One label per option, in option order. */
  selection: string[];
  sku: string;
  price: string;
  salePrice: string;
  /** Opening stock for a NEW variant (existing ones are changed through Stock adjustments). */
  stock: string;
  /** An existing variant's live count, shown read-only. */
  stockNow: number | null;
  available: boolean;
  lowStock: string;
}

interface VariantsEditorProps {
  productId: string;
  initial: ApiVariants;
  /** The product's own price — what a brand-new variant starts at. */
  productPrice: number;
  tracksStock: boolean;
  canEdit: boolean;
  onSaved: (saved: ApiVariants) => void;
}

const norm = (s: string) => s.trim().toLowerCase();
const rowKey = (selection: string[]) => selection.map(norm).join('\u0001');

function fromApi(initial: ApiVariants): { options: OptionState[]; rows: RowState[] } {
  return {
    options: initial.options.map(o => ({
      id: o.id,
      name: o.name,
      values: o.values.map(v => ({ id: v.id, label: v.label })),
    })),
    rows: initial.variants.map(v => ({
      id: v.id,
      selection: v.selection,
      sku: v.sku ?? '',
      price: String(v.price),
      salePrice: v.salePrice != null ? String(v.salePrice) : '',
      stock: '',
      stockNow: v.stock,
      available: v.available,
      lowStock: v.lowStockThreshold != null ? String(v.lowStockThreshold) : '',
    })),
  };
}

// Every combination of the options' values, in option order. Rows that already exist (matched by
// their labels, case-insensitively) keep everything the merchant typed; a new combination starts
// from the price of the closest existing row (same leading values) or the product's own price.
function buildRows(options: OptionState[], previous: RowState[], fallbackPrice: string): RowState[] {
  if (options.length === 0 || options.some(o => o.values.length === 0)) return [];
  let combos: string[][] = [[]];
  for (const option of options) {
    const next: string[][] = [];
    for (const combo of combos) for (const value of option.values) next.push([...combo, value.label]);
    combos = next;
    if (combos.length > MAX_VARIANTS * 4) break; // stop early; the caller reports the overflow
  }
  const byKey = new Map(previous.map(r => [rowKey(r.selection), r]));
  return combos.map(selection => {
    const existing = byKey.get(rowKey(selection));
    if (existing) return { ...existing, selection };
    const related = previous.find(r => r.selection.length > 0 && norm(r.selection[0]) === norm(selection[0]));
    return {
      selection,
      sku: '',
      price: related?.price ?? fallbackPrice,
      salePrice: '',
      stock: '',
      stockNow: null,
      available: true,
      lowStock: '',
    };
  });
}

export function VariantsEditor({ productId, initial, productPrice, tracksStock, canEdit, onSaved }: VariantsEditorProps) {
  const { success, error: toastError } = useToast();
  const start = useMemo(() => fromApi(initial), [initial]);
  const [options, setOptions] = useState<OptionState[]>(start.options);
  const [rows, setRows] = useState<RowState[]>(start.rows);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [bulkPrice, setBulkPrice] = useState('');
  // Rows the merchant already filled in survive a temporary trip through "no combinations" (e.g.
  // while a new option has no values yet).
  const memory = useRef<Map<string, RowState>>(new Map(start.rows.map(r => [rowKey(r.selection), r])));
  const fallbackPrice = String(productPrice);
  const hadVariants = initial.variants.length > 0;

  function remember(next: RowState[]) {
    for (const r of next) memory.current.set(rowKey(r.selection), r);
  }

  function restructure(nextOptions: OptionState[], renamed?: { optionIndex: number; from: string; to: string }) {
    let base = rows;
    if (renamed) {
      base = rows.map(r => (r.selection[renamed.optionIndex] === renamed.from
        ? { ...r, selection: r.selection.map((s, i) => (i === renamed.optionIndex ? renamed.to : s)) }
        : r));
    }
    remember(base);
    const previous = [...base, ...memory.current.values()].filter(
      (r, i, all) => all.findIndex(o => rowKey(o.selection) === rowKey(r.selection)) === i,
    );
    const next = buildRows(nextOptions, previous, fallbackPrice);
    setOptions(nextOptions);
    setRows(next);
    setDirty(true);
    setError(next.length > MAX_VARIANTS ? `That makes ${next.length} variants — the most a product can have is ${MAX_VARIANTS}.` : '');
  }

  function addOption(name = '') {
    if (options.length >= MAX_OPTIONS) return;
    restructure([...options, { name, values: [] }]);
  }

  function renameOption(i: number, name: string) {
    setOptions(options.map((o, idx) => (idx === i ? { ...o, name } : o)));
    setDirty(true);
  }

  function removeOption(i: number) {
    restructure(options.filter((_, idx) => idx !== i));
  }

  function addValue(i: number, raw: string) {
    const labels = raw.split(',').map(s => s.trim()).filter(Boolean);
    if (labels.length === 0) return;
    const existing = new Set(options[i].values.map(v => norm(v.label)));
    const fresh: ValueState[] = [];
    for (const label of labels) {
      if (!existing.has(norm(label))) {
        existing.add(norm(label));
        fresh.push({ label });
      }
    }
    if (fresh.length === 0) return;
    restructure(options.map((o, idx) => (idx === i ? { ...o, values: [...o.values, ...fresh] } : o)));
  }

  function renameValue(i: number, j: number, label: string): boolean {
    const clean = label.trim();
    const old = options[i].values[j].label;
    if (!clean || clean === old) return false;
    if (options[i].values.some((v, idx) => idx !== j && norm(v.label) === norm(clean))) {
      toastError(`"${options[i].name || 'This option'}" already has a value called "${clean}".`);
      return false;
    }
    restructure(
      options.map((o, idx) => (idx === i ? { ...o, values: o.values.map((v, k) => (k === j ? { ...v, label: clean } : v)) } : o)),
      { optionIndex: i, from: old, to: clean },
    );
    return true;
  }

  function removeValue(i: number, j: number) {
    restructure(options.map((o, idx) => (idx === i ? { ...o, values: o.values.filter((_, k) => k !== j) } : o)));
  }

  function patchRow(index: number, patch: Partial<RowState>) {
    setRows(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    setDirty(true);
  }

  function applyBulkPrice() {
    const p = Number(bulkPrice);
    if (bulkPrice.trim() === '' || Number.isNaN(p) || p < 0) return;
    setRows(rows.map(r => ({ ...r, price: String(p), salePrice: '' })));
    setDirty(true);
    setBulkPrice('');
  }

  function validate(): string | null {
    if (options.length === 0) return null;
    const names = new Set<string>();
    for (const o of options) {
      if (!o.name.trim()) return 'Give every option a name (for example Size).';
      if (names.has(norm(o.name))) return `Two options are both called "${o.name.trim()}".`;
      names.add(norm(o.name));
      if (o.values.length === 0) return `Add at least one value to "${o.name.trim()}".`;
    }
    if (rows.length === 0) return 'Add at least one variant.';
    if (rows.length > MAX_VARIANTS) return `A product can have at most ${MAX_VARIANTS} variants.`;
    const skus = new Set<string>();
    for (const r of rows) {
      const label = r.selection.join(' / ');
      const price = Number(r.price);
      if (r.price.trim() === '' || Number.isNaN(price) || price < 0) return `Enter a price for ${label}.`;
      if (r.salePrice.trim() !== '' && !(Number(r.salePrice) >= 0 && Number(r.salePrice) < price)) {
        return `The sale price for ${label} must be lower than its price.`;
      }
      if (!r.id && r.stock.trim() !== '' && !(Number.isInteger(Number(r.stock)) && Number(r.stock) >= 0)) {
        return `Stock for ${label} must be a whole number, 0 or more.`;
      }
      if (r.lowStock.trim() !== '' && !(Number.isInteger(Number(r.lowStock)) && Number(r.lowStock) >= 0)) {
        return `The low-stock alert for ${label} must be a whole number, 0 or more.`;
      }
      const sku = norm(r.sku);
      if (sku) {
        if (skus.has(sku)) return `The SKU "${r.sku.trim()}" is used by more than one variant.`;
        skus.add(sku);
      }
    }
    return null;
  }

  async function save() {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const saved = await saveVariants(productId, {
        options: options.map(o => ({
          id: o.id,
          name: o.name.trim(),
          values: o.values.map(v => ({ id: v.id, label: v.label.trim() })),
        })),
        variants: rows.map(r => ({
          id: r.id,
          selection: r.selection,
          sku: r.sku.trim() || undefined,
          price: Number(r.price),
          salePrice: r.salePrice.trim() === '' ? null : Number(r.salePrice),
          stock: r.id ? undefined : r.stock.trim() === '' ? null : Number(r.stock),
          available: r.available,
          lowStockThreshold: r.lowStock.trim() === '' ? null : Number(r.lowStock),
        })),
      });
      const fresh = fromApi(saved);
      setOptions(fresh.options);
      setRows(fresh.rows);
      memory.current = new Map(fresh.rows.map(r => [rowKey(r.selection), r]));
      setDirty(false);
      onSaved(saved);
      success(saved.variants.length > 0 ? 'Options and variants saved.' : 'Variants removed.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    }
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-btn px-3 py-2">{error}</p>
      )}

      {/* ── Options ─────────────────────────────────────────────────────────────────── */}
      <Card className="p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Options</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Use options when a product comes in versions — sizes, colours, materials. Each combination becomes a variant
            with its own price and stock.
          </p>
        </div>

        {options.length === 0 && canEdit && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_OPTIONS.map(name => (
              <button
                key={name}
                type="button"
                onClick={() => addOption(name)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-surface-200 bg-white text-xs font-medium text-slate-600 hover:border-primary-300 hover:text-primary-700 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              >
                <Plus size={12} /> {name}
              </button>
            ))}
          </div>
        )}

        {options.map((option, i) => (
          <div key={option.id ?? `new-${i}`} className="rounded-lg border border-surface-200 p-3 space-y-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label={`Option ${i + 1}`}
                  placeholder="e.g. Size"
                  maxLength={60}
                  disabled={!canEdit}
                  value={option.name}
                  onChange={e => renameOption(i, e.target.value)}
                />
              </div>
              {canEdit && (
                <button
                  type="button"
                  aria-label={`Remove option ${option.name || i + 1}`}
                  onClick={() => removeOption(i)}
                  className="h-9 w-9 flex items-center justify-center rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {option.values.map((value, j) => (
                <ValueChip
                  key={value.id ?? `${value.label}-${j}`}
                  label={value.label}
                  disabled={!canEdit}
                  onRename={label => renameValue(i, j, label)}
                  onRemove={() => removeValue(i, j)}
                />
              ))}
              {canEdit && <ValueAdder onAdd={raw => addValue(i, raw)} />}
            </div>
          </div>
        ))}

        {canEdit && options.length > 0 && options.length < MAX_OPTIONS && (
          <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => addOption()}>
            Add another option
          </Button>
        )}
      </Card>

      {/* ── Variants ────────────────────────────────────────────────────────────────── */}
      {rows.length > 0 && (
        <Card padding="none" className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-surface-200">
            <h3 className="text-sm font-semibold text-slate-900">
              {rows.length} {rows.length === 1 ? 'variant' : 'variants'}
            </h3>
            {canEdit && (
              <div className="flex items-end gap-2">
                <Input
                  aria-label="Price for all variants"
                  placeholder="Price for all"
                  type="number"
                  min="0"
                  step="0.01"
                  value={bulkPrice}
                  onChange={e => setBulkPrice(e.target.value)}
                  className="w-32"
                />
                <Button variant="secondary" size="sm" onClick={applyBulkPrice} disabled={!bulkPrice.trim()}>Apply</Button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide bg-surface-50">
                  <th className="px-4 py-2">Variant</th>
                  <th className="px-2 py-2">SKU</th>
                  <th className="px-2 py-2">Price</th>
                  <th className="px-2 py-2">Sale price</th>
                  {tracksStock && <th className="px-2 py-2">Stock</th>}
                  {tracksStock && <th className="px-2 py-2">Low-stock alert</th>}
                  <th className="px-4 py-2">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {rows.map((row, index) => (
                  <tr key={row.id ?? rowKey(row.selection)}>
                    <td className="px-4 py-2 font-medium text-slate-800 whitespace-nowrap">{row.selection.join(' / ')}</td>
                    <td className="px-2 py-2">
                      <CellInput label="SKU" value={row.sku} disabled={!canEdit} maxLength={120} onChange={v => patchRow(index, { sku: v })} />
                    </td>
                    <td className="px-2 py-2">
                      <CellInput label="Price" type="number" value={row.price} disabled={!canEdit} onChange={v => patchRow(index, { price: v })} />
                    </td>
                    <td className="px-2 py-2">
                      <CellInput label="Sale price" type="number" value={row.salePrice} disabled={!canEdit} onChange={v => patchRow(index, { salePrice: v })} />
                    </td>
                    {tracksStock && (
                      <td className="px-2 py-2">
                        {row.id ? (
                          <span className="text-slate-700" title="Change it with a stock adjustment">
                            {row.stockNow === null ? 'Not counted' : row.stockNow}
                          </span>
                        ) : (
                          <CellInput label="Opening stock" type="number" step="1" placeholder="—" value={row.stock} disabled={!canEdit} onChange={v => patchRow(index, { stock: v })} />
                        )}
                      </td>
                    )}
                    {tracksStock && (
                      <td className="px-2 py-2">
                        <CellInput label="Low-stock alert" type="number" step="1" placeholder="Default" value={row.lowStock} disabled={!canEdit} onChange={v => patchRow(index, { lowStock: v })} />
                      </td>
                    )}
                    <td className="px-4 py-2">
                      <Toggle checked={row.available} disabled={!canEdit} onChange={v => patchRow(index, { available: v })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tracksStock && rows.some(r => r.id) && (
            <p className="px-4 py-2 text-xs text-slate-500 border-t border-surface-200">
              Stock counts of existing variants change from the Stock tab, so saving here can never overwrite units sold in the meantime.
            </p>
          )}
        </Card>
      )}

      {canEdit && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {hadVariants ? (
            <Button variant="ghost" icon={<Trash2 size={15} />} onClick={() => setConfirmClear(true)} disabled={saving}>
              Remove all options &amp; variants
            </Button>
          ) : <span />}
          <Button variant="primary" loading={saving} disabled={!dirty} onClick={save}>Save options &amp; variants</Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          setConfirmClear(false);
          setOptions([]);
          setRows([]);
          memory.current = new Map();
          setError('');
          void (async () => {
            setSaving(true);
            try {
              const saved = await saveVariants(productId, { options: [], variants: [] });
              setDirty(false);
              onSaved(saved);
              success('Variants removed.');
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Could not remove variants.');
            }
            setSaving(false);
          })();
        }}
        title="Remove all options and variants?"
        description="The product goes back to a single price and stock count. Past orders keep the variant details they were placed with."
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  );
}

// A value chip whose label can be edited in place; the change is applied on blur / Enter.
function ValueChip({ label, disabled, onRename, onRemove }: {
  label: string; disabled: boolean; onRename: (label: string) => boolean; onRemove: () => void;
}) {
  const [draft, setDraft] = useState(label);
  const commit = () => {
    if (!onRename(draft)) setDraft(label);
  };
  return (
    <span className="inline-flex items-center rounded-full border border-surface-200 bg-surface-50 pl-3 pr-1 h-8">
      <input
        aria-label={`Value ${label}`}
        value={draft}
        disabled={disabled}
        size={Math.max(3, draft.length)}
        maxLength={80}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
        className="bg-transparent text-xs font-medium text-slate-700 outline-none min-w-0"
      />
      {!disabled && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
          className="ml-1 h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}

// Type a value and press Enter or comma (several at once with commas: "S, M, L").
function ValueAdder({ onAdd }: { onAdd: (raw: string) => void }) {
  const [draft, setDraft] = useState('');
  const flush = () => {
    if (draft.trim()) onAdd(draft);
    setDraft('');
  };
  return (
    <input
      aria-label="Add a value"
      placeholder="Add value…"
      value={draft}
      maxLength={200}
      onChange={e => {
        if (e.target.value.includes(',')) {
          onAdd(e.target.value);
          setDraft('');
        } else {
          setDraft(e.target.value);
        }
      }}
      onBlur={flush}
      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); flush(); } }}
      className="h-8 w-32 rounded-full border border-dashed border-surface-200 bg-white px-3 text-xs outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400"
    />
  );
}

function CellInput({ label, value, onChange, type = 'text', disabled, ...rest }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'>) {
  return (
    <input
      aria-label={label}
      type={type}
      min={type === 'number' ? '0' : undefined}
      step={type === 'number' ? (rest.step ?? '0.01') : undefined}
      value={value}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      className="w-24 h-8 rounded-btn border border-surface-200 bg-white px-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400 disabled:opacity-50 disabled:bg-surface-50"
      {...rest}
    />
  );
}
