'use client';
import { formatMoney } from '@/lib/utils';

import { useEffect, useMemo, useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { PublicProduct } from '@/lib/types/store';
import { basePrice, buildSelection, type LineSelection } from '@/lib/utils/cart-lines';

interface ProductOptionsDialogProps {
  /** null = closed. */
  product: PublicProduct | null;
  currencySuffix: string;
  /** The template's brand colour, used for the selected state. */
  accent?: string;
  onClose: () => void;
  onConfirm: (selection: LineSelection, qty: number) => void;
}

const norm = (s: string) => s.trim().toLowerCase();

// "What would you like?" — the one place a customer picks a variant (Size, Color…) and add-ons
// (Extras…) before something goes in the cart. Shared by every template that supports options, so
// the rules (required groups, pick limits, sold-out combinations) are identical everywhere.
export function ProductOptionsDialog({ product, currencySuffix, accent = '#111827', onClose, onConfirm }: ProductOptionsDialogProps) {
  const [chosen, setChosen] = useState<string[]>([]);       // one label per option
  const [addons, setAddons] = useState<Set<string>>(new Set());
  const [qty, setQty] = useState(1);

  const options = useMemo(() => product?.options ?? [], [product]);
  const variants = useMemo(() => product?.variants ?? [], [product]);
  const groups = useMemo(() => product?.addonGroups ?? [], [product]);
  const hasVariants = product?.hasVariants === true && variants.length > 0;

  // Start from something buyable: the first in-stock variant, and each group's pre-ticked choices.
  useEffect(() => {
    if (!product) return;
    const first = variants.find(v => v.inStock && v.available) ?? variants[0];
    setChosen(hasVariants && first ? first.selection : options.map(() => ''));
    setAddons(new Set(groups.flatMap(g => g.options.filter(o => o.preselected && o.available).map(o => o.id))));
    setQty(1);
  }, [product, options, variants, groups, hasVariants]);

  if (!product) return null;

  const variant = hasVariants
    ? variants.find(v => v.selection.length === chosen.length && v.selection.every((label, i) => norm(label) === norm(chosen[i] ?? '')))
    : undefined;
  const variantBuyable = !hasVariants || (!!variant && variant.inStock && variant.available);

  // A value is offered as long as SOME in-stock variant has it together with what's chosen for the
  // other options; otherwise picking it would land on a sold-out or non-existent combination.
  function valueAvailable(optionIndex: number, label: string): boolean {
    return variants.some(v =>
      v.inStock && v.available
      && norm(v.selection[optionIndex] ?? '') === norm(label)
      && v.selection.every((l, i) => i === optionIndex || !chosen[i] || norm(l) === norm(chosen[i])));
  }

  function pickValue(optionIndex: number, label: string) {
    const next = [...chosen];
    next[optionIndex] = label;
    // If that leaves an impossible combination, move the other options to the nearest buyable one.
    const fits = variants.some(v => v.inStock && v.available && v.selection.every((l, i) => norm(l) === norm(next[i] ?? '')));
    if (!fits) {
      const alt = variants.find(v => v.inStock && v.available && norm(v.selection[optionIndex] ?? '') === norm(label));
      if (alt) return setChosen(alt.selection);
    }
    setChosen(next);
  }

  function toggleAddon(groupId: string, optionId: string) {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    const next = new Set(addons);
    const inGroup = group.options.map(o => o.id);
    if (next.has(optionId)) {
      next.delete(optionId);
    } else if (group.maxSelect === 1) {
      inGroup.forEach(id => next.delete(id)); // pick-one behaves like a radio
      next.add(optionId);
    } else if (inGroup.filter(id => next.has(id)).length < group.maxSelect) {
      next.add(optionId);
    }
    setAddons(next);
  }

  // Validation, per group.
  const groupProblems = groups.map(g => {
    const n = g.options.filter(o => addons.has(o.id)).length;
    return n < g.minSelect ? `Choose ${g.minSelect === 1 ? 'one' : `at least ${g.minSelect}`} in “${g.name}”` : null;
  });
  const firstProblem = groupProblems.find(Boolean) ?? null;

  const selection = buildSelection(product, variant?.id ?? null, [...addons]);
  const unit = selection?.unitPrice ?? basePrice(product);
  const canAdd = variantBuyable && !firstProblem && !!selection;

  return (
    <Modal open onClose={onClose} title={product.name} size="md">
      <div className="flex flex-col gap-5">
        {product.description && <p className="text-sm text-slate-600">{product.description}</p>}

        {/* Variant options (Size, Color, …) */}
        {hasVariants && options.map((option, oi) => (
          <fieldset key={option.id}>
            <legend className="text-sm font-semibold text-slate-900 mb-2">{option.name}</legend>
            <div className="flex flex-wrap gap-2">
              {option.values.map(value => {
                const selected = norm(chosen[oi] ?? '') === norm(value.label);
                const available = valueAvailable(oi, value.label);
                return (
                  <button
                    key={value.id}
                    type="button"
                    aria-pressed={selected}
                    disabled={!available && !selected}
                    onClick={() => pickValue(oi, value.label)}
                    className="min-h-[44px] min-w-[44px] px-4 rounded-lg border-2 text-sm font-semibold transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                    style={{
                      borderColor: selected ? accent : '#E5E7EB',
                      background: selected ? accent : '#fff',
                      color: selected ? '#fff' : '#111827',
                    }}
                  >
                    {value.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
        {hasVariants && !variantBuyable && (
          <p role="status" className="text-sm font-medium text-red-600">
            {variant ? 'This combination is sold out.' : 'This combination isn’t available.'}
          </p>
        )}

        {/* Add-on groups (Extras, …) */}
        {groups.map((group, gi) => {
          const many = group.maxSelect > 1;
          const count = group.options.filter(o => addons.has(o.id)).length;
          return (
            <fieldset key={group.id}>
              <legend className="flex items-baseline gap-2 mb-2">
                <span className="text-sm font-semibold text-slate-900">{group.name}</span>
                <span className="text-xs text-slate-500">
                  {group.minSelect >= 1 ? 'Required' : 'Optional'}
                  {many ? ` · up to ${group.maxSelect}` : ''}
                </span>
              </legend>
              <div className="flex flex-col gap-2">
                {group.options.map(option => {
                  const selected = addons.has(option.id);
                  const capped = many && !selected && count >= group.maxSelect;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role={many ? 'checkbox' : 'radio'}
                      aria-checked={selected}
                      disabled={!option.available || capped}
                      onClick={() => toggleAddon(group.id, option.id)}
                      className="flex items-center justify-between gap-3 min-h-[44px] px-3 rounded-lg border-2 text-left text-sm transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                      style={{ borderColor: selected ? accent : '#E5E7EB', background: selected ? `${accent}14` : '#fff' }}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 flex items-center justify-center border-2 shrink-0 ${many ? 'rounded' : 'rounded-full'}`}
                          style={{ borderColor: selected ? accent : '#D1D5DB', background: selected ? accent : '#fff' }}
                          aria-hidden="true"
                        >
                          {selected && <Check size={12} color="#fff" strokeWidth={3} />}
                        </span>
                        <span className="font-medium text-slate-800 truncate">
                          {option.name}
                          {!option.available && <span className="text-slate-400"> · unavailable</span>}
                        </span>
                      </span>
                      <span className="text-slate-500 tabular-nums shrink-0">
                        {option.priceDelta > 0 ? `+${formatMoney(option.priceDelta, currencySuffix)}` : 'Free'}
                      </span>
                    </button>
                  );
                })}
              </div>
              {groupProblems[gi] && count < group.minSelect && (
                <p className="mt-1.5 text-xs text-slate-500">{groupProblems[gi]}</p>
              )}
            </fieldset>
          );
        })}

        {/* Quantity + add */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-surface-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-11 h-11 rounded-full border border-surface-200 flex items-center justify-center cursor-pointer hover:bg-surface-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              <Minus size={16} />
            </button>
            <span className="w-6 text-center font-semibold tabular-nums" aria-live="polite">{qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQty(q => Math.min(99, q + 1))}
              className="w-11 h-11 rounded-full border border-surface-200 flex items-center justify-center cursor-pointer hover:bg-surface-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              <Plus size={16} />
            </button>
          </div>
          <Button
            variant="primary"
            disabled={!canAdd}
            onClick={() => selection && onConfirm(selection, qty)}
            style={canAdd ? { background: accent, borderColor: accent } : undefined}
          >
            Add · {formatMoney((unit * qty), currencySuffix)}
          </Button>
        </div>
        {firstProblem && variantBuyable && <p className="text-xs text-slate-500 -mt-3">{firstProblem}</p>}
      </div>
    </Modal>
  );
}
