'use client';
import { formatMoney } from '@/lib/utils';

import { useEffect, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { createOrder, type DeliveryMethod, type PaymentMethod } from '@/lib/api/checkout';
import { validateOfferCode, type DiscountValidationResult } from '@/lib/api/offers';
import { getPublicBusinessHours } from '@/lib/api/business-hours';
import { getPublicFulfillment, type ApiDeliveryZone } from '@/lib/api/delivery';
import { clearCartDraft } from '@/lib/utils/cart-draft';
import {
  cartSubtotal, describeSelection, lineKey, lineTotal, toOrderItems, type CartLine,
} from '@/lib/utils/cart-lines';

interface CheckoutDrawerProps {
  open: boolean;
  onClose: () => void;
  storeSlug: string;
  cart: CartLine[];
  currencySuffix: string;
  /** Lines are identified by lineKey (product + variant + add-ons), not by product id alone. */
  onChangeQty: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
  onOrderPlaced: () => void;
}

export default function CheckoutDrawer({
  open,
  onClose,
  storeSlug,
  cart,
  currencySuffix,
  onChangeQty,
  onRemove,
  onOrderPlaced,
}: CheckoutDrawerProps) {
  const { success, error } = useToast();
  const { user } = useCustomerAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [submitting, setSubmitting] = useState(false);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountValidationResult | null>(null);
  const [canAcceptOrders, setCanAcceptOrders] = useState(true);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [zones, setZones] = useState<ApiDeliveryZone[]>([]);
  const [pickupAvailable, setPickupAvailable] = useState(false);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number | null>(null);
  const [deliveryZoneId, setDeliveryZoneId] = useState('');

  useEffect(() => {
    if (!open || !user) return;
    setOrderCode(null);
    setName((prev) => prev || user.name);
    setEmail((prev) => prev || user.email);
    setPhone((prev) => prev || user.phone || '');
  }, [open, user]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getPublicBusinessHours(storeSlug).then(status => {
      if (cancelled) return;
      setCanAcceptOrders(status.canAcceptOrders);
      setAvailabilityMessage(status.canAcceptOrders ? null : status.status === 'CLOSED'
        ? 'This store is currently closed.'
        : 'Online ordering is temporarily paused.');
    }).catch(() => {
      if (!cancelled) {
        setCanAcceptOrders(true);
        setAvailabilityMessage(null);
      }
    });
    return () => { cancelled = true; };
  }, [open, storeSlug]);

  useEffect(() => {
    if (!open) return;
    getPublicFulfillment(storeSlug).then(config => {
      setZones(config.zones.filter(z => z.isActive));
      setPickupAvailable(config.pickupAvailable);
      setFreeDeliveryThreshold(config.freeDeliveryThreshold ?? null);
      if (!config.deliveryAvailable && config.pickupAvailable) setDeliveryMethod('PICKUP');
    }).catch(() => { setZones([]); setPickupAvailable(false); });
  }, [open, storeSlug]);

  const subtotal = cartSubtotal(cart);
  const discountAmount = appliedDiscount?.amount ?? 0;
  const selectedZone = zones.find(zone => zone.id === deliveryZoneId);
  const deliveryFee = deliveryMethod === 'DELIVERY' && selectedZone
    && !(freeDeliveryThreshold && freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold)
    ? selectedZone.deliveryFee : 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  async function handleApplyPromo() {
    if (!promoCode.trim()) return;
    setApplyingPromo(true);
    setPromoError(null);
    try {
      const result = await validateOfferCode(storeSlug, promoCode.trim(), subtotal);
      setAppliedDiscount(result);
    } catch (e) {
      setAppliedDiscount(null);
      setPromoError(e instanceof Error ? e.message : 'Invalid code.');
    } finally {
      setApplyingPromo(false);
    }
  }

  async function handlePlaceOrder() {
    if (!name.trim() || !phone.trim()) {
      error('Name and phone are required.');
      return;
    }
    if (deliveryMethod === 'DELIVERY' && !address.trim()) {
      error('Delivery address is required.');
      return;
    }
    if (deliveryMethod === 'DELIVERY' && !deliveryZoneId) {
      error('Select a delivery zone.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createOrder(storeSlug, {
        customerName: name.trim(),
        customerEmail: email.trim() || undefined,
        customerPhone: phone.trim(),
        customerAddress: address.trim() || undefined,
        deliveryMethod,
        paymentMethod,
        deliveryFee,
        deliveryZoneId: deliveryMethod === 'DELIVERY' ? deliveryZoneId : undefined,
        discountCode: appliedDiscount?.code,
        notes: notes.trim() || undefined,
        items: toOrderItems(cart),
      });
      setOrderCode(res.orderCode);
      setPromoCode('');
      setAppliedDiscount(null);
      clearCartDraft(storeSlug);
      success(`Order placed! Code ${res.orderCode}`);
      onOrderPlaced();
    } catch (e) {
      error(e instanceof Error ? e.message : 'Could not place order.');
    } finally {
      setSubmitting(false);
    }
  }

  if (orderCode) {
    return (
      <Modal open={open} onClose={onClose} title="Order placed!" size="sm">
        <div className="text-center py-4">
          <p className="text-sm text-slate-600 mb-2">Your order code is</p>
          <p className="text-2xl font-extrabold tracking-wide text-slate-900">{orderCode}</p>
          <Button className="mt-6" fullWidth onClick={onClose}>Close</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Your Order" size="md">
      <div className="flex flex-col gap-4">
        {cart.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">Your cart is empty.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {cart.map((item) => {
              const key = lineKey(item);
              const price = lineTotal(item);
              const details = describeSelection(item);
              return (
                <div key={key} className="flex items-center gap-3 py-2 border-b border-surface-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.product.name}</p>
                    {details.length > 0 && (
                      <p className="text-xs text-slate-500 truncate">{details.join(' · ')}</p>
                    )}
                    <p className="text-sm text-slate-500">{formatMoney(price, currencySuffix)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onChangeQty(key, -1)}
                      className="w-7 h-7 rounded-full border border-surface-200 flex items-center justify-center cursor-pointer hover:bg-surface-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-4 text-center text-sm font-semibold">{item.qty}</span>
                    <button
                      onClick={() => onChangeQty(key, 1)}
                      className="w-7 h-7 rounded-full border border-surface-200 flex items-center justify-center cursor-pointer hover:bg-surface-50"
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => onRemove(key)}
                      className="p-1 rounded hover:bg-surface-100 cursor-pointer"
                      aria-label={`Remove ${item.product.name}`}
                    >
                      <X size={14} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              );
            })}
            {appliedDiscount && (
              <div className="flex items-center justify-between pt-2 text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-700">{formatMoney(subtotal, currencySuffix)}</span>
              </div>
            )}
            {appliedDiscount && (
              <div className="flex items-center justify-between text-sm text-emerald-600">
                <span>Discount ({appliedDiscount.code})</span>
                <span>-{formatMoney(discountAmount, currencySuffix)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-slate-500">Total</span>
              <span className="text-lg font-extrabold text-slate-900">{formatMoney(total, currencySuffix)}</span>
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="Discount code (optional)"
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value); setPromoError(null); }}
                  placeholder="e.g. SAVE10"
                />
              </div>
              <Button
                variant="secondary"
                loading={applyingPromo}
                disabled={!promoCode.trim() || !!appliedDiscount}
                onClick={handleApplyPromo}
              >
                Apply
              </Button>
            </div>
            {promoError && <p className="text-sm text-red-600 -mt-2">{promoError}</p>}
            {availabilityMessage && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{availabilityMessage}</p>}
            {appliedDiscount && (
              <p className="text-sm text-emerald-600 -mt-2">
                Code &quot;{appliedDiscount.code}&quot; applied: -{formatMoney(discountAmount, currencySuffix)}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Delivery"
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
                options={[
                  ...(zones.length > 0 ? [{ value: 'DELIVERY', label: 'Delivery' }] : []),
                  ...(pickupAvailable ? [{ value: 'PICKUP', label: 'Pickup' }] : []),
                ]}
              />
              <Select
                label="Payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                options={[{ value: 'CASH', label: 'Cash' }, { value: 'CARD', label: 'Card' }]}
              />
            </div>
            {deliveryMethod === 'DELIVERY' && <Select label="Delivery zone" value={deliveryZoneId} onChange={e => setDeliveryZoneId(e.target.value)} options={[{ value: '', label: 'Select a zone' }, ...zones.map(zone => ({ value: zone.id, label: `${zone.name} (${formatMoney(zone.deliveryFee, currencySuffix)})` }))]} />}
            <Input label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {deliveryMethod === 'DELIVERY' && (
              <Input label="Delivery address" required value={address} onChange={(e) => setAddress(e.target.value)} />
            )}
            <Textarea label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button fullWidth size="lg" loading={submitting} disabled={!canAcceptOrders} onClick={handlePlaceOrder}>
              {canAcceptOrders ? 'Place Order' : 'Ordering unavailable'}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
