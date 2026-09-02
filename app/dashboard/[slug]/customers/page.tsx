'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Users, UserPlus, Repeat, ShoppingBag } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { SectionAccessGate } from '@/components/dashboard/SectionAccessGate';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStore } from '@/contexts/StoreContext';
import { dashboardPath } from '@/lib/utils/dashboard-path';
import { formatCurrency, formatRelativeTime, formatDate, cn } from '@/lib/utils';
import type { ApiCustomerSummary } from '@/lib/api/customers';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function AvatarCircle({ name }: { name: string }) {
  const colors = [
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-sky-100 text-sky-700',
    'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700',
  ];
  const colorIndex = (name.charCodeAt(0) || 0) % colors.length;
  return (
    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0', colors[colorIndex])}>
      {getInitials(name || '?')}
    </div>
  );
}

export default function CustomersPage() {
  const { store, dashboardSlug } = useStore();
  const [customers, setCustomers] = useState<ApiCustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function fetchCustomers() {
      setLoading(true);
      if (store.id.startsWith('local-')) {
        if (!cancelled) { setCustomers([]); setLoading(false); }
        return;
      }
      try {
        const { getCustomerSummaries } = await import('@/lib/api/customers');
        const data = await getCustomerSummaries(store.id);
        if (!cancelled) setCustomers(data);
      } catch {
        if (!cancelled) setCustomers([]);
      }
      if (!cancelled) setLoading(false);
    }
    fetchCustomers();
    return () => { cancelled = true; };
  }, [store.id]);

  // ── Summary stats (all honestly derivable from the aggregated order data) ──
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const totalCustomers = customers.length;
  const newThisMonth = customers.filter(c => c.firstOrderAt >= thisMonthStart).length;
  const repeatCustomers = customers.filter(c => c.orderCount > 1).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      c.phone.includes(q),
    );
  }, [customers, search]);

  function ordersHref(customer: ApiCustomerSummary) {
    const params = new URLSearchParams({ phone: customer.phone });
    if (customer.name) params.set('name', customer.name);
    return `${dashboardPath(dashboardSlug, 'orders')}?${params.toString()}`;
  }

  return (
    <SectionAccessGate section="CUSTOMERS" pageTitle="Customers">
      <Header title="Customers" subtitle="Derived from your store's real orders" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {/* ── Honesty note ─────────────────────────────────────────────────── */}
        <p className="text-xs text-slate-500">
          This list isn&apos;t a managed customer directory — there&apos;s no separate customer record to edit.
          It&apos;s built from who has actually ordered from this store, grouped by account (or by phone number for guest orders).
        </p>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-xl px-4 py-2.5 shadow-card">
            <Users size={16} className="text-indigo-500" />
            <span className="text-sm font-semibold text-slate-900">{totalCustomers}</span>
            <span className="text-sm text-slate-500">Total Customers</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-xl px-4 py-2.5 shadow-card">
            <UserPlus size={16} className="text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-700">{newThisMonth}</span>
            <span className="text-sm text-emerald-600">New This Month</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-sky-200 rounded-xl px-4 py-2.5 shadow-card">
            <Repeat size={16} className="text-sky-500" />
            <span className="text-sm font-semibold text-sky-700">{repeatCustomers}</span>
            <span className="text-sm text-sky-600">Repeat Customers</span>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-xs">
          <Input
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            prefix={<Search size={15} />}
          />
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
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Orders</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Spent</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Order</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState
                          icon={<Users size={28} />}
                          title={customers.length === 0 ? 'No customers yet' : 'No customers found'}
                          description={customers.length === 0
                            ? 'Once someone places a real order, they\'ll show up here.'
                            : 'Try adjusting your search.'}
                        />
                      </td>
                    </tr>
                  ) : (
                    filtered.map(customer => (
                      <tr key={customer.customerId ?? `guest:${customer.phone}`} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <AvatarCircle name={customer.name} />
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 leading-tight truncate">{customer.name}</p>
                              {customer.email && <p className="text-xs text-slate-400 truncate">{customer.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{customer.phone}</td>
                        <td className="px-4 py-3 text-slate-700 font-medium">{customer.orderCount}</td>
                        <td className="px-4 py-3 text-slate-700">{formatCurrency(customer.totalSpent, store.currency)}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs" title={formatDate(customer.lastOrderAt)}>
                          {formatRelativeTime(customer.lastOrderAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <a href={ordersHref(customer)}>
                            <Button variant="ghost" size="sm" icon={<ShoppingBag size={13} />}>
                              View Orders
                            </Button>
                          </a>
                        </td>
                      </tr>
                    ))
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
