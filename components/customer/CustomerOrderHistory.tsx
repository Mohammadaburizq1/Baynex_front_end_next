'use client';

import { useEffect, useState } from 'react';
import { customerOrder, customerOrders, type CustomerOrder } from '@/lib/api/customer-auth';

function money(value: number, currency: string | null | undefined) {
  if (!currency) {
    return `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })} (currency unknown)`;
  }
  // The currency's own minor units (JOD 3.500, USD 3.50), matching the storefront prices.
  let digits = 2;
  try {
    digits = new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch { /* not an ISO code: keep 2 */ }
  return `${value.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${currency}`;
}

function OrderDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    customerOrder(id).then(value => { if (active) setOrder(value); })
      .catch(() => { if (active) setError('Could not load this order. It may no longer be available.'); });
    return () => { active = false; };
  }, [id]);
  return <section aria-label="Order detail" className="mt-4 border border-surface-200 rounded-xl p-4">
    <button type="button" onClick={onClose} className="text-sm font-semibold text-primary-600 mb-3">Back to orders</button>
    {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : !order ? <p role="status">Loading order…</p> : <>
      <h3 className="font-bold text-slate-900">Order {order.orderCode}</h3>
      <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()} · {order.status}</p>
      <p className="text-sm mt-2">{order.deliveryMethod === 'PICKUP' ? 'Pickup' : order.deliveryMethod === 'DELIVERY' ? 'Delivery' : 'Fulfillment unknown'}</p>
      {order.customerAddress && <p className="text-sm">{order.customerAddress}</p>}
      <ul className="divide-y divide-surface-200 my-4">{order.items.map(item => <li key={item.id} className="py-3 text-sm">
        <p className="font-semibold">{item.quantity} × {item.productNameSnapshot}</p>
        {item.variantLabel && <p>{item.variantLabel}</p>}
        {item.modifiers.map((modifier, index) => <p key={index} className="text-slate-500">{modifier.groupName}: {modifier.optionName} ({money(modifier.priceDelta, order.currency)})</p>)}
        <p>{money(item.unitPrice, order.currency)} each · {money(item.total, order.currency)}</p>
      </li>)}</ul>
      <dl className="text-sm space-y-2">{[
        ['Subtotal', order.subtotal], ['Discount', order.discount === 0 ? 0 : -order.discount], ['Delivery fee', order.deliveryFee], ['Total', order.total],
      ].map(([label, value]) => <div key={label} className="flex justify-between"><dt>{label}</dt><dd>{money(value as number, order.currency)}</dd></div>)}</dl>
      {order.notes && <p className="text-sm mt-3">{order.notes}</p>}
    </>}
  </section>;
}

// The parent keys this component by authenticated user ID so data cannot survive an account switch.
export default function CustomerOrderHistory() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setOrders([]);
    customerOrders(page).then(value => { if (active) setOrders(value); })
      .catch(() => { if (active) setError('Could not load your orders.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt, page]);
  return <section className="bg-white border border-surface-200 rounded-2xl p-6">
    <h2 className="text-base font-bold text-slate-900 mb-4">Order history</h2>
    {selected ? <OrderDetail key={selected} id={selected} onClose={() => setSelected(null)} /> : loading ? <p role="status" className="text-sm text-slate-500">Loading orders…</p> : error ? <div><p role="alert" className="text-sm text-red-600">{error}</p><button type="button" onClick={() => setAttempt(value => value + 1)} className="text-sm font-semibold mt-2">Try again</button></div> : orders.length === 0 ? <p className="text-sm text-slate-500">{page === 0 ? 'No orders yet.' : 'No more orders.'}</p> : <div className="space-y-3">{orders.map(order => <article key={order.id} className="border border-surface-200 rounded-xl p-4">
      <div className="flex items-center justify-between"><div><h3 className="font-bold text-slate-900">{order.orderCode}</h3><p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p></div><span className="text-xs font-semibold uppercase text-slate-500">{order.status}</span></div>
      <p className="text-sm text-slate-600 mt-2">{order.deliveryMethod === 'PICKUP' ? 'Pickup' : order.deliveryMethod === 'DELIVERY' ? 'Delivery' : 'Fulfillment unknown'} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p>
      <p className="text-sm font-bold text-slate-900 mt-2">{money(order.total, order.currency)}</p>
      <button type="button" onClick={() => setSelected(order.id)} className="text-sm font-semibold text-primary-600 mt-2" aria-label={`View order ${order.orderCode}`}>View order</button>
    </article>)}</div>}
    {!selected && !loading && !error && <nav aria-label="Order history pages" className="flex justify-between mt-4 text-sm font-semibold">
      <button type="button" disabled={page === 0} onClick={() => setPage(value => value - 1)} className="disabled:opacity-40">Previous</button>
      <span>Page {page + 1}</span>
      <button type="button" disabled={orders.length < 20} onClick={() => setPage(value => value + 1)} className="disabled:opacity-40">Next</button>
    </nav>}
  </section>;
}
