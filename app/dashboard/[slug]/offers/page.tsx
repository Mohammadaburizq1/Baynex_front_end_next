'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { SectionAccessGate } from '@/components/dashboard/SectionAccessGate';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Input, Select, Toggle } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/contexts/StoreContext';
import { formatCurrency } from '@/lib/utils';
import {
  getOffers, createOffer, updateOffer, deleteOffer,
  type ApiOffer, type OfferFormData, type DiscountType,
} from '@/lib/api/offers';

// ── Form state ─────────────────────────────────────────────────────────────────

interface OfferForm {
  code: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxUses: string;
  startsAt: string;
  expiresAt: string;
  active: boolean;
}

const EMPTY_FORM: OfferForm = {
  code: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minOrderAmount: '',
  maxUses: '',
  startsAt: '',
  expiresAt: '',
  active: true,
};

function offerToForm(o: ApiOffer): OfferForm {
  return {
    code: o.code,
    discountType: o.discountType,
    discountValue: String(o.discountValue),
    minOrderAmount: o.minOrderAmount != null ? String(o.minOrderAmount) : '',
    maxUses: o.maxUses != null ? String(o.maxUses) : '',
    startsAt: o.startsAt ? o.startsAt.slice(0, 10) : '',
    expiresAt: o.expiresAt ? o.expiresAt.slice(0, 10) : '',
    active: o.active,
  };
}

