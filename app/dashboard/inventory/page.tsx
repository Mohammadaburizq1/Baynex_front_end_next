'use client';

import { useState, useMemo } from 'react';
import { Search, Pencil, Package, AlertTriangle, XCircle, Check } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { mockInventory } from '@/lib/mock-data';
import { formatCurrency, formatRelativeTime, STOCK_STATUS_MAP, cn } from '@/lib/utils';
import type { InventoryItem } from '@/lib/types';

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'Burgers', label: 'Burgers' },
  { value: 'Pizzas', label: 'Pizzas' },
  { value: 'Sides', label: 'Sides' },
  { value: 'Drinks', label: 'Drinks' },
  { value: 'Desserts', label: 'Desserts' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

interface InlineEditState {
  itemId: string;
  value: string;
}

export default function InventoryPage() {
  const { success } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [inlineEdit, setInlineEdit] = useState<InlineEditState | null>(null);

  // Edit modal
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState({
    currentStock: 0,
    lowStockThreshold: 0,
    reorderQty: 0,
    unitCost: 0,
  });

  const filtered = useMemo(() => {
    return inventory.filter(item => {
      const matchSearch =
        !search ||
        item.productName.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase());
      const matchCat = !categoryFilter || item.category === categoryFilter;
      const matchStatus = !statusFilter || item.stockStatus === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [inventory, search, categoryFilter, statusFilter]);

  const totalItems = inventory.length;
  const lowStockCount = inventory.filter(i => i.stockStatus === 'low_stock').length;
  const outOfStockCount = inventory.filter(i => i.stockStatus === 'out_of_stock').length;

  function deriveStockStatus(stock: number, threshold: number): InventoryItem['stockStatus'] {
    if (stock === 0) return 'out_of_stock';
    if (stock <= threshold) return 'low_stock';
    return 'in_stock';
  }

  function handleInlineSave(item: InventoryItem) {
    if (!inlineEdit) return;
    const newStock = parseInt(inlineEdit.value, 10);
    if (isNaN(newStock) || newStock < 0) return;
    setInventory(prev =>
      prev.map(i =>
        i.id === item.id
          ? {
              ...i,
              currentStock: newStock,
              stockStatus: deriveStockStatus(newStock, i.lowStockThreshold),
              lastUpdated: new Date().toISOString(),
            }
          : i,
      ),
    );
    setInlineEdit(null);
    success(`Stock updated for ${item.productName}`);
  }

  function openEditModal(item: InventoryItem) {
    setEditItem(item);
    setEditForm({
      currentStock: item.currentStock,
      lowStockThreshold: item.lowStockThreshold,
      reorderQty: item.reorderQty,
      unitCost: item.unitCost,
    });
  }

  function handleUpdateStock() {
    if (!editItem) return;
    setInventory(prev =>
      prev.map(i =>
        i.id === editItem.id
          ? {
              ...i,
              ...editForm,
              stockStatus: deriveStockStatus(editForm.currentStock, editForm.lowStockThreshold),
              lastUpdated: new Date().toISOString(),
            }
          : i,
      ),
    );
    success(`${editItem.productName} updated`);
    setEditItem(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Inventory" subtitle="Track and manage stock levels" />

      <div className="p-5 lg:p-6 max-w-7xl mx-auto space-y-5">

        {/* ── Summary chips ─────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-xl px-4 py-2.5 shadow-card">
            <Package size={16} className="text-indigo-500" />
            <span className="text-sm font-semibold text-slate-900">{totalItems}</span>
            <span className="text-sm text-slate-500">Total Items</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-4 py-2.5 shadow-card">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-sm font-semibold text-amber-700">{lowStockCount}</span>
            <span className="text-sm text-amber-600">Low Stock</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-red-200 rounded-xl px-4 py-2.5 shadow-card">
            <XCircle size={16} className="text-red-500" />
            <span className="text-sm font-semibold text-red-700">{outOfStockCount}</span>
            <span className="text-sm text-red-600">Out of Stock</span>
          </div>
        </div>

        {/* ── Toolbar ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search by product or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-btn border border-surface-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            />
          </div>
          <Select
            options={CATEGORY_OPTIONS}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="sm:w-44"
          />
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="sm:w-44"
          />
        </div>

        {/* ── Table ─────────────────────────────────────────────────── */}
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 bg-slate-50/70">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Current Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Low Stock Threshold</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Unit Cost</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Updated</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState
                        icon={<Package size={28} />}
                        title="No items found"
                        description="Try adjusting your search or filter."
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map(item => {
                    const statusInfo = STOCK_STATUS_MAP[item.stockStatus];
                    const isEditing = inlineEdit?.itemId === item.id;
                    const rowBg =
                      item.stockStatus === 'out_of_stock'
                        ? 'bg-red-50/30'
                        : item.stockStatus === 'low_stock'
                        ? 'bg-amber-50/30'
                        : '';

                    return (
                      <tr key={item.id} className={cn('hover:bg-slate-50/60 transition-colors', rowBg)}>
                        {/* Product */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900 leading-tight">{item.productName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.sku}</p>
                        </td>
                        {/* Category */}
                        <td className="px-4 py-3 text-slate-600">{item.category}</td>
                        {/* Current Stock (inline editable) */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                value={inlineEdit.value}
                                onChange={e =>
                                  setInlineEdit({ itemId: item.id, value: e.target.value })
                                }
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleInlineSave(item);
                                  if (e.key === 'Escape') setInlineEdit(null);
                                }}
                                autoFocus
                                className="w-20 h-7 px-2 rounded border border-primary-400 text-sm text-slate-900 outline-none ring-1 ring-primary-400"
                              />
                              <button
                                onClick={() => handleInlineSave(item)}
                                aria-label="Save stock"
                                className="h-7 w-7 flex items-center justify-center rounded text-white bg-indigo-500 hover:bg-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-400"
                              >
                                <Check size={13} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                setInlineEdit({ itemId: item.id, value: String(item.currentStock) })
                              }
                              aria-label={`Edit stock for ${item.productName}`}
                              className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer underline underline-offset-2 decoration-dashed"
                            >
                              {item.currentStock}
                            </button>
                          )}
                        </td>
                        {/* Low Stock Threshold */}
                        <td className="px-4 py-3 text-slate-600">{item.lowStockThreshold}</td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge colorClass={statusInfo.color} label={statusInfo.label} />
                        </td>
                        {/* Unit Cost */}
                        <td className="px-4 py-3 text-slate-600">{formatCurrency(item.unitCost)}</td>
                        {/* Last Updated */}
                        <td className="px-4 py-3 text-slate-400 text-xs">{formatRelativeTime(item.lastUpdated)}</td>
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openEditModal(item)}
                            aria-label={`Edit ${item.productName}`}
                            className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                          >
                            <Pencil size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ── Edit Stock Modal ──────────────────────────────────────────── */}
      <Modal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title="Edit Stock"
        description={editItem ? `${editItem.productName} · ${editItem.sku}` : undefined}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleUpdateStock}>Update Stock</Button>
          </>
        }
      >
        {editItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Current Stock"
                type="number"
                min="0"
                value={editForm.currentStock}
                onChange={e => setEditForm(p => ({ ...p, currentStock: parseInt(e.target.value) || 0 }))}
              />
              <Input
                label="Low Stock Threshold"
                type="number"
                min="0"
                value={editForm.lowStockThreshold}
                onChange={e => setEditForm(p => ({ ...p, lowStockThreshold: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Reorder Quantity"
                type="number"
                min="0"
                value={editForm.reorderQty}
                onChange={e => setEditForm(p => ({ ...p, reorderQty: parseInt(e.target.value) || 0 }))}
              />
              <Input
                label="Unit Cost (RM)"
                type="number"
                min="0"
                step="0.01"
                value={editForm.unitCost}
                onChange={e => setEditForm(p => ({ ...p, unitCost: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
