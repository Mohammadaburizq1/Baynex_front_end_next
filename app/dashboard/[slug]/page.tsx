'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ShoppingBag, Package, AlertTriangle, Copy, Check, ExternalLink } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStore } from '@/contexts/StoreContext';
import { dashboardPath } from '@/lib/utils/dashboard-path';
import {
  computeDashboardStats,
  isDemoStore,
  loadStoreCustomers,
  loadStoreOrders,
  loadStoreProducts,
  lowStockProducts,
} from '@/lib/utils/store-scoped-data';
import {
  formatCurrency,
  formatRelativeTime,
  ORDER_STATUS_MAP,
} from '@/lib/utils';
import type { Order, Product } from '@/lib/types';

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, store, dashboardSlug, storeNotSynced, syncStoreNow, updateStore } = useStore();
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  // Real backend product count for the publish gate — null while unknown/loading. Kept separate
  // from `products` below, which is the mock local-storage catalog the stat cards use.
  const [hasRealProducts, setHasRealProducts] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setOrders(loadStoreOrders(store.slug));
    setProducts(loadStoreProducts(store.slug));
  }, [store.slug]);

  const customers = useMemo(
    () => loadStoreCustomers(store.slug),
    [store.slug],
  );

  const stats = useMemo(
    () => computeDashboardStats(orders, products, customers),
    [orders, products, customers],
  );

  const lowStockItems = useMemo(
    () => lowStockProducts(products),
    [products],
  );

  const isDemo = isDemoStore(store.slug);
  const selectedTemplate =
    (typeof window !== 'undefined' && localStorage.getItem('sl_selected_template')) ||
    store.theme ||
    'retail-classic';
  const shopHref = isDemo
    ? `/templates/${selectedTemplate}`
    : `/store/${store.slug}`;
  const shopUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${shopHref}`
    : shopHref;

  const handleCopy = () => {
    navigator.clipboard.writeText(shopUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Every new store starts DRAFT (server-enforced — see StoreService.create()), and the
  // backend rejects a publish (PUT status: "ACTIVE") unless the store has at least one
  // product. Publishing is the one thing that unblocks the live link.
  const isDraft = !isDemo && store.status === 'draft';
  const canPublish = !store.id.startsWith('local-');

  useEffect(() => {
    if (!isDraft || !canPublish) return;
    let cancelled = false;
    (async () => {
      try {
        const { storeHasProducts } = await import('@/lib/utils/store-publish');
        const has = await storeHasProducts(store.id);
        if (!cancelled) setHasRealProducts(has);
      } catch {
        // Unknown — leave null so the CTA falls back to attempting a publish and
        // surfacing whatever the backend actually says.
      }
    })();
    return () => { cancelled = true; };
  }, [isDraft, canPublish, store.id]);

  const handlePublish = async () => {
    setPublishing(true);
    setPublishError('');
    const { setStorePublished, isNoProductsPublishError } = await import('@/lib/utils/store-publish');
    try {
      await setStorePublished(store, true);
      updateStore({ status: 'active' });
    } catch (e: any) {
      if (isNoProductsPublishError(e)) {
        setHasRealProducts(false);
      } else {
        setPublishError(e?.message ?? 'Could not publish store. Please try again.');
      }
    }
    setPublishing(false);
  };

  const pendingOrders = stats.pendingOrders;
  const recentOrders = orders.slice(0, 5);
  const currency = store.currency || 'MYR';

  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  const handleSync = async () => {
    setSyncing(true);
    setSyncError('');
    try {
      await syncStoreNow();
    } catch (e: any) {
      setSyncError(e.message ?? 'Sync failed');
    }
    setSyncing(false);
  };

  return (
    <>
      <Header
        title={store.name || 'Dashboard'}
        subtitle={`Welcome back, ${user.name}`}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

        {/* ── Not-synced warning banner ──────────────────────────────────── */}
        {storeNotSynced && (
          <div className="flex flex-wrap items-center gap-3 px-4 py-3.5 rounded-2xl border border-amber-200 bg-amber-50">
            <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">Store not saved to database</p>
              <p className="text-xs text-amber-700 mt-0.5">
                {syncError || 'Your store exists locally but hasn\'t been saved to the server yet.'}
              </p>
            </div>
            <Button
              variant="primary"
              loading={syncing}
              onClick={handleSync}
              className="shrink-0"
            >
              {syncing ? 'Saving…' : 'Save to Database'}
            </Button>
          </div>
        )}

        {/* ── Shop link / publish-status banner ─────────────────────────────── */}
        <div
          className="flex flex-wrap items-center gap-3 px-4 py-3.5 rounded-2xl border"
          style={{
            background: isDemo
              ? 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)'
              : isDraft
                ? 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
                : 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
            borderColor: isDemo ? '#FDE68A' : isDraft ? '#CBD5E1' : '#C7D2FE',
          }}
        >
          {/* Status indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isDemo ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                </span>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Preview</span>
              </>
            ) : isDraft ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400" />
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Draft</span>
              </>
            ) : (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Live</span>
              </>
            )}
          </div>

          <div className="w-px h-4 hidden sm:block shrink-0" style={{ background: isDemo ? '#FDE68A' : isDraft ? '#CBD5E1' : '#C7D2FE' }} />

          {/* Label + URL */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: isDemo ? '#92400E' : isDraft ? '#475569' : '#6366F1' }}>
              {isDemo
                ? 'Template Preview — complete setup to go live'
                : isDraft
                  ? 'Not visible to customers yet'
                  : 'Your Shop Link'}
            </p>
            <p className="text-sm font-mono font-semibold truncate" style={{ color: isDemo ? '#B45309' : isDraft ? '#64748B' : '#4338CA' }}>
              {typeof window !== 'undefined' ? window.location.host : 'shoplink.co'}{shopHref}
            </p>
            {isDraft && (
              <p className="text-xs text-slate-500 mt-1">
                {!canPublish
                  ? 'Save this store to the server first (banner above), then publish it to go live.'
                  : hasRealProducts === false
                    ? 'Add at least one product to make your store eligible to publish.'
                    : 'This store is saved as a draft — the link above won\'t work until you publish it.'}
                {publishError && <span className="text-red-600 block mt-0.5">{publishError}</span>}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isDraft ? (
              hasRealProducts === false ? (
                <Link
                  href={dashboardPath(dashboardSlug, 'products')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all duration-150"
                  style={{ background: '#6366F1' }}
                >
                  Add a Product
                </Link>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={publishing || !canPublish}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#6366F1' }}
                >
                  {publishing ? 'Publishing…' : 'Publish Store'}
                </button>
              )
            ) : (
              <>
                {!isDemo && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer border"
                    style={{
                      background: copied ? '#D1FAE5' : 'white',
                      borderColor: copied ? '#6EE7B7' : '#C7D2FE',
                      color: copied ? '#065F46' : '#4F46E5',
                    }}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                )}
                {isDemo && (
                  <Link
                    href="/onboarding"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border"
                    style={{ background: 'white', borderColor: '#FDE68A', color: '#92400E' }}
                  >
                    Complete Setup
                  </Link>
                )}
                <a
                  href={shopHref}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all duration-150"
                  style={{ background: isDemo ? '#D97706' : '#6366F1' }}
                  onMouseEnter={e => { e.currentTarget.style.background = isDemo ? '#B45309' : '#4F46E5'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isDemo ? '#D97706' : '#6366F1'; }}
                >
                  <ExternalLink size={13} />
                  {isDemo ? 'Preview' : 'Open Shop'}
                </a>
              </>
            )}
          </div>
        </div>

        {/* ── Stat grid ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue, currency)}
            change={isDemo ? 12.4 : 0}
            icon="revenue"
            color="indigo"
            changeLabel={isDemo ? 'vs last week' : 'from orders'}
          />
          <StatCard
            title="Total Orders"
            value={String(stats.totalOrders)}
            change={isDemo ? 8.7 : 0}
            icon="orders"
            color="emerald"
            changeLabel={isDemo ? 'vs last week' : 'all time'}
          />
          <StatCard
            title="Avg Order Value"
            value={formatCurrency(stats.avgOrderValue, currency)}
            change={isDemo ? 3.4 : 0}
            icon="revenue"
            color="amber"
            changeLabel={isDemo ? 'vs last week' : 'delivered orders'}
          />
          <StatCard
            title="Active Products"
            value={stats.activeProducts}
            change={0}
            icon="products"
            color="violet"
            changeLabel="total"
          />
          <StatCard
            title="Total Customers"
            value={String(stats.totalCustomers)}
            change={isDemo ? 5.2 : 0}
            icon="customers"
            color="sky"
            changeLabel={isDemo ? 'vs last week' : 'total'}
          />
          <StatCard
            title="Pending Orders"
            value={pendingOrders}
            change={isDemo ? -2.1 : 0}
            icon="pending"
            color="rose"
            changeLabel="right now"
          />
        </div>

        {/* ── Two-column section ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Orders — 2/3 */}
          <Card padding="none" className="lg:col-span-2 overflow-hidden">
            <div className="px-5 pt-5 pb-4">
              <CardHeader className="mb-0">
                <CardTitle>Recent Orders</CardTitle>
                <Link
                  href={dashboardPath(dashboardSlug, 'orders')}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-150"
                >
                  View all
                </Link>
              </CardHeader>
            </div>

            {recentOrders.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag size={28} />}
                title="No orders yet"
                description="New customer orders will appear here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-surface-200 bg-surface-50">
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Order #
                      </th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Customer
                      </th>
                      <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Total
                      </th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200">
                    {recentOrders.map(order => {
                      const statusMeta = ORDER_STATUS_MAP[order.status];
                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-surface-50 transition-colors duration-150 cursor-default"
                          title="Order detail coming soon"
                        >
                          <td className="px-5 py-3 font-medium text-slate-900">
                            {order.orderNumber}
                          </td>
                          <td className="px-5 py-3 text-slate-700">
                            {order.customerName}
                          </td>
                          <td className="px-5 py-3 text-right font-medium text-slate-900 tabular-nums">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="px-5 py-3">
                            <StatusBadge
                              colorClass={statusMeta.color}
                              label={statusMeta.label}
                            />
                          </td>
                          <td className="px-5 py-3 text-right text-slate-500 whitespace-nowrap">
                            {formatRelativeTime(order.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Quick Actions + Low Stock — 1/3 */}
          <div className="space-y-4">
            <Card padding="md">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>

              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => { window.location.href = dashboardPath(dashboardSlug, 'products'); }}
                >
                  Add Product
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => { window.location.href = dashboardPath(dashboardSlug, 'orders'); }}
                >
                  View Orders
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => { window.location.href = dashboardPath(dashboardSlug, 'delivery'); }}
                >
                  Delivery Settings
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => { window.location.href = dashboardPath(dashboardSlug, 'store-settings'); }}
                >
                  Store Settings
                </Button>
              </div>
            </Card>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
            <Card padding="md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <CardTitle>Low Stock Alert</CardTitle>
                </div>
              </CardHeader>

              <ul className="space-y-2">
                {lowStockItems.map(item => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between py-1.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-surface-100 flex items-center justify-center shrink-0">
                        <Package size={13} className="text-slate-400" />
                      </div>
                      <span className="text-sm text-slate-700 truncate">
                        {item.name}
                      </span>
                    </div>
                    {item.stock === 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 shrink-0 ml-2">
                        Out of stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 shrink-0 ml-2">
                        {item.stock} left
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
