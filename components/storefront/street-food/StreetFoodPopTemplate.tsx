'use client';

import { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ShoppingCart, User, X } from 'lucide-react';
import { Bungee } from 'next/font/google';
import { Poppins } from 'next/font/google';
import { useToast } from '@/components/ui/Toast';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { createOrder, type DeliveryMethod, type PaymentMethod } from '@/lib/api/checkout';
import { validateOfferCode, type DiscountValidationResult } from '@/lib/api/offers';
import { saveCartDraft, clearCartDraft, readCartDraft } from '@/lib/utils/cart-draft';

const bungee = Bungee({ subsets: ['latin'], weight: ['400'], display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['700', '800', '900'], display: 'swap' });

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  product: PublicProduct;
  qty: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  ketchup: '#FF3B30',
  mustard: '#FFC107',
  black: '#111111',
  white: '#FFFFFF',
} as const;

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  idx,
  currencySuffix,
  onAdd,
}: {
  product: PublicProduct;
  idx: number;
  currencySuffix: string;
  onAdd: () => void;
}) {
  const displayPrice = `${(product.discountPrice ?? product.price).toFixed(2)} ${currencySuffix}`;
  const cardBg = idx % 2 === 0 ? C.mustard : C.white;
  const rotation = idx % 2 === 0 ? 'rotate(-0.8deg)' : 'rotate(0.8deg)';

  return (
    <div
      className="overflow-hidden cursor-pointer"
      style={{
        background: cardBg,
        border: '4px solid #111',
        borderRadius: '16px',
        transform: rotation,
        boxShadow: '4px 4px 0 #111111',
      }}
    >
      {/* Image */}
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-[160px] object-cover w-full"
          loading="lazy"
          style={{ borderBottom: '4px solid #111' }}
        />
      ) : (
        <div
          className="h-[160px] w-full"
          style={{
            borderBottom: '4px solid #111',
            background: 'linear-gradient(135deg, #FF3B30 0%, #FFC107 50%, #FF3B30 100%)',
          }}
        />
      )}

      {/* Content */}
      <div className="p-3">
        <h3
          className={`${bungee.className}`}
          style={{ fontSize: '20px', color: C.black }}
        >
          {product.name}
        </h3>
        <p
          className={`${poppins.className} font-black mt-1`}
          style={{ fontSize: '24px', color: C.ketchup }}
        >
          {displayPrice}
        </p>
        <button
          onClick={onAdd}
          aria-label={`Add ${product.name}`}
          className={`${poppins.className} font-black text-sm inline-flex items-center cursor-pointer mt-2`}
          style={{
            background: C.ketchup,
            color: C.white,
            border: '3px solid #111',
            borderRadius: '12px',
            padding: '8px 16px',
            boxShadow: '2px 2px 0 #111',
          }}
        >
          ADD
        </button>
      </div>
    </div>
  );
}

// ─── Checkout Panel ───────────────────────────────────────────────────────────

