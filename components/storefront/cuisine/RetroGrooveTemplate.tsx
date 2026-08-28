'use client';

import { useState, useMemo } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import { Syne } from 'next/font/google';
import { DM_Sans } from 'next/font/google';

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500'], display: 'swap' });

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  product: PublicProduct;
  qty: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  bg: '#FDF8F0',
  surface: '#FFF5E4',
  heroBg: '#1C0A00',
  ink: '#1C0A00',
  muted: '#8A6B54',
  accent: '#FF5533',
  accentLight: '#FF7755',
  yellow: '#FFCC00',
  border: '#EBD9C2',
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeaturedCard({
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
    <div
      className="rounded-3xl overflow-hidden mx-4 mb-1"
      style={{ background: C.heroBg }}
    >
      {product.imageUrl && (
        <div className="relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full object-cover"
            style={{ height: 200 }}
            loading="eager"
          />
          {/* Retro "SPECIAL" stamp */}
          <div
            className="absolute top-3 right-3 w-16 h-16 rounded-full flex flex-col items-center justify-center"
            style={{ background: C.accent }}
            aria-hidden="true"
          >
            <span
              className={`text-white text-[8px] font-bold tracking-[1.5px] uppercase ${syne.className}`}
            >
              Today's
            </span>
            <span
              className={`text-white text-[9px] font-bold tracking-[0.5px] uppercase leading-tight ${syne.className}`}
            >
              Pick
            </span>
          </div>
        </div>
      )}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            className={`font-bold text-base leading-tight text-white truncate ${syne.className}`}
          >
            {product.name}
          </p>
          {product.description && (
            <p
              className={`text-[12px] mt-0.5 line-clamp-1 ${dmSans.className}`}
              style={{ color: 'rgba(253,248,240,0.6)' }}
            >
              {product.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <p
            className={`font-bold text-lg ${syne.className}`}
            style={{ color: C.yellow }}
          >
            {displayPrice}
          </p>
          <button
            onClick={() => onAdd(product.id)}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: C.accent }}
            aria-label={`Add ${product.name}`}
          >
            <Plus size={16} color="#fff" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  currencySuffix,
  onAdd,
}: {
  product: PublicProduct;
  currencySuffix: string;
  onAdd: (id: number) => void;
}) {
  const displayPrice = (product.discountPrice ?? product.price).toFixed(2);
  const hasDiscount = product.discountPrice !== null;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: C.surface, border: `1.5px solid ${C.border}` }}
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full object-cover"
          style={{ height: 148 }}
          loading="lazy"
        />
      ) : (
        <div
          className="w-full"
          style={{
            height: 148,
            background: `linear-gradient(135deg, ${C.accent}33, ${C.yellow}33)`,
          }}
          aria-hidden="true"
        />
      )}

      <div className="p-3 flex flex-col flex-1">
        <p
          className={`font-bold text-[13px] leading-tight line-clamp-2 flex-1 ${syne.className}`}
          style={{ color: C.ink }}
        >
          {product.name}
        </p>

        {product.description && (
          <p
            className={`text-[11px] mt-1 line-clamp-2 leading-[1.4] ${dmSans.className}`}
            style={{ color: C.muted }}
          >
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2.5 gap-1">
          <div>
            <span
              className={`font-bold text-[15px] ${syne.className}`}
              style={{ color: C.accent }}
            >
              {displayPrice}
            </span>
            {hasDiscount && (
              <span
                className={`ml-1 text-[11px] line-through ${dmSans.className}`}
                style={{ color: C.muted }}
              >
                {product.price.toFixed(2)}
              </span>
            )}
            <span className={`ml-0.5 text-[10px] ${dmSans.className}`} style={{ color: C.muted }}>
              {' '}{currencySuffix}
            </span>
          </div>

          <button
            onClick={() => onAdd(product.id)}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
            style={{ background: C.accent }}
            aria-label={`Add ${product.name}`}
          >
            <Plus size={14} color="#fff" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function RetroGrooveTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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

  const availableProducts = useMemo(
    () => products.filter((p) => p.available),
    [products]
  );

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return availableProducts;
    return availableProducts.filter((p) => p.category === selectedCategory);
  }, [availableProducts, selectedCategory]);

  const featuredProduct = availableProducts[0] ?? null;
  const gridProducts = filteredProducts.filter((p) =>
    selectedCategory !== 'All' || p.id !== featuredProduct?.id
  );

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>

      {/* ── Sticky Header ── */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-5 py-3"
        style={{
          background: 'rgba(253,248,240,0.92)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div className="min-w-0">
          <p
            className={`font-bold text-[17px] leading-none truncate ${syne.className}`}
            style={{ color: C.ink }}
          >
            {store.shopName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#22C55E' }}
              aria-hidden="true"
            />
            <span
              className={`text-[11px] ${dmSans.className}`}
              style={{ color: C.muted }}
            >
              Open · fresh today
            </span>
          </div>
        </div>

        <button
          className="relative w-10 h-10 flex items-center justify-center rounded-full cursor-pointer flex-shrink-0"
          style={{ background: C.surface, border: `1.5px solid ${C.border}` }}
          aria-label={`Cart, ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
        >
          <ShoppingBag size={19} color={C.ink} />
          {cartCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: C.accent, color: '#fff' }}
              aria-hidden="true"
            >
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>
      </header>

      {/* ── Hero ── */}
      <section
        className="px-5 pt-7 pb-8 relative overflow-hidden"
        style={{ background: C.heroBg }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-10 -right-10 w-52 h-52 rounded-full pointer-events-none"
          style={{ background: C.accent, opacity: 0.15 }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-4 -left-6 w-36 h-36 rounded-full pointer-events-none"
          style={{ background: C.yellow, opacity: 0.1 }}
          aria-hidden="true"
        />

        {/* Retro label strip */}
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 ${syne.className}`}
          style={{ background: 'rgba(255,85,51,0.18)', border: `1px solid ${C.accent}55` }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: C.accent }}
            aria-hidden="true"
          />
          <span
            className="text-[10px] font-semibold tracking-[2.5px] uppercase"
            style={{ color: C.accent }}
          >
            craft coffee
          </span>
        </div>

        <h1
          className={`font-extrabold leading-[1.05] tracking-tight ${syne.className}`}
          style={{ color: '#FDF8F0', fontSize: 'clamp(28px, 8vw, 38px)' }}
        >
          {store.shopName}
        </h1>

        {(tc?.heroDescription || store.description) && (
          <p
            className={`text-sm mt-2 leading-relaxed max-w-[280px] ${dmSans.className}`}
            style={{ color: 'rgba(253,248,240,0.6)' }}
          >
            {tc?.heroDescription || store.description}
          </p>
        )}

        {/* Info pills row */}
        <div className="flex flex-wrap gap-2 mt-4">
          {(tc?.openingHours || store.openingHours) && (
            <span
              className={`text-[11px] rounded-full px-3 py-1 ${dmSans.className}`}
              style={{
                background: 'rgba(253,248,240,0.08)',
                color: 'rgba(253,248,240,0.65)',
                border: '1px solid rgba(253,248,240,0.12)',
              }}
            >
              {tc?.openingHours || store.openingHours}
            </span>
          )}
          {store.deliveryInfo && (
            <span
              className={`text-[11px] rounded-full px-3 py-1 ${dmSans.className}`}
              style={{
                background: 'rgba(255,204,0,0.12)',
                color: C.yellow,
                border: '1px solid rgba(255,204,0,0.2)',
              }}
            >
              {store.deliveryInfo}
            </span>
          )}
        </div>
      </section>

      {/* ── Wave divider ── */}
      <div style={{ background: C.heroBg, lineHeight: 0 }}>
        <svg
          viewBox="0 0 390 28"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', width: '100%' }}
          aria-hidden="true"
        >
          <path
            d="M0 0 C65 28 130 28 195 14 C260 0 325 0 390 14 L390 28 L0 28 Z"
            fill={C.bg}
          />
        </svg>
      </div>

      {/* ── Featured Product ── */}
      {selectedCategory === 'All' && featuredProduct && (
        <div className="pt-4 pb-2">
          <div className="flex items-center gap-2 px-5 mb-3">
            <span
              className={`text-[11px] font-bold tracking-[2px] uppercase ${syne.className}`}
              style={{ color: C.accent }}
            >
              ● Featured
            </span>
          </div>
          <FeaturedCard
            product={featuredProduct}
            currencySuffix={store.currencySuffix}
            onAdd={addToCart}
          />
        </div>
      )}

      {/* ── Category Pills ── */}
      <nav
        className="px-4 pt-4 pb-1 flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
        aria-label="Product categories"
      >
        {['All', ...categories].map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-bold cursor-pointer whitespace-nowrap flex-shrink-0 transition-colors ${syne.className}`}
              style={
                isSelected
                  ? {
                      background: C.accent,
                      color: '#fff',
                    }
                  : {
                      background: C.surface,
                      color: C.muted,
                      border: `1.5px solid ${C.border}`,
                    }
              }
              aria-pressed={isSelected}
            >
              {cat}
            </button>
          );
        })}
      </nav>

      {/* ── Section label ── */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <p
          className={`text-[11px] font-bold tracking-[2px] uppercase ${syne.className}`}
          style={{ color: C.muted }}
        >
          {selectedCategory === 'All' ? 'Full Menu' : selectedCategory}
        </p>
        <p className={`text-[11px] ${dmSans.className}`} style={{ color: C.muted }}>
          {gridProducts.length} item{gridProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Product Grid ── */}
      <main
        className="px-4 pb-32 grid grid-cols-2 gap-3 max-w-screen-lg mx-auto"
        aria-label="Menu items"
      >
        {gridProducts.length === 0 ? (
          <p
            className={`col-span-2 text-center py-14 text-sm ${dmSans.className}`}
            style={{ color: C.muted }}
          >
            Nothing in this category yet.
          </p>
        ) : (
          gridProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currencySuffix={store.currencySuffix}
              onAdd={addToCart}
            />
          ))
        )}
      </main>

      {/* ── Cart Bar ── */}
      {cartCount > 0 && (
        <div
          className="fixed bottom-0 inset-x-0 z-30 px-4 py-3 flex items-center gap-3"
          style={{
            background: C.heroBg,
            borderTop: '1px solid rgba(253,248,240,0.1)',
          }}
          aria-live="polite"
          aria-label="Cart summary"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: C.accent }}
          >
            <ShoppingBag size={16} color="#fff" />
          </div>

          <div className="flex-1 min-w-0">
            <p
              className={`font-semibold text-[13px] leading-tight ${dmSans.className}`}
              style={{ color: '#FDF8F0' }}
            >
              {cartCount} item{cartCount !== 1 ? 's' : ''} in your order
            </p>
            <p
              className={`text-[12px] ${dmSans.className}`}
              style={{ color: 'rgba(253,248,240,0.55)' }}
            >
              {cartTotal.toFixed(2)} {store.currencySuffix}
            </p>
          </div>

          <button
            className={`rounded-full px-5 py-2.5 font-bold text-sm cursor-pointer flex-shrink-0 ${syne.className}`}
            style={{ background: C.accent, color: '#fff' }}
            aria-label="Proceed to checkout"
          >
            Order Now
          </button>
        </div>
      )}
    </div>
  );
}
