'use client';

import Link from 'next/link';
import { ShoppingBag, Package, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStore } from '@/contexts/StoreContext';
import {
  mockOrders,
  mockProducts,
} from '@/lib/mock-data';
import {
  formatCurrency,
  formatRelativeTime,
  ORDER_STATUS_MAP,
} from '@/lib/utils';

// ── Low-stock alert data ───────────────────────────────────────────────────────

const LOW_STOCK_ITEMS = [
  { name: 'Onion Rings', stock: 8 },
  { name: 'Mango Lassi', stock: 8 },
  { name: 'Spicy Chicken Burger', stock: 0 },
];

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useStore();

  // Derived counts
  const activeProducts = mockProducts.filter(p => p.status === 'active').length;
  const pendingOrders = mockOrders.filter(
    o => o.status === 'pending' || o.status === 'confirmed',
  ).length;
  const recentOrders = mockOrders.slice(0, 5);

  return (
    <>
      <Header
        title="Dashboard"
        subtitle={`Welcome back, ${user.name}`}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

        {/* ── Stat grid ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total Revenue"
            value="RM 6,105.50"
            change={12.4}
            icon="revenue"
            color="indigo"
            changeLabel="vs last week"
          />
          <StatCard
            title="Total Orders"
            value="161"
            change={8.7}
            icon="orders"
            color="emerald"
            changeLabel="vs last week"
          />
          <StatCard
            title="Avg Order Value"
            value="RM 37.92"
            change={3.4}
            icon="revenue"
            color="amber"
            changeLabel="vs last week"
          />
          <StatCard
            title="Active Products"
            value={activeProducts}
            change={0}
            icon="products"
            color="violet"
            changeLabel="total"
          />
          <StatCard
            title="Total Customers"
            value="87"
            change={5.2}
            icon="customers"
            color="sky"
            changeLabel="vs last week"
          />
          <StatCard
            title="Pending Orders"
            value={pendingOrders}
            change={-2.1}
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
                  href="/dashboard/orders"
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
                  onClick={() => { window.location.href = '/dashboard/products'; }}
                >
                  Add Product
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => { window.location.href = '/dashboard/orders'; }}
                >
                  View Orders
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => { window.location.href = '/dashboard/delivery'; }}
                >
                  Delivery Settings
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => { window.location.href = '/dashboard/store-settings'; }}
                >
                  Store Settings
                </Button>
              </div>
            </Card>

            {/* Low Stock Alert */}
            <Card padding="md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <CardTitle>Low Stock Alert</CardTitle>
                </div>
              </CardHeader>

              <ul className="space-y-2">
                {LOW_STOCK_ITEMS.map(item => (
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
          </div>
        </div>
      </main>
    </>
  );
}
