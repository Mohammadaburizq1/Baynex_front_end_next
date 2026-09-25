'use client';
import { formatMoney } from '@/lib/utils';

import { useEffect, useState, useMemo } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { Zap, ShoppingCart } from 'lucide-react';
import { Orbitron } from 'next/font/google';
import { Space_Grotesk } from 'next/font/google';
import CheckoutDrawer from '@/components/storefront/restaurant-default/CheckoutDrawer';
import { ProductOptionsDialog } from '@/components/storefront/shared/ProductOptionsDialog';
import { readCartDraft, clearCartDraft } from '@/lib/utils/cart-draft';
import {
  addLine, cartCount as countOf, cartSubtotal, changeQty as changeLineQty, needsOptions, removeLine, restoreFromDraft,
  type CartLine,
} from '@/lib/utils/cart-lines';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '800'], display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '700'], display: 'swap' });

// ─── Constants ────────────────────────────────────────────────────────────────

const CYAN = '#00F5FF';
const MAGENTA = '#FF2BD6';
const GREEN = '#39FF14';
const TEXT = '#F2F4FF';
const MUTED = '#9AA3C7';

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductCard({
  product,
  idx,
  currencySuffix,
  onAdd,
}: {
  product: PublicProduct;
  idx: number;
  currencySuffix: string;
  onAdd: (id: number) => void;
}) {
  const neonColor = idx % 2 === 0 ? CYAN : MAGENTA;
  const imgHeight = idx % 2 === 0 ? 120 : 168;
  const displayPrice = formatMoney(product.discountPrice ?? product.price, currencySuffix);

  return (
    <div
      className="rounded-[20px] p-2.5 cursor-pointer"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${neonColor}59`,
        backdropFilter: 'blur(8px)',
        boxShadow: `0 0 20px ${neonColor}14`,
      }}
    >
      {/* Image */}
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="rounded-2xl object-cover w-full"
          style={{ height: imgHeight }}
          loading="lazy"
        />
      ) : (
        <div
          className="rounded-2xl w-full flex items-center justify-center"
          style={{
            height: imgHeight,
            background: 'linear-gradient(135deg, #0D0020, #1A003A)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Name */}
      <p
        className={`font-bold text-sm leading-tight line-clamp-2 mt-2 ${spaceGrotesk.className}`}
        style={{ color: TEXT }}
      >
        {product.name}
      </p>

      {/* Description */}
      {product.description ? (
        <p
          className={`text-[11px] leading-[1.25] mt-0.5 line-clamp-2 ${spaceGrotesk.className}`}
          style={{ color: MUTED }}
        >
          {product.description}
        </p>
      ) : null}

      {/* Price */}
      <p
        className={`font-bold text-[13px] mt-1 ${orbitron.className}`}
        style={{ color: neonColor }}
      >
        {displayPrice}
      </p>

      {/* Add button */}
      <button
        onClick={() => onAdd(product.id)}
        className={`rounded-full px-4 py-2 mt-2 text-black font-bold text-[11px] cursor-pointer uppercase tracking-[1px] w-full ${orbitron.className}`}
        style={{
          background: `linear-gradient(135deg, ${neonColor}, ${MAGENTA})`,
          boxShadow: `0 0 14px ${neonColor}8C`,
        }}
        aria-label={`Add ${product.name} to cart`}
      >
        ADD
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CyberBrewTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;

  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  // The product whose variant / add-on choices are being made (null = dialog closed).
  const [optionsFor, setOptionsFor] = useState<PublicProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Restore a cart saved before a guest was redirected to /customer/login (see CheckoutDrawer).
  useEffect(() => {
    const draft = readCartDraft(store.slug);
    if (!draft || draft.length === 0) return;
    const restored = restoreFromDraft(draft, products);
    if (restored.length > 0) {
      setCart(restored);
      setCartOpen(true);
    }
    clearCartDraft(store.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.slug]);

  const cartCount = countOf(cart);
  const cartTotal = cartSubtotal(cart);

  function addToCart(productId: number) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    // A product with variants or add-ons needs the customer to choose first.
    if (needsOptions(product)) {
      setOptionsFor(product);
      return;
    }
    setCart((prev) => addLine(prev, product, 1));
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

  // Masonry: split into two columns by index parity
  const leftCol = filteredProducts.filter((_, i) => i % 2 === 0);
  const rightCol = filteredProducts.filter((_, i) => i % 2 !== 0);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #0A0014 0%, #050508 100%)' }}
    >
      {/* ── Sticky Header ── */}
      <header
        className="sticky top-0 z-20 px-4 py-3 flex items-center gap-3"
        style={{
          background: 'rgba(10,0,20,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0,245,255,0.15)',
        }}
      >
        {/* Icon box */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #00F5FF, #FF2BD6)' }}
          aria-hidden="true"
        >
          <Zap size={18} color="#000000" />
        </div>

        {/* Shop name + status */}
        <div className="flex-1 min-w-0">
          <p
            className={`font-bold text-base leading-tight truncate ${orbitron.className}`}
            style={{ color: TEXT }}
          >
            {store.shopName}
          </p>
          <p
            className={`text-[11px] ml-0 ${spaceGrotesk.className}`}
            style={{ color: MUTED }}
          >
            Open&nbsp;&middot;&nbsp;guest checkout ready
          </p>
        </div>

        {/* Cart button */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center justify-center w-10 h-10 flex-shrink-0 cursor-pointer"
          aria-label={`Cart, ${cartCount} items`}
        >
          <ShoppingCart size={22} color={TEXT} />
          {cartCount > 0 && (
            <span
              className="absolute top-0 right-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold leading-none"
              style={{ background: MAGENTA, color: '#000' }}
              aria-hidden="true"
            >
              {cartCount}
            </span>
          )}
        </button>
      </header>

      {/* ── Hero ── */}
      <section className="px-5 pt-5 pb-3 relative overflow-hidden">
        {/* Ambient glow — magenta top-right */}
        <div
          className="absolute top-0 right-0 w-[220px] h-[220px] rounded-full pointer-events-none"
          style={{ background: 'rgba(255,43,214,0.18)', filter: 'blur(120px)' }}
          aria-hidden="true"
        />
        {/* Ambient glow — cyan bottom-left */}
        <div
          className="absolute bottom-0 left-0 w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{ background: 'rgba(0,245,255,0.15)', filter: 'blur(100px)' }}
          aria-hidden="true"
        />

        <p
          className={`text-[11px] font-bold tracking-[4px] mb-2 relative ${orbitron.className}`}
          style={{ color: 'rgba(0,245,255,0.85)' }}
        >
          NEON MENU
        </p>
        <h1
          className={`font-bold text-[22px] leading-tight relative ${spaceGrotesk.className}`}
          style={{ color: TEXT }}
        >
          {store.shopName}
        </h1>
        {(tc?.heroDescription || store.description) ? (
          <p
            className={`text-[13px] mt-1 relative ${spaceGrotesk.className}`}
            style={{ color: MUTED }}
          >
            {tc?.heroDescription || store.description}
          </p>
        ) : null}
      </section>

      {/* ── Category Chips ── */}
      <nav
        className="px-4 py-2 flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
        aria-label="Product categories"
      >
        {['All', ...categories].map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 font-bold text-xs uppercase tracking-[0.6px] cursor-pointer transition-all whitespace-nowrap flex-shrink-0 ${spaceGrotesk.className}`}
              style={
                isSelected
                  ? {
                      background: 'rgba(0,245,255,0.22)',
                      border: `1px solid ${CYAN}`,
                      color: CYAN,
                      boxShadow: '0 0 12px rgba(0,245,255,0.4)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(0,245,255,0.2)',
                      color: MUTED,
                    }
              }
              aria-pressed={isSelected}
            >
              {cat}
            </button>
          );
        })}
      </nav>

      {/* ── Product Grid (2-column masonry, expands to 3 on lg) ── */}
      <main className="px-3 py-3 pb-28 max-w-screen-lg mx-auto" aria-label="Products">
        {filteredProducts.length === 0 ? (
          <p
            className={`text-center py-16 text-sm ${spaceGrotesk.className}`}
            style={{ color: MUTED }}
          >
            No items in this category.
          </p>
        ) : (
          <div className="flex gap-2.5">
            {/* Left column */}
            <div className="flex flex-col gap-2.5 flex-1">
              {leftCol.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  idx={i * 2}
                  currencySuffix={store.currencySuffix}
                  onAdd={addToCart}
                />
              ))}
            </div>
            {/* Right column */}
            <div className="flex flex-col gap-2.5 flex-1">
              {rightCol.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  idx={i * 2 + 1}
                  currencySuffix={store.currencySuffix}
                  onAdd={addToCart}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Checkout Bar ── */}
      {cartCount > 0 && (
        <div
          className="fixed bottom-0 inset-x-0 z-30 px-4 py-3 flex items-center gap-3"
          style={{
            background: 'rgba(10,0,20,0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(0,245,255,0.2)',
          }}
          aria-live="polite"
          aria-label="Cart summary"
        >
          <ShoppingCart size={20} color={GREEN} aria-hidden="true" />
          <p
            className={`flex-1 font-semibold text-sm ${spaceGrotesk.className}`}
            style={{ color: TEXT }}
          >
            {cartCount} power-up{cartCount !== 1 ? 's' : ''} queued&nbsp;&middot;&nbsp;
            {formatMoney(cartTotal, store.currencySuffix)}
          </p>
          <button
            onClick={() => setCartOpen(true)}
            className={`rounded-2xl px-5 py-2.5 font-bold text-sm cursor-pointer ${spaceGrotesk.className}`}
            style={{
              background: MAGENTA,
              color: '#000',
              boxShadow: '0 0 16px rgba(255,43,214,0.5)',
            }}
            aria-label="Proceed to checkout"
          >
            CHECKOUT
          </button>
        </div>
      )}

      <ProductOptionsDialog
        product={optionsFor}
        currencySuffix={store.currencySuffix}
        accent={CYAN}
        onClose={() => setOptionsFor(null)}
        onConfirm={(selection, qty) => {
          if (optionsFor) setCart((prev) => addLine(prev, optionsFor, qty, selection));
          setOptionsFor(null);
        }}
      />
      <CheckoutDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        storeSlug={store.slug}
        cart={cart}
        currencySuffix={store.currencySuffix}
        onChangeQty={(key, delta) => setCart((prev) => changeLineQty(prev, key, delta))}
        onRemove={(key) => setCart((prev) => removeLine(prev, key))}
        onOrderPlaced={() => setCart([])}
      />
    </div>
  );
}
