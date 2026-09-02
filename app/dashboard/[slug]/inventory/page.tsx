'use client';

import { useState, useEffect } from 'react';
import { Search, Package, AlertTriangle, XCircle, Check } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { SectionAccessGate } from '@/components/dashboard/SectionAccessGate';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/contexts/StoreContext';
import { BUSINESS_TYPES_WITH_STOCK, LOW_STOCK_THRESHOLD } from '@/lib/utils';
import type { ApiProduct } from '@/lib/api/products';

interface InlineEditState {
  productId: string;
  value: string;
}

function stockStatus(stock: number | null): 'not_set' | 'out_of_stock' | 'low_stock' | 'in_stock' {
  if (stock === null) return 'not_set';
  if (stock <= 0) return 'out_of_stock';
  if (stock <= LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'in_stock';
}

export default function InventoryPage() {
  const { store, businessType, permissions } = useStore();
  const { success, error: toastError } = useToast();
  const tracksStock = BUSINESS_TYPES_WITH_STOCK[businessType] ?? false;
  const canEdit = permissions.PRODUCTS === 'EDIT';

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [inlineEdit, setInlineEdit] = useState<InlineEditState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      if (!tracksStock || store.id.startsWith('local-')) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { getProducts } = await import('@/lib/api/products');
        const data = await getProducts(store.id);
        if (!cancelled) setProducts(data);
      } catch {
        if (!cancelled) setProducts([]);
      }
      if (!cancelled) setLoading(false);
    }
    fetchProducts();
    return () => { cancelled = true; };
  }, [store.id, tracksStock]);

  const filtered = products.filter(p => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q);
  });

  const totalItems = products.length;
  const lowStockCount = products.filter(p => stockStatus(p.stock) === 'low_stock').length;
  const outOfStockCount = products.filter(p => stockStatus(p.stock) === 'out_of_stock').length;

  async function saveStock(product: ApiProduct) {
    if (!inlineEdit) return;
    const newStock = parseInt(inlineEdit.value, 10);
    if (isNaN(newStock) || newStock < 0) {
      toastError('Enter a valid, non-negative number.');
      return;
    }
    setSaving(true);
    try {
      const { updateProduct } = await import('@/lib/api/products');
      const updated = await updateProduct(product.id, store.id, { ...product, stock: newStock });
      setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
      setInlineEdit(null);
      success(`Stock updated for ${product.name}.`);
    } catch {
      toastError('Could not update stock. Please try again.');
    }
    setSaving(false);
  }

  if (!tracksStock) {
    return (
      <SectionAccessGate section="PRODUCTS" pageTitle="Inventory">
        <Header title="Inventory" subtitle="Track and manage stock levels" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <EmptyState
            icon={<Package size={28} />}
            title="Inventory doesn't apply to this store"
            description="Stock tracking is for product-based stores. This business type doesn't sell trackable units, so there's nothing to show here."
          />
        </main>
      </SectionAccessGate>
    );
  }

  return (
    <SectionAccessGate section="PRODUCTS" pageTitle="Inventory">
      <Header title="Inventory" subtitle="Track and manage stock levels" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {/* Summary chips */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-xl px-4 py-2.5 shadow-card">
            <Package size={16} className="text-indigo-500" />
            <span className="text-sm font-semibold text-slate-900">{totalItems}</span>
            <span className="text-sm text-slate-500">Total Items</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-4 py-2.5 shadow-card">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-sm font-semibold text-amber-700">{lowStockCount}</span>
            <span className="text-sm text-amber-600">Low Stock (≤{LOW_STOCK_THRESHOLD})</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-red-200 rounded-xl px-4 py-2.5 shadow-card">
            <XCircle size={16} className="text-red-500" />
            <span className="text-sm font-semibold text-red-700">{outOfStockCount}</span>
            <span className="text-sm text-red-600">Out of Stock</span>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-xs">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search by product or SKU…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-btn border border-surface-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            />
          </div>
        </div>

        {/* Table */}
        <Card padding="none" className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200 bg-slate-50/70">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Current Stock</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={3}>
                        <EmptyState
                          icon={<Package size={28} />}
                          title={products.length === 0 ? 'No products yet' : 'No items found'}
                          description={products.length === 0
                            ? 'Add a product to start tracking stock.'
                            : 'Try adjusting your search.'}
                        />
                      </td>
                    </tr>
                  ) : (
                    filtered.map(product => {
                      const status = stockStatus(product.stock);
                      const isEditing = inlineEdit?.productId === product.id;
                      const rowBg = status === 'out_of_stock' ? 'bg-red-50/30' : status === 'low_stock' ? 'bg-amber-50/30' : '';
                      return (
                        <tr key={product.id} className={`hover:bg-slate-50/60 transition-colors ${rowBg}`}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900 leading-tight">{product.name}</p>
                            {product.sku && <p className="text-xs text-slate-400 mt-0.5">{product.sku}</p>}
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  value={inlineEdit.value}
                                  onChange={e => setInlineEdit({ productId: product.id, value: e.target.value })}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') saveStock(product);
                                    if (e.key === 'Escape') setInlineEdit(null);
                                  }}
                                  disabled={saving}
                                  autoFocus
                                  className="w-20 h-7 px-2 rounded border border-primary-400 text-sm text-slate-900 outline-none ring-1 ring-primary-400"
                                />
                                <button
                                  onClick={() => saveStock(product)}
                                  disabled={saving}
                                  aria-label="Save stock"
                                  className="h-7 w-7 flex items-center justify-center rounded text-white bg-indigo-500 hover:bg-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50 cursor-pointer"
                                >
                                  <Check size={13} />
                                </button>
                              </div>
                            ) : canEdit ? (
                              <button
                                onClick={() => setInlineEdit({ productId: product.id, value: String(product.stock ?? 0) })}
                                aria-label={`Set stock for ${product.name}`}
                                className={`font-semibold transition-colors cursor-pointer underline underline-offset-2 decoration-dashed ${
                                  product.stock === null ? 'text-slate-400 italic' : 'text-slate-900 hover:text-indigo-600'
                                }`}
                              >
                                {product.stock === null ? 'Not set' : product.stock}
                              </button>
                            ) : (
                              <span className={`font-semibold ${product.stock === null ? 'text-slate-400 italic' : 'text-slate-900'}`}>
                                {product.stock === null ? 'Not set' : product.stock}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {status === 'not_set' && <Badge variant="default">Not tracked</Badge>}
                            {status === 'out_of_stock' && <Badge variant="danger">Out of stock</Badge>}
                            {status === 'low_stock' && <Badge variant="warning">Low stock</Badge>}
                            {status === 'in_stock' && <Badge variant="success">In stock</Badge>}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </SectionAccessGate>
  );
}
