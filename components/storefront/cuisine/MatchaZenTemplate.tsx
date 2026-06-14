'use client';

import { useState, useMemo } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ChevronUp, X } from 'lucide-react';
import { Noto_Serif } from 'next/font/google';

const notoSerif = Noto_Serif({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  product: PublicProduct;
  qty: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BEIGE = '#F5F5DC';
const MATCHA = '#C5E1A5';
const MATCHA_DEEP = '#8BC34A';
const INK = '#3E4A3F';
const MUTED = '#7A8578';

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductItem({
  product,
  currencySuffix,
  onAdd,
}: {
  product: PublicProduct;
  currencySuffix: string;
  onAdd: (id: number) => void;
}) {
  const displayPrice = (product.discountPrice ?? product.price).toFixed(2);

  return (
    <article className="max-w-[420px] mx-auto w-full">
      {/* Image */}
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full object-cover rounded-[4px]"
          style={{ aspectRatio: '4/5' }}
          loading="lazy"
        />
      ) : (
        <div
          className="w-full rounded-[4px]"
          style={{
            aspectRatio: '4/5',
            background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Name */}
      <h2
        className={`font-medium text-[24px] leading-[1.35] mt-4 ${notoSerif.className}`}
        style={{ color: INK }}
      >
        {product.name}
      </h2>

      {/* Description */}
      {product.description ? (
        <p
          className={`italic text-sm leading-[1.6] mt-1 ${notoSerif.className}`}
          style={{ color: MUTED }}
        >
          {product.description}
        </p>
      ) : null}

      {/* Price */}
      <p
        className={`font-semibold text-[18px] mt-1 ${notoSerif.className}`}
        style={{ color: MATCHA_DEEP }}
      >
        {displayPrice} {currencySuffix}
      </p>

      {/* Add button */}
      <button
        onClick={() => onAdd(product.id)}
        disabled={!product.available || product.stock === 0}
        className={`bg-transparent pb-0.5 text-sm tracking-[1px] cursor-pointer hover:opacity-70 transition-opacity mt-2 disabled:opacity-40 disabled:cursor-not-allowed ${notoSerif.className}`}
        style={{
          color: INK,
          borderBottom: `1px solid ${INK}`,
        }}
        aria-label={`Add ${product.name} to selection`}
      >
        Add to selection
      </button>
    </article>
  );
}

// ─── Order Modal ──────────────────────────────────────────────────────────────

function OrderModal({
  cart,
  store,
  cartTotal,
  onClose,
}: {
  cart: CartItem[];
  store: StorefrontData['store'];
  cartTotal: number;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(62,74,63,0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Your order"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl px-6 pt-6 pb-8"
        style={{
          background: 'rgba(245,245,220,0.97)',
          borderTop: '1px solid rgba(197,225,165,0.6)',
        }}
      >
        {/* Drag handle */}
        <div
          className="w-9 h-1 mx-auto mb-4 rounded-full"
          style={{ background: 'rgba(122,133,120,0.4)' }}
          aria-hidden="true"
        />

        {/* Title row */}
        <div className="flex items-center justify-between mb-5">
          <h2
            className={`font-semibold text-[22px] ${notoSerif.className}`}
            style={{ color: INK }}
          >
            Your selection
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer hover:opacity-70 transition-opacity"
            style={{ background: 'rgba(139,195,74,0.15)' }}
            aria-label="Close order panel"
          >
            <X size={16} color={INK} />
          </button>
        </div>

        {/* Cart items */}
        <ul className="flex flex-col gap-3 mb-5">
          {cart.map((item) => (
            <li key={item.product.id} className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium leading-tight ${notoSerif.className}`}
                  style={{ color: INK }}
                >
                  {item.product.name}
                </p>
                <p
                  className={`text-xs mt-0.5 ${notoSerif.className}`}
                  style={{ color: MUTED }}
                >
                  qty: {item.qty}
                </p>
              </div>
              <p
                className={`font-semibold text-sm ml-4 flex-shrink-0 ${notoSerif.className}`}
                style={{ color: MATCHA_DEEP }}
              >
                {((item.product.discountPrice ?? item.product.price) * item.qty).toFixed(2)}{' '}
                {store.currencySuffix}
              </p>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div
          className="h-px mb-4"
          style={{ background: 'rgba(197,225,165,0.6)' }}
          aria-hidden="true"
        />

        {/* Total */}
        <div className="flex items-center justify-between mb-6">
          <p
            className={`font-semibold text-base ${notoSerif.className}`}
            style={{ color: INK }}
          >
            Total
          </p>
          <p
            className={`font-bold text-[20px] ${notoSerif.className}`}
            style={{ color: INK }}
          >
            {cartTotal.toFixed(2)} {store.currencySuffix}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-3xl border text-sm font-medium cursor-pointer hover:opacity-70 transition-opacity ${notoSerif.className}`}
            style={{ borderColor: INK, color: INK, background: 'transparent' }}
          >
            Continue browsing
          </button>
          <button
            className={`flex-1 py-3 rounded-3xl text-white font-semibold text-sm cursor-pointer hover:opacity-90 transition-opacity ${notoSerif.className}`}
            style={{ background: MATCHA_DEEP }}
            aria-label="Place your order"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MatchaZenTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [modalOpen, setModalOpen] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce(
    (s, i) => s + (i.product.discountPrice ?? i.product.price) * i.qty,
    0
  );

  function addToCart(productId: number) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === productId);
      if (existing)
        return prev.map((i) =>
          i.product.id === productId ? { ...i, qty: i.qty + 1 } : i
        );
      return [...prev, { product, qty: 1 }];
    });
  }

  // Grouped categories
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const p of products) {
      if (!seen.has(p.category)) {
        seen.add(p.category);
        result.push(p.category);
      }
    }
    return result;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products.filter((p) => p.available);
    return products.filter((p) => p.available && p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      style={{ background: BEIGE }}
    >
      {/* ── Left Category Rail (desktop) / Top bar (mobile) ── */}
      <nav
        className={`
          md:w-14 md:sticky md:top-0 md:h-screen md:overflow-hidden md:flex-col md:flex md:flex-shrink-0
          flex flex-row overflow-x-auto h-12 w-full border-b md:border-b-0
        `}
        style={{
          background: 'rgba(197,225,165,0.35)',
          borderRight: '1px solid rgba(197,225,165,0.6)',
          borderBottomColor: 'rgba(197,225,165,0.6)',
          scrollbarWidth: 'none',
        }}
        aria-label="Product categories"
      >
        {['All', ...categories].map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                md:py-6 md:px-0 md:w-full flex items-center justify-center cursor-pointer flex-shrink-0
                px-5 py-2 whitespace-nowrap
                ${notoSerif.className}
              `}
              style={{
                fontWeight: isSelected ? '700' : '400',
                color: isSelected ? INK : MUTED,
                fontSize: '13px',
                background: 'transparent',
                border: 'none',
              }}
              aria-pressed={isSelected}
            >
              {/* Desktop: vertical text */}
              <span
                className="hidden md:inline"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                {cat}
              </span>
              {/* Mobile: horizontal text */}
              <span className="inline md:hidden">{cat}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Main Content ── */}
      <main
        className="flex-1 px-6 py-8 md:py-12 pb-28"
        style={{ background: BEIGE }}
        aria-label="Products"
      >
        <h1
          className={`font-semibold text-[28px] mb-10 ${notoSerif.className}`}
          style={{ color: INK }}
        >
          {store.shopName}
        </h1>

        {filteredProducts.length === 0 ? (
          <p
            className={`text-center py-16 text-sm ${notoSerif.className}`}
            style={{ color: MUTED }}
          >
            No items in this category.
          </p>
        ) : (
          <div className="flex flex-col gap-12">
            {filteredProducts.map((product) => (
              <ProductItem
                key={product.id}
                product={product}
                currencySuffix={store.currencySuffix}
                onAdd={addToCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Floating Checkout Trigger ── */}
      {cartCount > 0 && (
        <button
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-7 py-3.5 flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            background: MATCHA,
            borderRadius: '32px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
          onClick={() => setModalOpen(true)}
          aria-label={`View order, ${cartCount} items, total ${cartTotal.toFixed(2)} ${store.currencySuffix}`}
        >
          <ChevronUp size={18} color={INK} aria-hidden="true" />
          <span
            className={`font-semibold text-[15px] ${notoSerif.className}`}
            style={{ color: INK }}
          >
            View order ({cartCount})&nbsp;&middot;&nbsp;{cartTotal.toFixed(2)} {store.currencySuffix}
          </span>
        </button>
      )}

      {/* ── Order Modal ── */}
      {modalOpen && (
        <OrderModal
          cart={cart}
          store={store}
          cartTotal={cartTotal}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
