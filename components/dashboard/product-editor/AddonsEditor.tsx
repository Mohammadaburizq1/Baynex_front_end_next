'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select, Toggle } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { saveModifierGroups, type ApiModifierGroup } from '@/lib/api/products';

const MAX_GROUPS = 10;
const MAX_OPTIONS = 30;

interface OptionState { id?: string; name: string; price: string; preselected: boolean; available: boolean }
interface GroupState {
  id?: string;
  name: string;
  /** How many the customer may pick: 'ONE' | 'MANY'. */
  choice: 'ONE' | 'MANY';
  required: boolean;
  /** Upper limit when choice is MANY. */
  max: string;
  options: OptionState[];
}

interface AddonsEditorProps {
  productId: string;
  initial: ApiModifierGroup[];
  canEdit: boolean;
  onSaved: (groups: ApiModifierGroup[]) => void;
}

const norm = (s: string) => s.trim().toLowerCase();

function fromApi(groups: ApiModifierGroup[]): GroupState[] {
  return groups.map(g => ({
    id: g.id,
    name: g.name,
    choice: g.maxSelect > 1 ? 'MANY' : 'ONE',
    required: g.minSelect >= 1,
    max: String(Math.max(1, g.maxSelect)),
    options: g.options.map(o => ({
      id: o.id,
      name: o.name,
      price: String(o.priceDelta),
      preselected: o.preselected,
      available: o.available,
    })),
  }));
}

const blankOption = (): OptionState => ({ name: '', price: '0', preselected: false, available: true });

