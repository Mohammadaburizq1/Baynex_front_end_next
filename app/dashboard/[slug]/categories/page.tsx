'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { SectionAccessGate } from '@/components/dashboard/SectionAccessGate';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Textarea, Toggle } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/contexts/StoreContext';
import { loadStoreCategories } from '@/lib/utils/store-scoped-data';
import { descendantIds, flattenCategories } from '@/lib/utils/category-tree';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type ApiCategory,
} from '@/lib/api/categories';

interface CategoryForm {
  name: string;
  parentId: string;
  description: string;
  sortOrder: string;
  active: boolean;
}

const EMPTY_FORM: CategoryForm = { name: '', parentId: '', description: '', sortOrder: '0', active: true };

export default function CategoriesPage() {
  return (
    <SectionAccessGate section="PRODUCTS" pageTitle="Categories">
      <CategoriesContent />
    </SectionAccessGate>
  );
}

function CategoriesContent() {
  const { store, businessType, permissions } = useStore();
  const { success, error: toastError } = useToast();
  const canEdit = permissions.PRODUCTS === 'EDIT';
  const synced = !store.id.startsWith('local-');

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiCategory | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ApiCategory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    if (!synced) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setCategories(await getCategories(store.id));
    } catch {
      toastError('Could not load categories.');
    }
    // Counts are a nicety — a failure here must not hide the categories themselves.
    try {
      const { getProducts } = await import('@/lib/api/products');
      const counts: Record<string, number> = {};
      for (const p of await getProducts(store.id)) {
        if (p.categoryId) counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1;
      }
      setProductCounts(counts);
    } catch { /* ignore */ }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.id, synced]);

  useEffect(() => { void load(); }, [load]);

  const rows = useMemo(() => flattenCategories(categories), [categories]);

  const suggestions = useMemo(() => {
    const have = new Set(categories.map(c => c.name.trim().toLowerCase()));
    return loadStoreCategories(businessType)
      .map(c => c.name)
      .filter(name => !have.has(name.trim().toLowerCase()));
  }, [categories, businessType]);

  const parentOptions = useMemo(() => {
    const blocked = editing ? descendantIds(categories, editing.id) : new Set<string>();
    return rows
      .filter(r => !blocked.has(r.category.id))
      .map(r => ({ value: r.category.id, label: `${'— '.repeat(r.depth)}${r.category.name}` }));
  }, [rows, categories, editing]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(c: ApiCategory) {
    setEditing(c);
    setForm({
      name: c.name,
      parentId: c.parentId ?? '',
      description: c.description ?? '',
      sortOrder: String(c.sortOrder),
      active: c.active,
    });
    setFormError('');
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setFormError('Category name is required.');
      return;
    }
    const sortOrder = Number(form.sortOrder);
    if (!Number.isInteger(sortOrder)) {
      setFormError('Display order must be a whole number.');
      return;
    }
    setSaving(true);
    setFormError('');
    const input = {
      name: form.name,
      parentId: form.parentId || null,
      description: form.description,
      sortOrder,
      active: form.active,
    };
    try {
      if (editing) {
        const updated = await updateCategory(editing, store.id, input);
        setCategories(prev => prev.map(c => (c.id === updated.id ? updated : c)));
        success('Category updated.');
      } else {
        const created = await createCategory(store.id, input);
        setCategories(prev => [...prev, created]);
        success('Category added.');
      }
      setModalOpen(false);
      setEditing(null);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to save category.');
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      // The backend detaches subcategories to the top level and un-categorizes products — mirror
      // that locally instead of refetching.
      setCategories(prev => prev
        .filter(c => c.id !== deleteTarget.id)
        .map(c => (c.parentId === deleteTarget.id ? { ...c, parentId: null } : c)));
      success(`"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'Failed to delete category.');
    }
    setDeleting(false);
  }

  async function addSuggestions(names: string[]) {
    setSeeding(true);
    let added = 0;
    for (const name of names) {
      try {
        const created = await createCategory(store.id, { name });
        setCategories(prev => [...prev, created]);
        added++;
      } catch {
        toastError(`Could not add "${name}".`);
        break;
      }
    }
    if (added > 0) success(added === 1 ? 'Category added.' : `${added} categories added.`);
    setSeeding(false);
  }

  const deleteCount = deleteTarget ? productCounts[deleteTarget.id] ?? 0 : 0;
  const deleteChildren = deleteTarget ? categories.filter(c => c.parentId === deleteTarget.id).length : 0;

  return (
    <>
      <Header title="Categories" subtitle="Organise your catalogue so customers can browse it" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {!synced ? (
          <EmptyState
            icon={<FolderTree size={28} />}
            title="Your store isn't synced yet"
            description="Categories are stored on your account. Finish setting up your store, then come back."
          />
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {categories.length} {categories.length === 1 ? 'category' : 'categories'}
              </p>
              {canEdit && (
                <Button variant="primary" icon={<Plus size={16} />} onClick={openAdd}>
                  Add category
                </Button>
              )}
            </div>

            {canEdit && suggestions.length > 0 && (
              <Card className="p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Suggested for your store</p>
                    <p className="text-xs text-slate-500">One click to add the categories most stores like yours start with.</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={seeding}
                    onClick={() => addSuggestions(suggestions)}
                  >
                    Add all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(name => (
                    <button
                      key={name}
                      type="button"
                      disabled={seeding}
                      onClick={() => addSuggestions([name])}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-surface-200 bg-white text-xs font-medium text-slate-600 hover:border-primary-300 hover:text-primary-700 transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                    >
                      <Plus size={12} />
                      {name}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
              </div>
            ) : rows.length === 0 ? (
              <EmptyState
                icon={<FolderTree size={28} />}
                title="No categories yet"
                description="Create categories such as “Drinks” or “Dresses” and assign products to them."
                action={canEdit ? { label: 'Add category', onClick: openAdd } : undefined}
              />
            ) : (
              <Card padding="none" className="divide-y divide-surface-200 overflow-hidden">
                {rows.map(({ category: c, depth }) => (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1" style={{ paddingLeft: depth * 20 }}>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                        {!c.active && <Badge variant="default">Hidden</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {productCounts[c.id] ?? 0} {(productCounts[c.id] ?? 0) === 1 ? 'product' : 'products'}
                      </p>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          aria-label={`Edit ${c.name}`}
                          onClick={() => openEdit(c)}
                          className="h-8 w-8 flex items-center justify-center rounded-md text-slate-600 bg-surface-100 hover:bg-surface-200 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          aria-label={`Delete ${c.name}`}
                          onClick={() => setDeleteTarget(c)}
                          className="h-8 w-8 flex items-center justify-center rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </Card>
            )}
          </>
        )}
      </main>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit category' : 'Add category'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-btn px-3 py-2">{formError}</p>
          )}
          <Input
            label="Name"
            required
            placeholder="e.g. Drinks"
            value={form.name}
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormError(''); }}
          />
          <Select
            label="Parent category"
            options={parentOptions}
            placeholder="None (top level)"
            value={form.parentId}
            onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
          />
          <Textarea
            label="Description"
            placeholder="Optional"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <Input
            label="Display order"
            type="number"
            step="1"
            hint="Lower numbers appear first."
            value={form.sortOrder}
            onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
          />
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-slate-700">Visible on storefront</p>
              <p className="text-xs text-slate-500 mt-0.5">Hidden categories stay in your dashboard only.</p>
            </div>
            <Toggle checked={form.active} onChange={v => setForm(f => ({ ...f, active: v }))} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete category"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}"?${deleteCount > 0 ? ` Its ${deleteCount} ${deleteCount === 1 ? 'product' : 'products'} will become uncategorised.` : ''}${deleteChildren > 0 ? ` Its ${deleteChildren === 1 ? 'subcategory moves' : 'subcategories move'} to the top level.` : ''}`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </>
  );
}
