'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Package, X, ChevronRight, Truck, Store, Phone, MapPin, Filter } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { SectionAccessGate } from '@/components/dashboard/SectionAccessGate';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/contexts/StoreContext';
import {
  formatCurrency,
  formatDateTime,
  formatRelativeTime,
  ORDER_STATUS_MAP,
  PAYMENT_STATUS_MAP,
  cn,
} from '@/lib/utils';
import type { Order, OrderStatus } from '@/lib/types';
import { apiOrderToOrder } from '@/lib/api/orders';

// ── Status progression map ─────────────────────────────────────────────────────

const STATUS_PROGRESSION: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
];

const STATUS_NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
  pending:          { label: 'Confirm Order',   next: 'confirmed'        },
  confirmed:        { label: 'Start Preparing', next: 'preparing'        },
  preparing:        { label: 'Mark Ready',      next: 'ready'            },
  ready:            { label: 'Out for Delivery',next: 'out_for_delivery' },
  out_for_delivery: { label: 'Mark Delivered',  next: 'delivered'        },
};

// ── Tab config ─────────────────────────────────────────────────────────────────

type TabKey = 'all' | 'pending' | 'active' | 'completed' | 'cancelled';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'pending',   label: 'Pending'   },
  { key: 'active',    label: 'Active'    },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

function matchesTab(order: Order, tab: TabKey): boolean {
  switch (tab) {
    case 'pending':
      return order.status === 'pending';
    case 'active':
      return ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status);
    case 'completed':
      return order.status === 'delivered';
    case 'cancelled':
      return order.status === 'cancelled' || order.status === 'refunded';
    default:
      return true;
  }
}

// ── Status timeline steps ──────────────────────────────────────────────────────

