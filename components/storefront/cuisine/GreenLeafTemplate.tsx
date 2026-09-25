'use client';
import { formatMoney } from '@/lib/utils';

import { useEffect, useState, useMemo } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ShoppingCart, Leaf } from 'lucide-react';
import { Fraunces } from 'next/font/google';
import { Nunito } from 'next/font/google';
import CheckoutDrawer from '@/components/storefront/restaurant-default/CheckoutDrawer';
import { ProductOptionsDialog } from '@/components/storefront/shared/ProductOptionsDialog';
import { readCartDraft, clearCartDraft } from '@/lib/utils/cart-draft';
import {
  addLine, cartCount as countOf, cartSubtotal, changeQty as changeLineQty, needsOptions, removeLine, restoreFromDraft,
  type CartLine,
} from '@/lib/utils/cart-lines';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '600'], display: 'swap' });
const nunito = Nunito({ subsets: ['latin'], weight: ['400', '600', '700', '800'], display: 'swap' });

// ─── Types ───────────────────────────────────────────────────────────────────

type EcoBadge = {
  label: string;
  bg: string;
  color: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = {
  cream: '#F7F4EE',
  offWhite: '#FFFCF7',
  leaf: '#2D6A4F',
  leafDeep: '#1B4332',
  ink: '#1F2E24',
  muted: '#6B7F72',
  divider: '#E8DFD6',
  badgeMint: '#D8F3DC',
} as const;

const HERO_FALLBACK =
  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80';

const ECO_KEYWORDS: { keyword: string; badge: EcoBadge }[] = [
  {
    keyword: 'Organic',
    badge: { label: 'Organic', bg: '#D8F3DC', color: '#1B4332' },
  },
  {
    keyword: 'Vegan',
    badge: { label: 'Vegan', bg: '#E8F5E9', color: '#2D6A4F' },
  },
  {
    keyword: 'Dairy-Free',
    badge: { label: 'Dairy-Free', bg: '#FFF3E0', color: '#6B4F3A' },
  },
];

function getEcoBadges(description: string): EcoBadge[] {
  return ECO_KEYWORDS.filter(({ keyword }) =>
    description.toLowerCase().includes(keyword.toLowerCase())
  ).map(({ badge }) => badge);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductRow({
  product,
  currencySuffix,
  onAdd,
}: {
  product: PublicProduct;
  currencySuffix: string;
  onAdd: (id: number) => void;
}) {
  const displayPrice = formatMoney((product.discountPrice ?? product.price), currencySuffix);
  const ecoBadges = getEcoBadges(product.description ?? '');

  return (
    <div className="flex gap-3 py-3">
      {/* Image */}
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-[92px] h-[92px] object-cover rounded-xl flex-shrink-0"
          loading="lazy"
        />
      ) : (
        <div
          className="w-[92px] h-[92px] rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #D8F3DC, #B7E4C7)',
          }}
          aria-hidden="true"
        >
          <Leaf size={28} color={COLORS.leaf} />
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        {/* Eco badges */}
        {ecoBadges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {ecoBadges.map((badge) => (
              <span
                key={badge.label}
                className="text-[10px] font-black px-2 py-0.5 rounded-lg"
                style={{ backgroundColor: badge.bg, color: badge.color }}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}

        {/* Name */}
        <p
          className={`font-semibold text-[17px] leading-tight ${fraunces.className}`}
          style={{ color: COLORS.ink }}
        >
          {product.name}
        </p>

        {/* Description */}
        {product.description && (
          <p
            className={`text-xs mt-0.5 line-clamp-2 ${nunito.className}`}
            style={{ color: COLORS.muted }}
          >
            {product.description}
          </p>
        )}

        {/* Price + Add */}
        <div className="flex items-center justify-between mt-2">
          <span
            className={`font-extrabold text-[15px] ${nunito.className}`}
            style={{ color: COLORS.leafDeep }}
          >
            {displayPrice}
          </span>
          <button
            onClick={() => onAdd(product.id)}
            className={`px-3 py-1.5 rounded-xl text-white text-xs font-extrabold cursor-pointer hover:opacity-90 transition-opacity ${nunito.className}`}
            style={{ backgroundColor: COLORS.leaf }}
            aria-label={`Add ${product.name} to cart`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GreenLeafTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;

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

  // ── Derived values ──
  const tc = data.templateContent;
  const heroImageSrc =
    tc?.heroImageUrl?.trim() || products.find((p) => p.imageUrl)?.imageUrl || HERO_FALLBACK;
  const tagline = tc?.heroDescription || store.description?.trim() || 'Fresh, seasonal, and mindfully sourced';
  const openingHours = data.demo
    ? (tc?.openingHours || store.openingHours?.trim() || 'Mon–Sun 8:00 AM – 9:00 PM')
    : (store.openingHours?.trim() || tc?.openingHours || '');

  return (
    <div
      className="flex flex-col lg:flex-row min-h-screen"
      style={{ backgroundColor: COLORS.cream }}
    >
      {/* ══ Hero Pane ══ */}
      <aside
        className="relative overflow-hidden h-[300px] lg:w-[44%] lg:h-auto lg:fixed lg:top-0 lg:left-0 lg:bottom-0"
        aria-hidden="false"
      >
        <img
          src={heroImageSrc}
          alt={store.shopName}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(27,67,50,0.55), rgba(27,67,50,0.15))',
          }}
          aria-hidden="true"
        />

        {/* Hero text */}
        <div className="absolute bottom-0 left-0 pb-6 pl-6">
          {/* Green Leaf badge */}
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-black rounded-full px-3 py-1 ${nunito.className}`}
            style={{
              backgroundColor: COLORS.badgeMint,
              color: COLORS.leafDeep,
            }}
          >
            <Leaf size={10} aria-hidden="true" />
            GREEN LEAF
          </span>

          <h1
            className={`text-[28px] leading-[34px] font-semibold text-white mt-3 ${fraunces.className}`}
          >
            {store.shopName}
          </h1>
          <p
            className={`text-sm mt-1 ${nunito.className}`}
            style={{ color: 'rgba(255,255,255,0.82)' }}
          >
            {tagline}
          </p>

          {/* Opening hours — visible on mobile hero */}
          <p
            className={`text-xs mt-2 lg:hidden ${nunito.className}`}
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            {openingHours}
          </p>
        </div>
      </aside>

      {/* ══ Menu Pane ══ */}
      <main
        className="flex-1 flex flex-col lg:ml-[44%]"
        style={{ backgroundColor: COLORS.offWhite, minHeight: '100vh' }}
      >
        {/* Sticky header */}
        <div
          className="sticky top-0 z-20 px-5 py-4 border-b"
          style={{
            backgroundColor: COLORS.offWhite,
            borderColor: COLORS.divider,
          }}
        >
          <h2
            className={`text-[26px] font-semibold ${fraunces.className}`}
            style={{ color: COLORS.ink }}
          >
            Mindful menu
          </h2>

          {/* Category chips */}
          <div
            className="flex gap-2 mt-3 overflow-x-auto pb-0.5"
            style={{ scrollbarWidth: 'none' }}
            role="navigation"
            aria-label="Menu categories"
          >
            {['All', ...categories].map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${nunito.className}`}
                  style={{
                    backgroundColor: isSelected ? COLORS.leaf : COLORS.badgeMint,
                    color: isSelected ? '#FFFFFF' : COLORS.leafDeep,
                  }}
                  aria-pressed={isSelected}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product list */}
        <div
          className="px-4 py-2 divide-y pb-32"
          style={{ '--tw-divide-opacity': '1' } as React.CSSProperties}
        >
          {filteredProducts.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              currencySuffix={store.currencySuffix}
              onAdd={addToCart}
            />
          ))}
          {filteredProducts.length === 0 && (
            <p
              className={`text-center py-12 text-sm ${nunito.className}`}
              style={{ color: COLORS.muted }}
            >
              No items in this category.
            </p>
          )}
        </div>

        {/* Footer opening hours (desktop) */}
        <div
          className="hidden lg:block px-5 py-4 mt-auto border-t text-sm"
          style={{ borderColor: COLORS.divider, color: COLORS.muted }}
        >
          <span className={nunito.className}>{openingHours}</span>
        </div>
      </main>

      {/* ══ Floating Cart Bar ══ */}
      {cartCount > 0 && (
        <div
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
          style={{ backgroundColor: COLORS.leaf }}
          aria-live="polite"
          aria-label="Cart summary"
        >
          <ShoppingCart size={18} color="#FFFFFF" aria-hidden="true" />
          <span
            className={`text-sm font-extrabold text-white ${nunito.className}`}
          >
            {cartCount} {cartCount === 1 ? 'item' : 'items'} &middot;{' '}
            {formatMoney(cartTotal, store.currencySuffix)}
          </span>
          <button
            onClick={() => setCartOpen(true)}
            className={`text-sm font-extrabold cursor-pointer hover:underline ${nunito.className}`}
            style={{ color: 'rgba(255,255,255,0.80)' }}
            aria-label="Proceed to checkout"
          >
            Checkout →
          </button>
        </div>
      )}

      <ProductOptionsDialog
        product={optionsFor}
        currencySuffix={store.currencySuffix}
        accent={COLORS.leaf}
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
