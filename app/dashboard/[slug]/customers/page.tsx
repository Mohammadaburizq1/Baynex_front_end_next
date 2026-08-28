'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Eye, X, Star, Users, UserCheck, UserPlus, Phone, Mail, MapPin, ShoppingBag, DollarSign, BarChart2, Tag, Save } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStore } from '@/contexts/StoreContext';
import { loadStoreCustomers, saveStoreCustomers } from '@/lib/utils/store-scoped-data';
import { formatCurrency, formatRelativeTime, formatDate, cn } from '@/lib/utils';
import type { Customer } from '@/lib/types';

const TAG_OPTIONS = [
  { value: '', label: 'All Tags' },
  { value: 'vip', label: 'VIP' },
  { value: 'regular', label: 'Regular' },
  { value: 'new', label: 'New' },
  { value: 'corporate', label: 'Corporate' },
];

const TAG_BADGE_MAP: Record<string, 'primary' | 'warning' | 'success' | 'info' | 'default'> = {
  vip: 'warning',
  regular: 'info',
  new: 'success',
  corporate: 'purple' as any,
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function AvatarCircle({ name, size = 'sm' }: { name: string; size?: 'sm' | 'lg' }) {
  const colors = [
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-sky-100 text-sky-700',
    'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const sizeClasses = size === 'lg' ? 'w-12 h-12 text-base' : 'w-8 h-8 text-xs';
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold shrink-0', sizeClasses, colors[colorIndex])}>
      {getInitials(name)}
    </div>
  );
}

const AVAILABLE_TAGS = ['vip', 'regular', 'new', 'corporate'];

export default function CustomersPage() {
  const { store } = useStore();
  const { success } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    setCustomers(loadStoreCustomers(store.slug));
  }, [store.slug]);

  const persistCustomers = (next: Customer[]) => {
    setCustomers(next);
    saveStoreCustomers(store.slug, next);
  };
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [panelNotes, setPanelNotes] = useState('');
  const [panelTags, setPanelTags] = useState<string[]>([]);
  const [savingNotes, setSavingNotes] = useState(false);

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const totalCustomers = customers.length;
  const vipCount = customers.filter(c => c.tags.includes('vip')).length;
  const newThisMonth = customers.filter(c => c.createdAt >= thisMonthStart).length;

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q);
      const matchTag = !tagFilter || c.tags.includes(tagFilter);
      return matchSearch && matchTag;
    });
  }, [customers, search, tagFilter]);

  function openPanel(customer: Customer) {
    setSelectedCustomer(customer);
    setPanelNotes(customer.notes ?? '');
    setPanelTags([...customer.tags]);
  }

  function closePanel() {
    setSelectedCustomer(null);
  }

  function handleSaveNotes() {
    if (!selectedCustomer) return;
    setSavingNotes(true);
    setTimeout(() => {
      const next = customers.map(c =>
        c.id === selectedCustomer.id ? { ...c, notes: panelNotes, tags: panelTags } : c,
      );
      persistCustomers(next);
      setSelectedCustomer(prev => (prev ? { ...prev, notes: panelNotes, tags: panelTags } : prev));
      setSavingNotes(false);
      success('Customer notes saved');
    }, 400);
  }

  function togglePanelTag(tag: string) {
    setPanelTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  }

  const avgOrderValue = selectedCustomer && selectedCustomer.totalOrders > 0
    ? selectedCustomer.totalSpent / selectedCustomer.totalOrders
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Customers" subtitle="Manage your customer base" />

      <div className="p-5 lg:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Main content ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Summary chips */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-xl px-4 py-2.5 shadow-card">
                <Users size={16} className="text-indigo-500" />
                <span className="text-sm font-semibold text-slate-900">{totalCustomers}</span>
                <span className="text-sm text-slate-500">Total Customers</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-4 py-2.5 shadow-card">
                <Star size={16} className="text-amber-500" />
                <span className="text-sm font-semibold text-amber-700">{vipCount}</span>
                <span className="text-sm text-amber-600">VIP Customers</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-xl px-4 py-2.5 shadow-card">
                <UserPlus size={16} className="text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-700">{newThisMonth}</span>
                <span className="text-sm text-emerald-600">New This Month</span>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="search"
                  placeholder="Search by name, email or phone..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-btn border border-surface-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                />
              </div>
              <Select
                options={TAG_OPTIONS}
                value={tagFilter}
                onChange={e => setTagFilter(e.target.value)}
                placeholder="Filter by tag"
                className="sm:w-40"
              />
            </div>

            {/* Table */}
            <Card padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-200 bg-slate-50/70">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Orders</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Spent</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Order</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tags</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <EmptyState
                            icon={<Users size={28} />}
                            title="No customers found"
                            description="Try adjusting your search or filter."
                          />
                        </td>
                      </tr>
                    ) : (
                      filtered.map(customer => {
                        const isVip = customer.tags.includes('vip');
                        return (
                          <tr
                            key={customer.id}
                            className={cn(
                              'hover:bg-slate-50/60 transition-colors',
                              selectedCustomer?.id === customer.id && 'bg-indigo-50/40',
                            )}
                          >
                            {/* Customer */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <AvatarCircle name={customer.name} />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-medium text-slate-900 leading-tight truncate">{customer.name}</p>
                                    {isVip && (
                                      <Star size={12} className="text-amber-500 fill-amber-400 shrink-0" aria-label="VIP customer" />
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-400 truncate">{customer.email}</p>
                                </div>
                              </div>
                            </td>
                            {/* Phone */}
                            <td className="px-4 py-3 text-slate-600 text-xs">{customer.phone}</td>
                            {/* Orders */}
                            <td className="px-4 py-3 text-slate-700 font-medium">{customer.totalOrders}</td>
                            {/* Total Spent */}
                            <td className="px-4 py-3">
                              <span className={cn('text-slate-700', isVip && 'font-bold text-amber-700')}>
                                {formatCurrency(customer.totalSpent)}
                              </span>
                            </td>
                            {/* Last Order */}
                            <td className="px-4 py-3 text-slate-400 text-xs">
                              {customer.lastOrderAt ? formatRelativeTime(customer.lastOrderAt) : '—'}
                            </td>
                            {/* Tags */}
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {customer.tags.map(tag => (
                                  <Badge key={tag} variant={TAG_BADGE_MAP[tag] ?? 'default'} className="capitalize">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                            {/* Actions */}
                            <td className="px-4 py-3">
                              <button
                                onClick={() => openPanel(customer)}
                                aria-label={`View details for ${customer.name}`}
                                className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                              >
                                <Eye size={15} />
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

          {/* ── Detail Panel (lg: side panel, sm: overlay) ────────────── */}
          {selectedCustomer && (
            <>
              {/* Mobile overlay backdrop */}
              <div
                className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                onClick={closePanel}
                aria-hidden="true"
              />

              {/* Panel */}
              <aside className={cn(
                'fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-modal max-h-[85vh] overflow-y-auto',
                'lg:static lg:z-auto lg:rounded-xl lg:shadow-card lg:border lg:border-surface-200 lg:w-80 lg:max-h-none lg:shrink-0',
                'lg:self-start',
              )}>
                {/* Panel header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200 sticky top-0 bg-white z-10">
                  <h2 className="text-sm font-semibold text-slate-900">Customer Details</h2>
                  <button
                    onClick={closePanel}
                    aria-label="Close customer details"
                    className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-surface-100 focus-visible:ring-2 focus-visible:ring-slate-300"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="px-5 py-4 space-y-5">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-4">
                    <AvatarCircle name={selectedCustomer.name} size="lg" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-slate-900">{selectedCustomer.name}</p>
                        {selectedCustomer.tags.includes('vip') && (
                          <Star size={14} className="text-amber-500 fill-amber-400" aria-label="VIP" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Customer since {formatDate(selectedCustomer.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={14} className="text-slate-400 shrink-0" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    {selectedCustomer.address && (
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                        <span>{selectedCustomer.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <ShoppingBag size={14} className="text-indigo-400 mx-auto mb-1" />
                      <p className="text-base font-bold text-slate-900">{selectedCustomer.totalOrders}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">Orders</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <DollarSign size={14} className="text-emerald-400 mx-auto mb-1" />
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(selectedCustomer.totalSpent)}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">Spent</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <BarChart2 size={14} className="text-amber-400 mx-auto mb-1" />
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(avgOrderValue)}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">Avg Order</p>
                    </div>
                  </div>

                  {/* Tags editor */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Tag size={13} className="text-slate-400" />
                      <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Tags</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_TAGS.map(tag => {
                        const active = panelTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => togglePanelTag(tag)}
                            aria-pressed={active}
                            className={cn(
                              'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer capitalize',
                              active
                                ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                                : 'bg-white text-slate-500 border-surface-200 hover:border-slate-300',
                            )}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Textarea
                      label="Notes"
                      value={panelNotes}
                      onChange={e => setPanelNotes(e.target.value)}
                      placeholder="Add notes about this customer..."
                      rows={3}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-1">
                    <Button
                      fullWidth
                      loading={savingNotes}
                      icon={<Save size={14} />}
                      onClick={handleSaveNotes}
                    >
                      Save Changes
                    </Button>
                    <Button
                      fullWidth
                      variant="secondary"
                      icon={<ShoppingBag size={14} />}
                      onClick={() => {
                        /* TODO: link to orders filtered by customer */
                      }}
                    >
                      View Orders
                    </Button>
                  </div>
                </div>
              </aside>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
