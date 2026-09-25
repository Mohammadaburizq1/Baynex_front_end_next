'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { SectionAccessGate } from '@/components/dashboard/SectionAccessGate';
import { AddonsEditor } from '@/components/dashboard/product-editor/AddonsEditor';
import { ImagesEditor } from '@/components/dashboard/product-editor/ImagesEditor';
import { ProductStockPanel } from '@/components/dashboard/product-editor/ProductStockPanel';
import { VariantsEditor } from '@/components/dashboard/product-editor/VariantsEditor';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input, Select, Textarea, Toggle } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/contexts/StoreContext';
import { getCategories, type ApiCategory } from '@/lib/api/categories';
import { getProduct, updateProduct, type ApiProduct } from '@/lib/api/products';
import { BUSINESS_TYPES_WITH_STOCK, cn } from '@/lib/utils';
import { flattenCategories } from '@/lib/utils/category-tree';
import { dashboardPath } from '@/lib/utils/dashboard-path';

type TabId = 'details' | 'pictures' | 'variants' | 'addons' | 'stock';

export default function ProductEditorPage() {
  return (
    <SectionAccessGate section="PRODUCTS" pageTitle="Product">
      <ProductEditor />
    </SectionAccessGate>
  );
}

function ProductEditor() {
  const params = useParams<{ productId: string }>();
  const productId = Array.isArray(params.productId) ? params.productId[0] : params.productId;
  const { store, businessType, permissions, dashboardSlug } = useStore();
  const canEdit = permissions.PRODUCTS === 'EDIT';
  const tracksStock = BUSINESS_TYPES_WITH_STOCK[businessType] ?? false;
  // Real-estate listings are one-of-a-kind: no versions or extras to configure.
  const sellsVariants = businessType !== 'real_estate';

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<TabId>('details');
  const [stockRefresh, setStockRefresh] = useState(0);

  const reload = useCallback(async () => {
    try {
      setProduct(await getProduct(productId));
      setFailed(false);
    } catch {
      setFailed(true);
    }
    setLoading(false);
  }, [productId]);

  useEffect(() => { void reload(); }, [reload]);
  useEffect(() => {
    if (store.id.startsWith('local-')) return;
    getCategories(store.id).then(setCategories).catch(() => { /* the category picker just stays empty */ });
  }, [store.id]);

  const tabs = useMemo(() => {
    const list: { id: TabId; label: string }[] = [
      { id: 'details', label: 'Details' },
      { id: 'pictures', label: 'Pictures' },
    ];
    if (sellsVariants) list.push({ id: 'variants', label: 'Options & variants' }, { id: 'addons', label: 'Add-ons' });
    if (tracksStock) list.push({ id: 'stock', label: 'Stock' });
    return list;
  }, [sellsVariants, tracksStock]);

  const backHref = dashboardPath(dashboardSlug, 'products');

  if (loading) {
    return (
      <>
        <Header title="Product" subtitle={store.name || 'Dashboard'} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        </main>
      </>
    );
  }

  if (failed || !product) {
    return (
      <>
        <Header title="Product" subtitle={store.name || 'Dashboard'} />
        <main className="flex-1 p-4 md:p-6">
          <EmptyState
            title="Couldn't load this product"
            description="It may have been deleted, or belong to a different store."
            action={{ label: 'Back to products', onClick: () => { window.location.href = backHref; } }}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <Header title={product.name} subtitle={store.name || 'Dashboard'} />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors duration-150"
        >
          <ChevronLeft size={16} /> All products
        </Link>

        <div role="tablist" aria-label="Product sections" className="flex gap-1 overflow-x-auto border-b border-surface-200">
          {tabs.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-t-md',
                tab === t.id
                  ? 'border-primary-500 text-primary-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {!canEdit && (
          <p className="text-xs font-medium text-amber-700 bg-amber-50 rounded-md px-3 py-2">
            View only — ask the store owner for edit access to change this product.
          </p>
        )}

        <div role="tabpanel">
          {tab === 'details' && (
            <DetailsTab
              key={product.id}
              product={product}
              categories={categories}
              storeId={store.id}
              canEdit={canEdit}
              tracksStock={tracksStock}
              onSaved={setProduct}
            />
          )}
          {tab === 'pictures' && (
            <ImagesEditor
              productId={product.id}
              storeId={store.id}
              initial={product.gallery ?? []}
              canEdit={canEdit}
              onSaved={() => { void reload(); }}
            />
          )}
          {tab === 'variants' && (
            <VariantsEditor
              productId={product.id}
              initial={{ options: product.options ?? [], variants: product.variants ?? [] }}
              productPrice={product.price}
              tracksStock={tracksStock}
              canEdit={canEdit}
              onSaved={() => { void reload(); setStockRefresh(n => n + 1); }}
            />
          )}
          {tab === 'addons' && (
            <AddonsEditor
              productId={product.id}
              initial={product.modifierGroups ?? []}
              canEdit={canEdit}
              onSaved={() => { void reload(); }}
            />
          )}
          {tab === 'stock' && (
            <ProductStockPanel storeId={store.id} productId={product.id} canEdit={canEdit} refreshKey={stockRefresh} />
          )}
        </div>
      </main>
    </>
  );
}