// dates come from plain <input type="date"> (no timezone) — pin start-of-day / end-of-day in
// UTC so a code is inclusive of the whole selected day regardless of the merchant's own timezone.
function formToPayload(form: OfferForm): OfferFormData {
  return {
    code: form.code.trim(),
    discountType: form.discountType,
    discountValue: Number(form.discountValue) || 0,
    minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
    maxUses: form.maxUses ? Number(form.maxUses) : undefined,
    startsAt: form.startsAt ? `${form.startsAt}T00:00:00Z` : undefined,
    expiresAt: form.expiresAt ? `${form.expiresAt}T23:59:59Z` : undefined,
    active: form.active,
  };
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function OffersPage() {
  const { store, permissions } = useStore();
  const { success, error: toastError } = useToast();
  const canEdit = permissions.OFFERS === 'EDIT';

  const [offers, setOffers] = useState<ApiOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOffers() {
      try {
        const realStoreId = store.id.startsWith('local-') ? undefined : store.id;
        setOffers(await getOffers(realStoreId));
      } catch {
        toastError('Failed to load discount codes.');
      }
      setLoading(false);
    }
    fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.id]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<ApiOffer | null>(null);
  const [form, setForm] = useState<OfferForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<ApiOffer | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openAdd() {
    setEditingOffer(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(o: ApiOffer) {
    setEditingOffer(o);
    setForm(offerToForm(o));
    setFormError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingOffer(null);
  }

  function handleFieldChange<K extends keyof OfferForm>(field: K, value: OfferForm[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
    setFormError('');
  }

  const discountTypeOptions = useMemo(
    () => [
      { value: 'PERCENTAGE', label: 'Percentage (%)' },
      { value: 'FIXED_AMOUNT', label: 'Fixed amount' },
    ],
    [],
  );

  async function handleSave() {
    if (!form.code.trim()) {
      setFormError('Discount code is required.');
      return;
    }
    const value = Number(form.discountValue);
    if (!form.discountValue || isNaN(value) || value <= 0) {
      setFormError('Enter a valid discount value.');
      return;
    }
    if (form.discountType === 'PERCENTAGE' && value > 100) {
      setFormError('Percentage discount cannot exceed 100.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const payload = formToPayload(form);
      if (editingOffer) {
        const updated = await updateOffer(editingOffer.id, store.id, payload);
        setOffers(prev => prev.map(o => o.id === editingOffer.id ? updated : o));
        success('Discount code updated.');
      } else {
        const created = await createOffer(store.id, payload);
        setOffers(prev => [created, ...prev]);
        success('Discount code created.');
      }
      closeModal();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to save discount code.');
    }

    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteOffer(deleteTarget.id);
      setOffers(prev => prev.filter(o => o.id !== deleteTarget.id));
      success(`"${deleteTarget.code}" has been deleted.`);
      setDeleteTarget(null);
    } catch {
      toastError('Failed to delete discount code. Please try again.');
    }
    setDeleting(false);
  }

  return (
    <SectionAccessGate section="OFFERS" pageTitle="Offers">
      <Header title="Offers" subtitle="Create discount codes customers can apply at checkout" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {canEdit && (
          <div className="flex justify-end">
            <Button variant="primary" icon={<Plus size={16} />} onClick={openAdd}>
              New Code
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
          </div>
        ) : offers.length === 0 ? (
          <EmptyState
            icon={<Tag size={28} />}
            title="No discount codes yet"
            description="Create a code like SAVE10 to offer customers a percentage or fixed discount at checkout."
            action={canEdit ? { label: 'New Code', onClick: openAdd } : undefined}
          />
        ) : (
          <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200 text-left text-xs text-slate-500 uppercase tracking-wide">
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Discount</th>
                    <th className="px-4 py-3 font-medium">Min. order</th>
                    <th className="px-4 py-3 font-medium">Uses</th>
                    <th className="px-4 py-3 font-medium">Expires</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    {canEdit && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {offers.map(o => (
                    <tr key={o.id} className="border-b border-surface-100 last:border-0">
                      <td className="px-4 py-3 font-semibold text-slate-900 tabular-nums">{o.code}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {o.discountType === 'PERCENTAGE' ? `${o.discountValue}%` : formatCurrency(o.discountValue, store.currency)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {o.minOrderAmount != null ? formatCurrency(o.minOrderAmount, store.currency) : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 tabular-nums">
                        {o.timesUsed}{o.maxUses != null ? ` / ${o.maxUses}` : ''}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {o.expiresAt ? new Date(o.expiresAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {o.active ? (
                          <StatusBadge colorClass="bg-emerald-100 text-emerald-700" label="Active" />
                        ) : (
                          <StatusBadge colorClass="bg-surface-200 text-slate-600" label="Inactive" />
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              aria-label={`Edit ${o.code}`}
                              onClick={() => openEdit(o)}
                              className="p-1.5 rounded-md text-slate-500 hover:bg-surface-100 hover:text-slate-700 transition-colors duration-150 cursor-pointer"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              aria-label={`Delete ${o.code}`}
                              onClick={() => setDeleteTarget(o)}
                              className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      {/* ── Add / Edit Modal ──────────────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingOffer ? 'Edit Discount Code' : 'New Discount Code'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-btn px-3 py-2">
              {formError}
            </p>
          )}

          <Input
            label="Code"
            required
            placeholder="e.g. SAVE10"
            value={form.code}
            onChange={e => handleFieldChange('code', e.target.value.toUpperCase())}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Discount type"
              options={discountTypeOptions}
              value={form.discountType}
              onChange={e => handleFieldChange('discountType', e.target.value as DiscountType)}
            />
            <Input
              label={form.discountType === 'PERCENTAGE' ? 'Discount (%)' : 'Discount amount'}
              required
              type="number"
              min="0"
              max={form.discountType === 'PERCENTAGE' ? '100' : undefined}
              step="0.01"
              placeholder="0"
              value={form.discountValue}
              onChange={e => handleFieldChange('discountValue', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum order (optional)"
              type="number"
              min="0"
              step="0.01"
              placeholder="No minimum"
              value={form.minOrderAmount}
              onChange={e => handleFieldChange('minOrderAmount', e.target.value)}
            />
            <Input
              label="Max uses (optional)"
              type="number"
              min="1"
              step="1"
              placeholder="Unlimited"
              value={form.maxUses}
              onChange={e => handleFieldChange('maxUses', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Starts (optional)"
              type="date"
              value={form.startsAt}
              onChange={e => handleFieldChange('startsAt', e.target.value)}
            />
            <Input
              label="Expires (optional)"
              type="date"
              value={form.expiresAt}
              onChange={e => handleFieldChange('expiresAt', e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-slate-700">Active</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Inactive codes are rejected at checkout even if not expired.
              </p>
            </div>
            <Toggle checked={form.active} onChange={v => handleFieldChange('active', v)} />
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Dialog ─────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Discount Code"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.code}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </SectionAccessGate>
  );
}
