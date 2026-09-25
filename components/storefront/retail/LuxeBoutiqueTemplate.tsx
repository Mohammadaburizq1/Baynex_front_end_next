'use client';
import { formatMoney } from '@/lib/utils';

import { useEffect, useState, useMemo } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ShoppingBag } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';
import CheckoutDrawer from '@/components/storefront/restaurant-default/CheckoutDrawer';
import { readCartDraft, clearCartDraft } from '@/lib/utils/cart-draft';
import {
  addLine, cartCount as countOf, changeQty as changeLineQty, needsOptions, removeLine, restoreFromDraft,
  type CartLine,
} from '@/lib/utils/cart-lines';
import { ProductOptionsDialog } from '@/components/storefront/shared/ProductOptionsDialog';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  faint: '#F5F5F5',
  gold: '#8B7355',
  divider: '#E8E8E8',
  muted: '#666666',
} as const;

// ─── Image Component ──────────────────────────────────────────────────────────

function ProductImage({
  imageUrl,
  name,
  className = '',
}: {
  imageUrl: string | null;
  name: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{ background: COLORS.faint }}
    >
      <ShoppingBag size={28} color={COLORS.gold} />
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  index,
  currencySuffix,
  onAdd,
}: {
  product: PublicProduct;
  index: number;
  currencySuffix: string;
  onAdd: (id: number) => void;
}) {
  const displayPrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice !== null && product.discountPrice < product.price;
  // Every 4th card gets a wider aspect ratio
  const isWide = index % 4 === 3;

  return (
    <div className="break-inside-avoid mb-4 cursor-pointer group">
      {/* Image */}
      <div
        className="overflow-hidden"
        style={{ aspectRatio: isWide ? '4/3' : '3/4' }}
      >
        <ProductImage
          imageUrl={product.imageUrl}
          name={product.name}
          className="transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="pt-3">
        <p
          className="font-jakarta font-semibold text-[11px] uppercase tracking-widest"
          style={{ color: COLORS.muted }}
        >
          {product.category}
        </p>
        <h3
          className={`${playfair.className} text-[18px] leading-tight mt-1`}
          style={{ color: COLORS.black }}
        >
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-1 flex items-baseline gap-2">
          {hasDiscount && (
            <span
              className="font-jakarta text-xs line-through"
              style={{ color: COLORS.muted }}
            >
              {formatMoney(product.price, currencySuffix)}
            </span>
          )}
          <span
            className="font-jakarta font-semibold text-sm"
            style={{ color: COLORS.black }}
          >
            {formatMoney(displayPrice, currencySuffix)}
          </span>
        </div>

        {/* Add to bag */}
        {product.available && product.stock > 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product.id);
            }}
            className="font-jakarta text-xs underline mt-2 cursor-pointer hover:opacity-60 transition-opacity"
            style={{ color: COLORS.black }}
            aria-label={`Add ${product.name} to bag`}
          >
            Add to bag
          </button>
        ) : (
          <span
            className="font-jakarta text-xs mt-2 block"
            style={{ color: COLORS.muted }}
          >
            Out of stock
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LuxeBoutiqueTemplate({ data }: { data: StorefrontData }) {
  const tc = data.templateContent;
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  // The product whose variant / add-on choices are being made (null = dialog closed).
  const [optionsFor, setOptionsFor] = useState<PublicProduct | null>(null);

  // Restore a cart saved before a guest was redirected to /customer/login (see CheckoutDrawer).
  useEffect(() => {
    const draft = readCartDraft(data.store.slug);
    if (!draft || draft.length === 0) return;
    const restored = restoreFromDraft(draft, data.products);
    if (restored.length > 0) {
      setCart(restored);
      setCartOpen(true);
    }
    clearCartDraft(data.store.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.store.slug]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(data.products.map((p) => p.category)));
    return ['All', ...cats];
  }, [data.products]);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return data.products;
    return data.products.filter((p) => p.category === activeCategory);
  }, [data.products, activeCategory]);

  const cartCount = countOf(cart);

  function addToCart(id: number) {
    const product = data.products.find((p) => p.id === id);
    if (!product) return;
    // A product with variants or add-ons needs the customer to choose first.
    if (needsOptions(product)) {
      setOptionsFor(product);
      return;
    }
    setCart((prev) => addLine(prev, product, 1));
  }

  function removeFromCart(key: string) {
    setCart((prev) => removeLine(prev, key));
  }

  function changeQty(key: string, delta: number) {
    setCart((prev) => changeLineQty(prev, key, delta));
  }

  return (
    <div className="min-h-screen font-jakarta" style={{ background: COLORS.white }}>
      {/* ── Header ── */}
      <header
        className="bg-white border-b px-6 md:px-12 h-16 flex items-center justify-between sticky top-0 z-20"
        style={{ borderColor: COLORS.divider }}
      >
        <span
          className={`${playfair.className} text-[22px] font-normal tracking-tight`}
          style={{ color: COLORS.black }}
        >
          {data.store.shopName}
        </span>

        <button
          onClick={() => setCartOpen(true)}
          className="flex items-center gap-1 cursor-pointer hover:opacity-60 transition-opacity"
          aria-label={`Open cart, ${cartCount} items`}
        >
          <ShoppingBag size={20} color={COLORS.black} />
          <span className="font-jakarta text-sm" style={{ color: COLORS.black }}>
            ({cartCount})
          </span>
        </button>
      </header>

      {/* ── Hero ── */}
      <section className="px-6 md:px-12 py-12 md:py-20">
        <h1
          className={`${playfair.className} text-[42px] md:text-[64px] font-normal leading-none tracking-tight`}
          style={{ color: COLORS.black }}
        >
          THE COLLECTION
        </h1>
        <p
          className="font-jakarta text-[16px] mt-4 max-w-lg"
          style={{ color: COLORS.muted }}
        >
          {tc?.heroDescription || data.store.description || `Curated pieces from ${data.store.shopName}`}
        </p>
        <button
          className="font-jakarta font-semibold text-sm underline mt-6 cursor-pointer hover:opacity-60 transition-opacity"
          style={{ color: COLORS.black }}
          onClick={() => {
            document.getElementById('lb-products')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Explore →
        </button>
      </section>

      {/* ── Category Pills ── */}
      <div className="px-6 md:px-12 mb-8 flex gap-3 flex-wrap">
        {categories.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="border px-5 py-2 font-jakarta font-semibold text-xs uppercase tracking-widest cursor-pointer transition-colors"
              style={{
                borderColor: COLORS.black,
                background: isActive ? COLORS.black : COLORS.white,
                color: isActive ? COLORS.white : COLORS.black,
              }}
              aria-pressed={isActive}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── Masonry Grid ── */}
      <main
        id="lb-products"
        className="px-6 md:px-12 pb-16"
        style={{ columns: '2', gap: '16px' }}
      >
        <style>{`
          @media (min-width: 768px) { #lb-products { columns: 3 !important; } }
          @media (min-width: 1024px) { #lb-products { columns: 4 !important; } }
        `}</style>
        {filtered.length === 0 ? (
          <div
            className="py-20 flex flex-col items-center gap-3"
            style={{ columnSpan: 'all' } as React.CSSProperties}
          >
            <ShoppingBag size={40} color={COLORS.gold} />
            <p className="font-jakarta text-sm" style={{ color: COLORS.muted }}>
              No products in this category
            </p>
          </div>
        ) : (
          filtered.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              currencySuffix={data.store.currencySuffix}
              onAdd={addToCart}
            />
          ))
        )}
      </main>

      {/* ── Checkout ── */}
      <ProductOptionsDialog
        product={optionsFor}
        currencySuffix={data.store.currencySuffix}
        accent={data.store.primaryColor || '#111827'}
        onClose={() => setOptionsFor(null)}
        onConfirm={(selection, qty) => {
          if (optionsFor) setCart((prev) => addLine(prev, optionsFor, qty, selection));
          setOptionsFor(null);
        }}
      />
      <CheckoutDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        storeSlug={data.store.slug}
        cart={cart}
        currencySuffix={data.store.currencySuffix}
        onChangeQty={changeQty}
        onRemove={removeFromCart}
        onOrderPlaced={() => setCart([])}
      />

      {/* ── Footer ── */}
      <footer
        className="px-6 md:px-12 py-16 border-t"
        style={{ borderColor: COLORS.divider }}
      >
        <p
          className={`${playfair.className} text-[28px]`}
          style={{ color: COLORS.black }}
        >
          {data.store.shopName}
        </p>
        {(tc?.openingHours || data.store.openingHours) && (
          <p className="font-jakarta text-sm mt-2" style={{ color: COLORS.muted }}>
            {tc?.openingHours || data.store.openingHours}
          </p>
        )}
        {data.store.deliveryInfo && (
          <p className="font-jakarta text-sm mt-1" style={{ color: COLORS.muted }}>
            {data.store.deliveryInfo}
          </p>
        )}
      </footer>
    </div>
  );
}
