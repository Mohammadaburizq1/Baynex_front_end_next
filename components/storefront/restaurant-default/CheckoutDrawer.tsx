'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Minus, Plus, X } from 'lucide-react';
import type { PublicProduct } from '@/lib/types/store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { createOrder, type DeliveryMethod, type PaymentMethod } from '@/lib/api/checkout';
import { validateOfferCode, type DiscountValidationResult } from '@/lib/api/offers';
import { saveCartDraft, clearCartDraft } from '@/lib/utils/cart-draft';

interface CartItem {
  product: PublicProduct;
  qty: number;
}

interface CheckoutDrawerProps {
  open: boolean;
  onClose: () => void;
  storeSlug: string;
  cart: CartItem[];
  currencySuffix: string;
  onChangeQty: (productId: number, delta: number) => void;
  onRemove: (productId: number) => void;
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
  const router = useRouter();
  const pathname = usePathname();
  const { success, error } = useToast();
  const { user, isAuthenticated } = useCustomerAuth();

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

  useEffect(() => {
    if (!open || !user) return;
    setOrderCode(null);
    setName((prev) => prev || user.name);
    setEmail((prev) => prev || user.email);
    setPhone((prev) => prev || user.phone || '');
  }, [open, user]);

  const subtotal = cart.reduce((sum, item) => sum + (item.product.discountPrice ?? item.product.price) * item.qty, 0);
  const discountAmount = appliedDiscount?.amount ?? 0;
  const total = Math.max(0, subtotal - discountAmount);

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
    if (!isAuthenticated) {
      saveCartDraft(storeSlug, cart.map((item) => ({ productId: String(item.product.id), qty: item.qty })));
      router.push(`/customer/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!name.trim() || !phone.trim()) {
      error('Name and phone are required.');
      return;
    }
    if (deliveryMethod === 'DELIVERY' && !address.trim()) {
      error('Delivery address is required.');
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
        deliveryFee: 0,
        discountCode: appliedDiscount?.code,
        notes: notes.trim() || undefined,
        items: cart.map((item) => ({ productId: String(item.product.id), quantity: item.qty })),
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
              const price = (item.product.discountPrice ?? item.product.price) * item.qty;
              return (
                <div key={item.product.id} className="flex items-center gap-3 py-2 border-b border-surface-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-sm text-slate-500">{price.toFixed(2)} {currencySuffix}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onChangeQty(item.product.id, -1)}
                      className="w-7 h-7 rounded-full border border-surface-200 flex items-center justify-center cursor-pointer hover:bg-surface-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-4 text-center text-sm font-semibold">{item.qty}</span>
                    <button
                      onClick={() => onChangeQty(item.product.id, 1)}
                      className="w-7 h-7 rounded-full border border-surface-200 flex items-center justify-center cursor-pointer hover:bg-surface-50"
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => onRemove(item.product.id)}
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
                <span className="text-slate-700">{subtotal.toFixed(2)} {currencySuffix}</span>
              </div>
            )}
            {appliedDiscount && (
              <div className="flex items-center justify-between text-sm text-emerald-600">
                <span>Discount ({appliedDiscount.code})</span>
                <span>-{discountAmount.toFixed(2)} {currencySuffix}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-slate-500">Total</span>
              <span className="text-lg font-extrabold text-slate-900">{total.toFixed(2)} {currencySuffix}</span>
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
            {appliedDiscount && (
              <p className="text-sm text-emerald-600 -mt-2">
                Code &quot;{appliedDiscount.code}&quot; applied: -{discountAmount.toFixed(2)} {currencySuffix}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Delivery"
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
                options={[{ value: 'DELIVERY', label: 'Delivery' }, { value: 'PICKUP', label: 'Pickup' }]}
              />
              <Select
                label="Payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                options={[{ value: 'CASH', label: 'Cash' }, { value: 'CARD', label: 'Card' }]}
              />
            </div>
            <Input label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {deliveryMethod === 'DELIVERY' && (
              <Input label="Delivery address" required value={address} onChange={(e) => setAddress(e.target.value)} />
            )}
            <Textarea label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button fullWidth size="lg" loading={submitting} onClick={handlePlaceOrder}>
              Place Order
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
