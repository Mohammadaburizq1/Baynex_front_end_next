'use client';
import { formatMoney } from '@/lib/utils';

import { useEffect, useState, useMemo } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ChevronUp } from 'lucide-react';
import { Noto_Serif } from 'next/font/google';
import CheckoutDrawer from '@/components/storefront/restaurant-default/CheckoutDrawer';
import { ProductOptionsDialog } from '@/components/storefront/shared/ProductOptionsDialog';
import { readCartDraft, clearCartDraft } from '@/lib/utils/cart-draft';
import {
  addLine, cartCount as countOf, cartSubtotal, changeQty as changeLineQty, needsOptions, removeLine, restoreFromDraft,
  type CartLine,
} from '@/lib/utils/cart-lines';

const notoSerif = Noto_Serif({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });

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
  const displayPrice = formatMoney(product.discountPrice ?? product.price, currencySuffix);

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
        {displayPrice}
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MatchaZenTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;

  const [cart, setCart] = useState<CartLine[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [modalOpen, setModalOpen] = useState(false);
  // The product whose variant / add-on choices are being made (null = dialog closed).
  const [optionsFor, setOptionsFor] = useState<PublicProduct | null>(null);

  // Restore a cart saved before a guest was redirected to /customer/login (see CheckoutDrawer).
  useEffect(() => {
    const draft = readCartDraft(store.slug);
    if (!draft || draft.length === 0) return;
    const restored = restoreFromDraft(draft, products);
    if (restored.length > 0) {
      setCart(restored);
      setModalOpen(true);
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
          aria-label={`View order, ${cartCount} items, total ${formatMoney(cartTotal, store.currencySuffix)}`}
        >
          <ChevronUp size={18} color={INK} aria-hidden="true" />
          <span
            className={`font-semibold text-[15px] ${notoSerif.className}`}
            style={{ color: INK }}
          >
            View order ({cartCount})&nbsp;&middot;&nbsp;{formatMoney(cartTotal, store.currencySuffix)}
          </span>
        </button>
      )}

      <ProductOptionsDialog
        product={optionsFor}
        currencySuffix={store.currencySuffix}
        accent={MATCHA_DEEP}
        onClose={() => setOptionsFor(null)}
        onConfirm={(selection, qty) => {
          if (optionsFor) setCart((prev) => addLine(prev, optionsFor, qty, selection));
          setOptionsFor(null);
        }}
      />
      <CheckoutDrawer
        open={modalOpen}
        onClose={() => setModalOpen(false)}
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