// Add-ons a customer picks when ordering: "Size" (choose one, required), "Extras" (choose up to
// 3, optional). Each choice can add to the price. Unlike variants they carry no stock or SKU.
export function AddonsEditor({ productId, initial, canEdit, onSaved }: AddonsEditorProps) {
  const { success, error: toastError } = useToast();
  const [groups, setGroups] = useState<GroupState[]>(() => fromApi(initial));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function change(next: GroupState[]) {
    setGroups(next);
    setDirty(true);
    setError('');
  }

  const patchGroup = (gi: number, patch: Partial<GroupState>) =>
    change(groups.map((g, i) => (i === gi ? { ...g, ...patch } : g)));

  const patchOption = (gi: number, oi: number, patch: Partial<OptionState>) =>
    change(groups.map((g, i) => (i === gi ? { ...g, options: g.options.map((o, k) => (k === oi ? { ...o, ...patch } : o)) } : g)));

  function validate(): string | null {
    const names = new Set<string>();
    for (const g of groups) {
      if (!g.name.trim()) return 'Give every add-on group a name (for example Extras).';
      if (names.has(norm(g.name))) return `Two groups are both called "${g.name.trim()}".`;
      names.add(norm(g.name));
      if (g.options.length === 0) return `Add at least one choice to "${g.name.trim()}".`;
      const optionNames = new Set<string>();
      for (const o of g.options) {
        if (!o.name.trim()) return `Every choice in "${g.name.trim()}" needs a name.`;
        if (optionNames.has(norm(o.name))) return `"${g.name.trim()}" lists "${o.name.trim()}" more than once.`;
        optionNames.add(norm(o.name));
        const price = Number(o.price);
        if (o.price.trim() === '' || Number.isNaN(price) || price < 0) return `Enter a price (0 or more) for "${o.name.trim()}".`;
      }
      if (g.choice === 'MANY') {
        const max = Number(g.max);
        if (!Number.isInteger(max) || max < 2) return `"${g.name.trim()}": enter how many choices can be picked (2 or more).`;
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
    try {
      const saved = await saveModifierGroups(
        productId,
        groups.map(g => ({
          id: g.id,
          name: g.name.trim(),
          minSelect: g.required ? 1 : 0,
          maxSelect: g.choice === 'ONE' ? 1 : Math.min(Number(g.max), g.options.length),
          options: g.options.map(o => ({
            id: o.id,
            name: o.name.trim(),
            priceDelta: Number(o.price),
            preselected: o.preselected,
            available: o.available,
          })),
        })),
      );
      setGroups(fromApi(saved));
      setDirty(false);
      onSaved(saved);
      success('Add-ons saved.');
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'Could not save add-ons.');
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-btn px-3 py-2">{error}</p>
      )}

      {groups.length === 0 && (
        <div className="rounded-xl border border-dashed border-surface-200 py-10 px-4 text-center text-slate-500">
          <p className="text-sm font-medium text-slate-700">No add-ons yet</p>
          <p className="text-xs mt-1">
            Let customers customise this item — extra toppings, a size upgrade, gift wrapping. Choices can add to the price.
          </p>
        </div>
      )}

      {groups.map((group, gi) => (
        <Card key={group.id ?? `new-${gi}`} className="p-4 space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Group name"
                placeholder="e.g. Extras"
                maxLength={80}
                disabled={!canEdit}
                value={group.name}
                onChange={e => patchGroup(gi, { name: e.target.value })}
              />
            </div>
            {canEdit && (
              <button
                type="button"
                aria-label={`Remove group ${group.name || gi + 1}`}
                onClick={() => change(groups.filter((_, i) => i !== gi))}
                className="h-9 w-9 flex items-center justify-center rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <Select
              label="Customer can pick"
              disabled={!canEdit}
              options={[{ value: 'ONE', label: 'One choice' }, { value: 'MANY', label: 'Several choices' }]}
              value={group.choice}
              onChange={e => patchGroup(gi, { choice: e.target.value as 'ONE' | 'MANY', max: group.max === '1' ? '2' : group.max })}
            />
            {group.choice === 'MANY' ? (
              <Input
                label="Up to"
                type="number"
                min="2"
                step="1"
                disabled={!canEdit}
                value={group.max}
                onChange={e => patchGroup(gi, { max: e.target.value })}
              />
            ) : <span className="hidden sm:block" />}
            <div className="flex items-center justify-between sm:justify-start gap-3 h-9">
              <span className="text-sm font-medium text-slate-700">Required</span>
              <Toggle checked={group.required} disabled={!canEdit} onChange={v => patchGroup(gi, { required: v })} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="hidden sm:grid grid-cols-[1fr_7rem_5.5rem_5.5rem_2rem] gap-2 px-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <span>Choice</span><span>Adds to price</span><span>Pre-ticked</span><span>Available</span><span />
            </div>
            {group.options.map((option, oi) => (
              <div key={option.id ?? `o-${oi}`} className="grid grid-cols-2 sm:grid-cols-[1fr_7rem_5.5rem_5.5rem_2rem] gap-2 items-center">
                <input
                  aria-label="Choice name"
                  placeholder="e.g. Extra cheese"
                  maxLength={80}
                  disabled={!canEdit}
                  value={option.name}
                  onChange={e => patchOption(gi, oi, { name: e.target.value })}
                  className="col-span-2 sm:col-span-1 h-9 rounded-btn border border-surface-200 bg-white px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400 disabled:opacity-50"
                />
                <input
                  aria-label="Price added"
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={!canEdit}
                  value={option.price}
                  onChange={e => patchOption(gi, oi, { price: e.target.value })}
                  className="h-9 rounded-btn border border-surface-200 bg-white px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400 disabled:opacity-50"
                />
                <div className="flex items-center gap-2 sm:justify-start">
                  <Toggle checked={option.preselected} disabled={!canEdit} onChange={v => patchOption(gi, oi, { preselected: v })} />
                </div>
                <div className="flex items-center gap-2 sm:justify-start">
                  <Toggle checked={option.available} disabled={!canEdit} onChange={v => patchOption(gi, oi, { available: v })} />
                </div>
                {canEdit && (
                  <button
                    type="button"
                    aria-label={`Remove ${option.name || 'choice'}`}
                    onClick={() => patchGroup(gi, { options: group.options.filter((_, k) => k !== oi) })}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            {canEdit && group.options.length < MAX_OPTIONS && (
              <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => patchGroup(gi, { options: [...group.options, blankOption()] })}>
                Add a choice
              </Button>
            )}
          </div>
        </Card>
      ))}

      {canEdit && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {groups.length < MAX_GROUPS ? (
            <Button
              variant="secondary"
              icon={<Plus size={15} />}
              onClick={() => change([...groups, { name: '', choice: 'ONE', required: false, max: '1', options: [blankOption()] }])}
            >
              Add a group
            </Button>
          ) : <span />}
          <Button variant="primary" loading={saving} disabled={!dirty} onClick={save}>Save add-ons</Button>
        </div>
      )}
    </div>
  );
}