function CheckoutPanel({
  cart,
  currencySuffix,
  whatsappNumber,
  shopName,
  storeSlug,
  onClose,
  onOrderPlaced,
}: {
  cart: CartItem[];
  currencySuffix: string;
  whatsappNumber: string | null;
  shopName: string;
  storeSlug: string;
  onClose: () => void;
  onOrderPlaced: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { success, error } = useToast();
  const { user, isAuthenticated } = useCustomerAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [submitting, setSubmitting] = useState(false);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountValidationResult | null>(null);

  useEffect(() => {
    if (!user) return;
    setName((prev) => prev || user.name);
    setEmail((prev) => prev || user.email);
    setPhone((prev) => prev || user.phone || '');
  }, [user]);

  const subtotal = cart.reduce((sum, item) => {
    return sum + (item.product.discountPrice ?? item.product.price) * item.qty;
  }, 0);
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

  const handleWhatsAppOrder = () => {
    if (!whatsappNumber) return;
    const lines = cart
      .map(
        (item) =>
          `• ${item.product.name} ×${item.qty} — ${((item.product.discountPrice ?? item.product.price) * item.qty).toFixed(2)} ${currencySuffix}`,
      )
      .join('\n');
    const msg = `Hello ${shopName}!\n\nMy order:\n${lines}\n\nTotal: ${total.toFixed(2)} ${currencySuffix}`;
    window.open(
      `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`,
      '_blank',
    );
  };

  const handleOrder = async () => {
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
  };

  if (orderCode) {
    return (
      <div
        className="fixed inset-0 z-40 flex items-end"
        style={{ background: 'rgba(17,17,17,0.6)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className="w-full rounded-t-3xl px-5 pt-6 pb-8 text-center"
          style={{ background: C.mustard, borderTop: '4px solid #111' }}
        >
          <h2 className={`${bungee.className} mb-3`} style={{ fontSize: '24px', color: C.black }}>
            ORDER PLACED!
          </h2>
          <p className={`${poppins.className} font-bold text-sm mb-1`} style={{ color: C.black }}>
            Your order code
          </p>
          <p className={`${bungee.className}`} style={{ fontSize: '28px', color: C.ketchup }}>
            {orderCode}
          </p>
          <button
            onClick={onClose}
            className={`${bungee.className} w-full cursor-pointer mt-6`}
            style={{
              height: '56px',
              background: C.black,
              border: '4px solid #111',
              fontSize: '18px',
              color: C.white,
              borderRadius: '12px',
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end"
      style={{ background: 'rgba(17,17,17,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full rounded-t-3xl px-5 pt-6 pb-8 relative"
        style={{
          background: C.mustard,
          borderTop: '4px solid #111',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 cursor-pointer"
          aria-label="Close"
          style={{ color: C.black }}
        >
          <X size={24} strokeWidth={3} />
        </button>

        {/* Title */}
        <h2
          className={`${bungee.className} mb-4`}
          style={{ fontSize: '28px', color: C.black }}
        >
          YOUR ORDER
        </h2>

        {/* Items */}
        <div className="flex flex-col gap-2 mb-4 max-h-[40vh] overflow-y-auto">
          {cart.map((item) => {
            const price = (item.product.discountPrice ?? item.product.price) * item.qty;
            return (
              <div
                key={item.product.id}
                className="flex items-center justify-between py-2"
                style={{ borderBottom: '2px solid rgba(17,17,17,0.2)' }}
              >
                <span
                  className={`${poppins.className} font-bold text-sm`}
                  style={{ color: C.black }}
                >
                  {item.product.name}
                  {item.qty > 1 ? ` ×${item.qty}` : ''}
                </span>
                <span
                  className={`${poppins.className} font-black text-sm`}
                  style={{ color: C.ketchup }}
                >
                  {price.toFixed(2)} {currencySuffix}
                </span>
              </div>
            );
          })}
        </div>

        {/* Discount code */}
        <div className="flex items-center gap-2 mb-3">
          <input
            value={promoCode}
            onChange={(e) => { setPromoCode(e.target.value); setPromoError(null); }}
            placeholder="Discount code"
            className={`${poppins.className} text-sm px-3 py-2 flex-1`}
            style={{ border: '3px solid #111', borderRadius: '10px', background: C.white, color: C.black }}
            disabled={!!appliedDiscount}
          />
          <button
            onClick={handleApplyPromo}
            disabled={!promoCode.trim() || !!appliedDiscount || applyingPromo}
            className={`${poppins.className} font-black text-xs cursor-pointer px-4 py-2`}
            style={{
              border: '3px solid #111',
              borderRadius: '10px',
              background: C.black,
              color: C.mustard,
              opacity: !promoCode.trim() || !!appliedDiscount || applyingPromo ? 0.6 : 1,
            }}
          >
            {applyingPromo ? '...' : 'APPLY'}
          </button>
        </div>
        {promoError && (
          <p className={`${poppins.className} text-xs mb-2`} style={{ color: C.ketchup }}>{promoError}</p>
        )}
        {appliedDiscount && (
          <p className={`${poppins.className} font-bold text-xs mb-2`} style={{ color: '#0A8A3F' }}>
            &quot;{appliedDiscount.code}&quot; applied: -{discountAmount.toFixed(2)} {currencySuffix}
          </p>
        )}

        {/* Total */}
        {appliedDiscount && (
          <div className="flex items-center justify-between mb-1">
            <span className={`${poppins.className} font-bold text-sm`} style={{ color: C.black }}>Subtotal</span>
            <span className={`${poppins.className} font-bold text-sm`} style={{ color: C.black }}>{subtotal.toFixed(2)} {currencySuffix}</span>
          </div>
        )}
        <div className="flex items-center justify-between mb-3">
          <span className={`${bungee.className} text-lg`} style={{ color: C.black }}>
            TOTAL
          </span>
          <span className={`${bungee.className} text-xl`} style={{ color: C.ketchup }}>
            {total.toFixed(2)} {currencySuffix}
          </span>
        </div>

        {/* Delivery / Payment chips */}
        <div className="flex gap-2 mb-3">
          {(['DELIVERY', 'PICKUP'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setDeliveryMethod(m)}
              className={`${poppins.className} font-black text-xs cursor-pointer px-3 py-2 flex-1`}
              style={{
                border: '3px solid #111',
                borderRadius: '10px',
                background: deliveryMethod === m ? C.black : C.white,
                color: deliveryMethod === m ? C.mustard : C.black,
              }}
            >
              {m}
            </button>
          ))}
          {(['CASH', 'CARD'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setPaymentMethod(m)}
              className={`${poppins.className} font-black text-xs cursor-pointer px-3 py-2 flex-1`}
              style={{
                border: '3px solid #111',
                borderRadius: '10px',
                background: paymentMethod === m ? C.black : C.white,
                color: paymentMethod === m ? C.mustard : C.black,
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Contact fields */}
        <div className="flex flex-col gap-2 mb-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className={`${poppins.className} text-sm px-3 py-2 w-full`}
            style={{ border: '3px solid #111', borderRadius: '10px', background: C.white, color: C.black }}
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className={`${poppins.className} text-sm px-3 py-2 w-full`}
            style={{ border: '3px solid #111', borderRadius: '10px', background: C.white, color: C.black }}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
            className={`${poppins.className} text-sm px-3 py-2 w-full`}
            style={{ border: '3px solid #111', borderRadius: '10px', background: C.white, color: C.black }}
          />
          {deliveryMethod === 'DELIVERY' && (
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Delivery address"
              className={`${poppins.className} text-sm px-3 py-2 w-full`}
              style={{ border: '3px solid #111', borderRadius: '10px', background: C.white, color: C.black }}
            />
          )}
        </div>

        {/* Place Order button */}
        <button
          onClick={handleOrder}
          disabled={submitting}
          className={`${bungee.className} w-full cursor-pointer`}
          style={{
            height: '64px',
            background: C.ketchup,
            border: '4px solid #111',
            fontSize: '24px',
            color: C.white,
            borderRadius: '12px',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? '...' : 'PLACE ORDER'}
        </button>

        {whatsappNumber && (
          <button
            onClick={handleWhatsAppOrder}
            className={`${poppins.className} font-bold text-xs w-full cursor-pointer mt-2 underline`}
            style={{ color: C.black }}
          >
            or order via WhatsApp instead
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StreetFoodPopTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;
  const { user, isAuthenticated } = useCustomerAuth();
  const pathname = usePathname();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const draft = readCartDraft(store.slug);
    if (!draft || draft.length === 0) return;
    const restored: CartItem[] = [];
    for (const d of draft) {
      const product = products.find((p) => String(p.id) === d.productId);
      if (product) restored.push({ product, qty: d.qty });
    }
    if (restored.length > 0) {
      setCart(restored);
      setPanelOpen(true);
    }
    clearCartDraft(store.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.slug]);

  const availableProducts = useMemo(
    () => products.filter((p) => p.available),
    [products],
  );

  const categories = useMemo(() => {
    const cats = Array.from(new Set(availableProducts.map((p) => p.category)));
    return ['ALL', ...cats];
  }, [availableProducts]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'ALL') return availableProducts;
    return availableProducts.filter((p) => p.category === activeCategory);
  }, [availableProducts, activeCategory]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const cartTotal = cart.reduce((sum, item) => {
    return sum + (item.product.discountPrice ?? item.product.price) * item.qty;
  }, 0);

  const addToCart = (product: PublicProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: '#F9F9F9', paddingBottom: cartCount > 0 ? '80px' : '24px' }}
    >
      {/* Marquee banner */}
      <div
        className="overflow-hidden flex items-center"
        style={{ height: '36px', background: C.ketchup }}
        aria-hidden="true"
      >
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
        <div
          className={`${poppins.className} font-bold text-xs whitespace-nowrap flex`}
          style={{
            color: C.white,
            letterSpacing: '2px',
            animation: 'marquee 12s linear infinite',
          }}
        >
          <span>
            {tc?.tickerText || '🔥 FREE DELIVERY OVER 20 JOD 🔥 ORDER NOW 🍔 FRESH DAILY 🔥 FREE DELIVERY OVER 20 JOD 🔥 ORDER NOW 🍔 FRESH DAILY 🔥'}{' '}
          </span>
          <span>
            {tc?.tickerText || '🔥 FREE DELIVERY OVER 20 JOD 🔥 ORDER NOW 🍔 FRESH DAILY 🔥 FREE DELIVERY OVER 20 JOD 🔥 ORDER NOW 🍔 FRESH DAILY 🔥'}{' '}
          </span>
        </div>
      </div>

      {/* Header */}
      <header
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: C.mustard, borderBottom: '4px solid #111' }}
      >
        <h1
          className={`${bungee.className}`}
          style={{
            fontSize: '26px',
            color: C.black,
            transform: 'rotate(-1.5deg)',
            display: 'inline-block',
          }}
        >
          {store.shopName}
        </h1>

        <div className="flex items-center gap-2">
          <a
            href={isAuthenticated ? '/customer/account' : `/customer/login?redirect=${encodeURIComponent(pathname)}`}
            className="flex items-center gap-1.5 cursor-pointer px-3 py-2"
            style={{ background: C.white, border: '3px solid #111', borderRadius: '12px' }}
            aria-label={isAuthenticated ? 'My account' : 'Sign in'}
          >
            <User size={16} color={C.black} />
            <span className={`${poppins.className} font-black text-xs hidden sm:inline`} style={{ color: C.black }}>
              {isAuthenticated ? (user?.name?.split(' ')[0] || 'Account') : 'Sign In'}
            </span>
          </a>

          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-2 cursor-pointer px-3 py-2"
            style={{ background: C.black, borderRadius: '12px' }}
            aria-label={`Cart, ${cartCount} items`}
          >
            <ShoppingCart size={20} color={C.white} />
            {cartCount > 0 && (
              <span
                className={`${poppins.className} font-black`}
                style={{
                  background: C.ketchup,
                  color: C.white,
                  borderRadius: '9999px',
                  padding: '2px 6px',
                  fontSize: '10px',
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Categories */}
      <div
        className="px-4 py-2 overflow-x-auto flex gap-2"
        style={{ background: C.white, borderBottom: '4px solid #111' }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`${poppins.className} font-black text-[13px] uppercase cursor-pointer whitespace-nowrap px-4 py-2`}
            style={{
              border: '3px solid #111',
              borderRadius: '12px',
              background: activeCategory === cat ? C.black : C.white,
              color: activeCategory === cat ? C.mustard : C.black,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <div className="flex items-center justify-center py-20 px-6">
          <p
            className={`${bungee.className} text-xl text-center`}
            style={{ color: '#555' }}
          >
            Nothing here yet!
          </p>
        </div>
      ) : (
        <div className="px-3 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-screen-xl mx-auto">
          {filteredProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              idx={idx}
              currencySuffix={store.currencySuffix}
              onAdd={() => addToCart(product)}
            />
          ))}
        </div>
      )}

      {/* Cart FAB */}
      {cartCount > 0 && (
        <button
          onClick={() => setPanelOpen(true)}
          className="fixed bottom-6 right-4 flex items-center gap-2 px-4 py-3 cursor-pointer"
          style={{
            background: C.mustard,
            border: '4px solid #111',
            borderRadius: '16px',
            boxShadow: '4px 4px 0 #111111',
          }}
          aria-label={`View cart, ${cartCount} items`}
        >
          <ShoppingCart size={20} color={C.black} />
          <span
            className={`${poppins.className} font-black text-sm`}
            style={{ color: C.black }}
          >
            {cartCount} items · {cartTotal.toFixed(2)} {store.currencySuffix}
          </span>
        </button>
      )}

      {/* Checkout panel */}
      {panelOpen && (
        <CheckoutPanel
          cart={cart}
          currencySuffix={store.currencySuffix}
          whatsappNumber={store.whatsappNumber}
          shopName={store.shopName}
          storeSlug={store.slug}
          onClose={() => setPanelOpen(false)}
          onOrderPlaced={() => setCart([])}
        />
      )}
    </div>
  );
}
