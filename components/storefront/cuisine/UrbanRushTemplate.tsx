'use client';
import { formatMoney } from '@/lib/utils';

import { useEffect, useState, useMemo } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ShoppingCart, PlusCircle, Coffee } from 'lucide-react';
import CheckoutDrawer from '@/components/storefront/restaurant-default/CheckoutDrawer';
import { ProductOptionsDialog } from '@/components/storefront/shared/ProductOptionsDialog';
import { readCartDraft, clearCartDraft } from '@/lib/utils/cart-draft';
import {
  addLine, cartCount as countOf, cartSubtotal, changeQty as changeLineQty, needsOptions, removeLine, restoreFromDraft,
  type CartLine,
} from '@/lib/utils/cart-lines';

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#F5F5F5',
  surface: '#FFFFFF',
  ink: '#111111',
  muted: '#6B6B6B',
  accent: '#E85D04',
  barBg: '#1A1A1A',
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductCard({
  product,
  currencySuffix,
  onAdd,
}: {
  product: PublicProduct;
  currencySuffix: string;
  onAdd: (id: number) => void;
}) {
  const displayPrice = formatMoney((product.discountPrice ?? product.price), currencySuffix);

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
      style={{ backgroundColor: COLORS.surface }}
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-[130px] w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="h-[130px] w-full flex items-center justify-center"
          style={{ backgroundColor: '#EAEAEA' }}
          aria-hidden="true"
        >
          <Coffee size={32} color={COLORS.muted} />
        </div>
      )}

      <div className="p-2.5 relative">
        <p
          className="text-[13px] font-extrabold leading-tight line-clamp-2"
          style={{ color: COLORS.ink }}
        >
          {product.name}
        </p>

        <div className="flex items-center justify-between mt-1">
          <span
            className="font-black text-sm"
            style={{ color: COLORS.accent }}
          >
            {displayPrice}
          </span>
          <button
            onClick={() => onAdd(product.id)}
            className="cursor-pointer transition-transform active:scale-90"
            style={{ color: COLORS.accent }}
            aria-label={`Add ${product.name} to cart`}
          >
            <PlusCircle size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UrbanRushTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;

  // ── Cart state ──
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

  // ── Categories ──
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
    if (selectedCategory === 'All') return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: COLORS.bg }}
    >
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-20 px-4 py-3 flex items-center justify-between gap-2"
        style={{
          backgroundColor: COLORS.surface,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="font-black text-xl"
            style={{ color: COLORS.ink, fontFamily: 'var(--font-plus-jakarta-sans, sans-serif)' }}
          >
            {store.shopName}
          </span>
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded tracking-wider text-white"
            style={{ backgroundColor: COLORS.accent }}
            aria-label="Rush delivery available"
          >
            RUSH
          </span>
        </div>

        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center justify-center w-11 h-11 cursor-pointer"
          style={{ color: COLORS.ink }}
          aria-label={`Cart, ${cartCount} items`}
        >
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <span
              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white leading-none font-black"
              style={{ backgroundColor: COLORS.accent, fontSize: '10px' }}
              aria-hidden="true"
            >
              {cartCount}
            </span>
          )}
        </button>
      </header>

      {/* ── Category Chips ── */}
      <nav
        className="sticky z-10 px-4 py-2 flex gap-2 overflow-x-auto border-b"
        style={{
          top: '52px',
          backgroundColor: COLORS.surface,
          borderColor: '#EEEEEE',
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
              className="flex-shrink-0 h-10 px-4 rounded-full text-sm font-bold cursor-pointer transition-colors whitespace-nowrap"
              style={{
                backgroundColor: isSelected ? COLORS.ink : '#EEEEEE',
                color: isSelected ? '#FFFFFF' : COLORS.muted,
              }}
              aria-pressed={isSelected}
            >
              {cat}
            </button>
          );
        })}
      </nav>

      {/* ── Product Grid ── */}
      <main className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pb-24 max-w-screen-xl mx-auto">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currencySuffix={store.currencySuffix}
            onAdd={addToCart}
          />
        ))}
        {filteredProducts.length === 0 && (
          <p
            className="col-span-2 sm:col-span-3 lg:col-span-4 text-center py-12 text-sm"
            style={{ color: COLORS.muted }}
          >
            No items in this category.
          </p>
        )}
      </main>

      {/* ── Cart Bar ── */}
      {cartCount > 0 && (
        <div
          className="fixed bottom-0 inset-x-0 z-40 px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: COLORS.barBg }}
          aria-live="polite"
          aria-label="Cart summary"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} color="#FFFFFF" aria-hidden="true" />
            <span className="font-semibold text-sm text-white">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} &middot;{' '}
              {formatMoney(cartTotal, store.currencySuffix)}
            </span>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="px-4 py-2 rounded-xl font-extrabold text-sm cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: COLORS.accent, color: '#000000' }}
            aria-label="Proceed to checkout"
          >
            CHECKOUT
          </button>
        </div>
      )}

      <ProductOptionsDialog
        product={optionsFor}
        currencySuffix={store.currencySuffix}
        accent={COLORS.accent}
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
