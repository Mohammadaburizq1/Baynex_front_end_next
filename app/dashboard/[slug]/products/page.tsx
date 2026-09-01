'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, ShoppingBag } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Input, Select, Textarea, Toggle } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/contexts/StoreContext';
import { loadStoreCategories } from '@/lib/utils/store-scoped-data';
import {
  formatCurrency,
  PRODUCT_STATUS_MAP,
  PRODUCT_LABEL,
  BUSINESS_TYPES_WITH_STOCK,
} from '@/lib/utils';
import type { Product, ProductStatus } from '@/lib/types';
import { apiProductToProduct, type ApiProduct } from '@/lib/api/products';

// ── Form state ─────────────────────────────────────────────────────────────────

interface ProductForm {
  name: string;
  description: string;
  categoryId: string;
  price: string;
  comparePrice: string;
  stock: string;
  status: ProductStatus;
  featured: boolean;
}

const EMPTY_FORM: ProductForm = {
  name: '',
  description: '',
  categoryId: '',
  price: '',
  comparePrice: '',
  stock: '',
  status: 'active',
  featured: false,
};

function productToForm(p: Product): ProductForm {
  return {
    name: p.name,
    description: p.description,
    categoryId: p.categoryId,
    price: String(p.price),
    comparePrice: p.comparePrice ? String(p.comparePrice) : '',
    stock: String(p.stock),
    status: p.status,
    featured: p.featured,
  };
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const { store, businessType } = useStore();
  const { success, error: toastError } = useToast();

  const categories = useMemo(
    () => loadStoreCategories(businessType),
    [businessType],
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const token = localStorage.getItem('sl_access_token') ?? localStorage.getItem('authToken');
      if (!token) {
        const { loadStoreProducts } = await import('@/lib/utils/store-scoped-data');
        setProducts(loadStoreProducts(store.slug));
        setLoadingProducts(false);
        return;
      }
      try {
        const { getProducts } = await import('@/lib/api/products');
        // A store that hasn't been synced to the backend yet has a placeholder "local-*" id —
        // only scope the request once we have a real backend store id to scope it to.
        const realStoreId = store.id.startsWith('local-') ? undefined : store.id;
        const apiProducts = await getProducts(realStoreId);
        setProducts(apiProducts.map(apiProductToProduct));
      } catch {
        const { loadStoreProducts } = await import('@/lib/utils/store-scoped-data');
        setProducts(loadStoreProducts(store.slug));
      }
      setLoadingProducts(false);
    }
    fetchProducts();
  }, [store.slug, store.id]);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Derived / filtered list ─────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        !categoryFilter || p.categoryId === categoryFilter || p.category === categoryFilter;
      const matchesStatus =
        !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  // ── Modal helpers ───────────────────────────────────────────────────────────

  function openAdd() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditingProduct(p);
    setForm(productToForm(p));
    setFormError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingProduct(null);
  }

  function handleFieldChange(
    field: keyof ProductForm,
    value: string | boolean | ProductStatus,
  ) {
    setForm(prev => ({ ...prev, [field]: value }));
    setFormError('');
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) {
      setFormError('Enter a valid price.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const { createProduct, updateProduct } = await import('@/lib/api/products');
      const categoryObj = categories.find(c => c.id === form.categoryId);
      const payload: Partial<ApiProduct> = {
        name: form.name.trim(),
        description: form.description,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        // Only send a stock value for verticals that track it at all — for real estate/services
        // this stays undefined, so the backend leaves it null ("not tracked") rather than
        // recording a meaningless 0.
        stock: tracksStock ? (Number(form.stock) || 0) : undefined,
        category: categoryObj?.name ?? form.categoryId,
        categoryId: form.categoryId || undefined,
        status: form.status,
        featured: form.featured,
      };

      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, store.id, payload);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? apiProductToProduct(updated) : p));
        success('Product updated successfully.');
      } else {
        const created = await createProduct(store.id, payload);
        setProducts(prev => [apiProductToProduct(created), ...prev]);
        success('Product added successfully.');
      }
      closeModal();
    } catch {
      setFormError('Failed to save product. Please try again.');
    }

    setSaving(false);
  }

  // ── Delete ───────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { deleteProduct } = await import('@/lib/api/products');
      await deleteProduct(deleteTarget.id);
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
      success(`"${deleteTarget.name}" has been deleted.`);
      setDeleteTarget(null);
    } catch {
      toastError('Failed to delete product. Please try again.');
    }
    setDeleting(false);
  }

  // ── Label based on business type ────────────────────────────────────────────

  const pageLabel = PRODUCT_LABEL[businessType] ?? 'Products';
  const tracksStock = BUSINESS_TYPES_WITH_STOCK[businessType] ?? false;

  // ── Category / status select options ────────────────────────────────────────

  const categoryOptions = categories.map(c => ({
    value: c.id,
    label: c.name,
  }));

  const statusOptions: { value: string; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'out_of_stock', label: 'Out of Stock' },
  ];

  return (
    <>
      <Header
        title={pageLabel}
        subtitle={`Manage your ${pageLabel.toLowerCase()}`}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder={`Search ${pageLabel.toLowerCase()}…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              prefix={<Search size={15} />}
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Select
              options={categoryOptions}
              placeholder="All Categories"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-40"
            />
            <Select
              options={statusOptions}
              placeholder="All Statuses"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-36"
            />
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={openAdd}
            >
              Add Item
            </Button>
          </div>
        </div>

        {/* ── Product grid ─────────────────────────────────────────────────── */}
        {loadingProducts ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={28} />}
            title="No products found"
            description="Try adjusting your filters or add a new product."
            action={{ label: `Add ${pageLabel.slice(0, -1)}`, onClick: openAdd }}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(product => {
              const statusMeta = PRODUCT_STATUS_MAP[product.status];
              return (
                <Card key={product.id} padding="none" className="overflow-hidden flex flex-col">
                  {/* Image */}
                  <div className="relative aspect-square bg-surface-100 flex items-center justify-center overflow-hidden">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag size={32} className="text-slate-300" />
                    )}
                    {product.featured && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="warning">Featured</Badge>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm leading-snug truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{product.category}</p>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-primary-600 text-sm tabular-nums">
                        {formatCurrency(product.price)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-xs text-slate-400 line-through tabular-nums">
                          {formatCurrency(product.comparePrice)}
                        </span>
                      )}
                    </div>

                    {/* Stock — only meaningful for verticals that track it */}
                    {tracksStock && (
                      <div className="flex items-center gap-1.5">
                        {product.stock === 0 ? (
                          <Badge variant="danger">Out of stock</Badge>
                        ) : product.stock < 10 ? (
                          <Badge variant="warning">{product.stock} left</Badge>
                        ) : (
                          <span className="text-xs text-slate-500">
                            {product.stock} in stock
                          </span>
                        )}
                      </div>
                    )}

                    {/* Status */}
                    <StatusBadge
                      colorClass={statusMeta.color}
                      label={statusMeta.label}
                    />

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-2 border-t border-surface-200">
                      <button
                        aria-label={`Edit ${product.name}`}
                        onClick={() => openEdit(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-md text-xs font-medium text-slate-600 bg-surface-100 hover:bg-surface-200 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                      <button
                        aria-label={`Delete ${product.name}`}
                        onClick={() => setDeleteTarget(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-md text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Add / Edit Modal ──────────────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
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
            label="Name"
            required
            placeholder="e.g. Classic Beef Burger"
            value={form.name}
            onChange={e => handleFieldChange('name', e.target.value)}
          />

          <Textarea
            label="Description"
            placeholder="Short description of the item…"
            value={form.description}
            onChange={e => handleFieldChange('description', e.target.value)}
            rows={3}
          />

          <Select
            label="Category"
            options={categoryOptions}
            placeholder="Select a category"
            value={form.categoryId}
            onChange={e => handleFieldChange('categoryId', e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (RM)"
              required
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.price}
              onChange={e => handleFieldChange('price', e.target.value)}
            />
            <Input
              label="Compare-at Price (RM)"
              type="number"
              min="0"
              step="0.01"
              placeholder="Optional"
              value={form.comparePrice}
              onChange={e => handleFieldChange('comparePrice', e.target.value)}
            />
          </div>

          {tracksStock && (
            <Input
              label="Stock"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={form.stock}
              onChange={e => handleFieldChange('stock', e.target.value)}
            />
          )}

          <Select
            label="Status"
            options={statusOptions}
            value={form.status}
            onChange={e =>
              handleFieldChange('status', e.target.value as ProductStatus)
            }
          />

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-slate-700">Featured</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Pin this item to the top of your store.
              </p>
            </div>
            <Toggle
              checked={form.featured}
              onChange={v => handleFieldChange('featured', v)}
            />
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Dialog ─────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </>
  );
}