function StatusTimeline({ currentStatus }: { currentStatus: OrderStatus }) {
  const isCancelled = currentStatus === 'cancelled' || currentStatus === 'refunded';
  const currentIdx = STATUS_PROGRESSION.indexOf(currentStatus);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 py-3">
        <span className={cn(
          'flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0',
          'bg-red-100 text-red-600',
        )}>
          ✕
        </span>
        <span className="text-sm font-medium text-red-600 capitalize">{currentStatus}</span>
      </div>
    );
  }

  return (
    <ol className="relative flex flex-col gap-0">
      {STATUS_PROGRESSION.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isPending = idx > currentIdx;
        const meta = ORDER_STATUS_MAP[step];

        return (
          <li key={step} className="flex items-start gap-3 pb-4 last:pb-0 relative">
            {idx < STATUS_PROGRESSION.length - 1 && (
              <span
                className={cn(
                  'absolute left-[9px] top-5 w-0.5 h-full -translate-x-1/2',
                  isDone ? 'bg-primary-400' : 'bg-surface-200',
                )}
              />
            )}
            <span
              className={cn(
                'relative z-10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                isDone   && 'bg-primary-500 text-white',
                isCurrent && 'bg-primary-500 ring-4 ring-primary-100 text-white',
                isPending && 'bg-surface-200 text-slate-400',
              )}
            >
              {isDone ? (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span className="w-2 h-2 rounded-full bg-current" />
              )}
            </span>
            <span className={cn(
              'text-sm pt-px',
              isDone    && 'text-slate-500',
              isCurrent && 'text-slate-900 font-semibold',
              isPending && 'text-slate-400',
            )}>
              {meta.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ── Order Detail Side Panel ────────────────────────────────────────────────────

interface SidePanelProps {
  order: Order;
  canEdit: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, next: OrderStatus) => void;
  onCancel: (orderId: string) => void;
}

function OrderDetailPanel({ order, canEdit, onClose, onStatusChange, onCancel }: SidePanelProps) {
  const nextAction = STATUS_NEXT_ACTION[order.status];
  const isFinal =
    order.status === 'delivered' ||
    order.status === 'cancelled' ||
    order.status === 'refunded';

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed right-0 top-0 bottom-0 z-40 bg-white border-l border-surface-200 shadow-xl',
          'w-full lg:w-[380px] flex flex-col overflow-hidden',
          'animate-slide-up lg:animate-none',
        )}
        role="complementary"
        aria-label="Order detail"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Order {order.orderNumber}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close order detail"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Customer info */}
          <section className="px-5 py-4 border-b border-surface-200 space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Customer
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-semibold shrink-0">
                {order.customerName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{order.customerName}</p>
                <p className="text-xs text-slate-500 truncate">{order.customerEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone size={13} className="text-slate-400 shrink-0" />
              {order.customerPhone}
            </div>
            {order.deliveryAddress && (
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                <span>{order.deliveryAddress}</span>
              </div>
            )}
          </section>

          {/* Fulfillment */}
          <section className="px-5 py-4 border-b border-surface-200">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Fulfillment
            </h3>
            <div className="flex items-center gap-2">
              {order.fulfillmentType === 'delivery' ? (
                <Truck size={14} className="text-sky-500" />
              ) : (
                <Store size={14} className="text-violet-500" />
              )}
              <span className="text-sm text-slate-700 capitalize">
                {order.fulfillmentType.replace('_', ' ')}
              </span>
              <span className="text-slate-300">·</span>
              <StatusBadge
                colorClass={PAYMENT_STATUS_MAP[order.paymentStatus].color}
                label={PAYMENT_STATUS_MAP[order.paymentStatus].label}
              />
            </div>
          </section>

          {/* Order items */}
          <section className="px-5 py-4 border-b border-surface-200">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Items ({order.items.length})
            </h3>
            <ul className="space-y-2.5">
              {order.items.map(item => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded bg-surface-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                      {item.quantity}
                    </span>
                    <span className="text-sm text-slate-700 truncate">
                      {item.productName}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-900 tabular-nums shrink-0">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-3 border-t border-surface-200 space-y-1.5">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Delivery fee</span>
                  <span className="tabular-nums">{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span className="tabular-nums">−{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold text-slate-900 pt-1.5 border-t border-surface-200">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </section>

          {order.notes && (
            <section className="px-5 py-4 border-b border-surface-200">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Notes
              </h3>
              <p className="text-sm text-slate-600">{order.notes}</p>
            </section>
          )}

          <section className="px-5 py-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Status
            </h3>
            <StatusTimeline currentStatus={order.status} />
          </section>
        </div>

        {!isFinal && canEdit && (
          <div className="px-5 py-4 border-t border-surface-200 space-y-2 shrink-0">
            {nextAction && (
              <Button
                variant="primary"
                fullWidth
                icon={<ChevronRight size={16} />}
                onClick={() => onStatusChange(order.id, nextAction.next)}
              >
                {nextAction.label}
              </Button>
            )}
            <Button
              variant="danger"
              fullWidth
              onClick={() => onCancel(order.id)}
            >
              Cancel Order
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersPageContent />
    </Suspense>
  );
}

function OrdersPageContent() {
  const { store, permissions } = useStore();
  const canEdit = permissions.ORDERS === 'EDIT';
  const { success } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const customerPhoneFilter = searchParams.get('phone');
  const customerNameForFilter = searchParams.get('name');
  const orderIdFromUrl = searchParams.get('order');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const token = localStorage.getItem('sl_access_token') ?? localStorage.getItem('authToken');
      if (!token) {
        const { loadStoreOrders } = await import('@/lib/utils/store-scoped-data');
        setOrders(loadStoreOrders(store.slug));
        setLoadingOrders(false);
        return;
      }
      try {
        const { getOrders } = await import('@/lib/api/orders');
        // A store that hasn't been synced to the backend yet has a placeholder "local-*" id —
        // only scope the request once we have a real backend store id to scope it to.
        const realStoreId = store.id.startsWith('local-') ? undefined : store.id;
        const apiOrders = await getOrders(realStoreId);
        setOrders(apiOrders.map(apiOrderToOrder));
      } catch {
        const { loadStoreOrders } = await import('@/lib/utils/store-scoped-data');
        setOrders(loadStoreOrders(store.slug));
      }
      setLoadingOrders(false);
    }
    fetchOrders();
  }, [store.slug, store.id]);

  // Filters
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  // Selected order (side panel) — pre-opened via ?order= (e.g. the Home page's Recent Orders
  // deep link); once `orders` finishes loading, `selectedOrder` below picks it up automatically.
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orderIdFromUrl);

  // ── Derived counts for stat chips ────────────────────────────────────────────

  const counts = useMemo(() => ({
    all:       orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    active:    orders.filter(o =>
      ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status),
    ).length,
    completed: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o =>
      o.status === 'cancelled' || o.status === 'refunded',
    ).length,
  }), [orders]);

  // ── Filtered list ─────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return orders.filter(order => {
      const matchesTab_ = matchesTab(order, activeTab);
      const matchesSearch =
        !search ||
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase());
      const matchesCustomer = !customerPhoneFilter || order.customerPhone === customerPhoneFilter;
      return matchesTab_ && matchesSearch && matchesCustomer;
    });
  }, [orders, activeTab, search, customerPhoneFilter]);

  function clearCustomerFilter() {
    router.replace(pathname, { scroll: false });
  }

  const selectedOrder = orders.find(o => o.id === selectedOrderId) ?? null;

  // ── Handlers ──────────────────────────────────────────────────────────────────

  async function handleStatusChange(orderId: string, next: OrderStatus) {
    // Optimistic update
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: next, updatedAt: new Date().toISOString() } : o,
    ));
    success(`Order status updated to "${ORDER_STATUS_MAP[next].label}".`);

    try {
      const { updateOrderStatus } = await import('@/lib/api/orders');
      await updateOrderStatus(orderId, next);
    } catch {
      // Revert optimistic update on failure
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: 'pending' as OrderStatus } : o,
      ));
    }
  }

  async function handleCancel(orderId: string) {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus, updatedAt: new Date().toISOString() } : o,
    ));
    success('Order has been cancelled.');
    setSelectedOrderId(null);

    try {
      const { updateOrderStatus } = await import('@/lib/api/orders');
      await updateOrderStatus(orderId, 'cancelled');
    } catch {
      // ignore — UI already updated
    }
  }

  return (
    <SectionAccessGate section="ORDERS" pageTitle="Orders">
      <Header
        title="Orders"
        subtitle="Manage and track customer orders"
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">

        {/* ── Stat chips ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
                activeTab === tab.key
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-surface-200 hover:bg-surface-50',
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-bold',
                  activeTab === tab.key
                    ? 'bg-white/25 text-white'
                    : 'bg-surface-100 text-slate-600',
                )}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1 w-full sm:max-w-xs">
            <Input
              placeholder="Search order # or customer…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              prefix={<Search size={15} />}
            />
          </div>
          <span className="text-sm text-slate-500 shrink-0">Today</span>
        </div>

        {/* ── Customer filter chip (arrived via ?phone= from the Customers page) ── */}
        {customerPhoneFilter && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 border border-primary-200 text-sm text-primary-700 w-fit">
            <Filter size={14} className="shrink-0" />
            <span>
              Showing orders for <strong>{customerNameForFilter || customerPhoneFilter}</strong>
            </span>
            <button
              onClick={clearCustomerFilter}
              aria-label="Clear customer filter"
              className="p-0.5 rounded hover:bg-primary-100 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Orders table ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-card border border-surface-200 shadow-card overflow-hidden">
          {loadingOrders ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Package size={28} />}
              title="No orders found"
              description="Try changing your search or filter to find orders."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      Order #
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Customer
                    </th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Items
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Total
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Type
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Payment
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  {filtered.map(order => {
                    const orderMeta    = ORDER_STATUS_MAP[order.status];
                    const paymentMeta  = PAYMENT_STATUS_MAP[order.paymentStatus];
                    const isSelected   = selectedOrderId === order.id;

                    return (
                      <tr
                        key={order.id}
                        onClick={() =>
                          setSelectedOrderId(isSelected ? null : order.id)
                        }
                        className={cn(
                          'cursor-pointer transition-colors duration-150 hover:bg-surface-50',
                          isSelected && 'bg-primary-50',
                        )}
                      >
                        <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                          {order.orderNumber}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">
                            {order.customerName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {order.customerPhone}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">
                          {order.items.length}{' '}
                          {order.items.length === 1 ? 'item' : 'items'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900 tabular-nums whitespace-nowrap">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                              order.fulfillmentType === 'delivery'
                                ? 'bg-sky-100 text-sky-700'
                                : order.fulfillmentType === 'pickup'
                                ? 'bg-violet-100 text-violet-700'
                                : 'bg-amber-100 text-amber-700',
                            )}
                          >
                            {order.fulfillmentType === 'delivery' ? (
                              <Truck size={11} />
                            ) : (
                              <Store size={11} />
                            )}
                            {order.fulfillmentType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            colorClass={paymentMeta.color}
                            label={paymentMeta.label}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            colorClass={orderMeta.color}
                            label={orderMeta.label}
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500 whitespace-nowrap">
                          {formatRelativeTime(order.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-4 py-3 border-t border-surface-200 bg-surface-50 text-xs text-slate-500">
            Showing {filtered.length} of {orders.length} orders
          </div>
        </div>
      </main>

      {/* ── Order detail side panel ───────────────────────────────────────────── */}
      {selectedOrder && (
        <OrderDetailPanel
          order={selectedOrder}
          canEdit={canEdit}
          onClose={() => setSelectedOrderId(null)}
          onStatusChange={handleStatusChange}
          onCancel={handleCancel}
        />
      )}
    </SectionAccessGate>
  );
}