// ── Details ─────────────────────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active — visible to customers' },
  { value: 'inactive', label: 'Inactive — hidden' },
];

function DetailsTab({ product, categories, storeId, canEdit, tracksStock, onSaved }: {
  product: ApiProduct;
  categories: ApiCategory[];
  storeId: string;
  canEdit: boolean;
  tracksStock: boolean;
  onSaved: (p: ApiProduct) => void;
}) {
  const { success } = useToast();
  const hasVariants = product.hasVariants ?? false;
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? '');
  const [categoryId, setCategoryId] = useState(product.categoryId ?? '');
  const [price, setPrice] = useState(String(product.price));
  const [salePrice, setSalePrice] = useState(product.discountPrice != null ? String(product.discountPrice) : '');
  const [sku, setSku] = useState(product.sku ?? '');
  const [threshold, setThreshold] = useState(product.lowStockThreshold != null ? String(product.lowStockThreshold) : '');
  const [active, setActive] = useState(product.status !== 'inactive');
  const [featured, setFeatured] = useState(product.featured ?? false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const categoryOptions = flattenCategories(categories).map(r => ({
    value: r.category.id,
    label: `${'— '.repeat(r.depth)}${r.category.name}`,
  }));

  async function save() {
    if (!name.trim()) return setError('Give the product a name.');
    const p = Number(price);
    if (price.trim() === '' || Number.isNaN(p) || p < 0) return setError('Enter a valid price.');
    if (salePrice.trim() !== '' && !(Number(salePrice) >= 0 && Number(salePrice) < p)) {
      return setError('The sale price must be lower than the regular price.');
    }
    if (threshold.trim() !== '' && !(Number.isInteger(Number(threshold)) && Number(threshold) >= 0)) {
      return setError('The low-stock alert must be a whole number, 0 or more.');
    }
    setSaving(true);
    setError('');
    try {
      const updated = await updateProduct(product.id, storeId, {
        name: name.trim(),
        description,
        categoryId: categoryId || undefined,
        price: p,
        discountPrice: salePrice.trim() === '' ? undefined : Number(salePrice),
        sku: sku.trim() || undefined,
        lowStockThreshold: threshold.trim() === '' ? null : Number(threshold),
        status: active ? 'active' : 'inactive',
        featured,
        // Kept as-is: a product's public URL must not change every time it is edited.
        slug: product.slug,
      });
      onSaved(updated);
      success('Product saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the product.');
    }
    setSaving(false);
  }

  return (
    <Card className="p-5 space-y-4 max-w-2xl">
      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-btn px-3 py-2">{error}</p>
      )}
      <Input label="Name" required disabled={!canEdit} value={name} onChange={e => { setName(e.target.value); setError(''); }} />
      <Textarea label="Description" rows={4} disabled={!canEdit} value={description} onChange={e => setDescription(e.target.value)} />
      <Select
        label="Category"
        disabled={!canEdit}
        options={categoryOptions}
        placeholder="No category"
        value={categoryId}
        onChange={e => setCategoryId(e.target.value)}
      />

      {hasVariants && (
        <p className="text-xs text-slate-600 bg-surface-50 border border-surface-200 rounded-md px-3 py-2">
          This product is sold through variants, so each variant has its own price, SKU and stock (see “Options &amp; variants”).
          The price customers see on cards is the lowest variant price.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Price"
          required
          type="number"
          min="0"
          step="0.01"
          disabled={!canEdit || hasVariants}
          value={price}
          onChange={e => { setPrice(e.target.value); setError(''); }}
        />
        <Input
          label="Sale price"
          type="number"
          min="0"
          step="0.01"
          placeholder="Optional"
          hint="Customers pay this instead of the regular price."
          disabled={!canEdit || hasVariants}
          value={salePrice}
          onChange={e => { setSalePrice(e.target.value); setError(''); }}
        />
        <Input
          label="SKU"
          placeholder="Optional"
          hint="Must be unique in your store."
          maxLength={120}
          disabled={!canEdit || hasVariants}
          value={sku}
          onChange={e => setSku(e.target.value)}
        />
        {tracksStock && !hasVariants && (
          <Input
            label="Low-stock alert"
            type="number"
            min="0"
            step="1"
            placeholder="Store default"
            hint="Warn me when stock is at or below this."
            disabled={!canEdit}
            value={threshold}
            onChange={e => setThreshold(e.target.value)}
          />
        )}
      </div>

      <Select
        label="Status"
        disabled={!canEdit}
        options={STATUS_OPTIONS}
        value={active ? 'active' : 'inactive'}
        onChange={e => setActive(e.target.value === 'active')}
      />
      <div className="flex items-center justify-between py-1">
        <div>
          <p className="text-sm font-medium text-slate-700">Featured</p>
          <p className="text-xs text-slate-500 mt-0.5">Pin this item to the top of your store.</p>
        </div>
        <Toggle checked={featured} disabled={!canEdit} onChange={setFeatured} />
      </div>

      {canEdit && (
        <div className="flex justify-end pt-2">
          <Button variant="primary" loading={saving} onClick={save}>Save changes</Button>
        </div>
      )}
    </Card>
  );
}
