'use client';

import { useState, useMemo, useRef } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ShoppingBag, Plus, ChevronRight } from 'lucide-react';
import { Nunito } from 'next/font/google';
import { DM_Serif_Display } from 'next/font/google';

const nunito = Nunito({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], display: 'swap' });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: ['400'], style: ['normal', 'italic'], display: 'swap' });

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  product: PublicProduct;
  qty: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  bg: '#FEFCFD',
  surface: '#FFFFFF',
  hero: 'linear-gradient(160deg, #F8D9E0 0%, #FCEEF2 55%, #FEFCFD 100%)',
  ink: '#2A1820',
  muted: '#9E7080',
  accent: '#C5607A',
  accentBg: 'rgba(197,96,122,0.10)',
  border: '#F2DEE5',
  tagBg: '#FDEEF2',
  rose: '#E8A0B0',
} as const;

// ─── Staff Picks card (horizontal strip) ────────────────────────────────────

function PickCard({
  product,
  currencySuffix,
  onAdd,
}: {
  product: PublicProduct;
  currencySuffix: string;
  onAdd: (id: number) => void;
}) {
  const price = (product.discountPrice ?? product.price).toFixed(2);

  return (
    <div
      className="flex-shrink-0 rounded-2xl overflow-hidden flex flex-col cursor-pointer"
      style={{ width: 148, background: C.surface, boxShadow: '0 2px 16px rgba(42,24,32,0.07)' }}
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full object-cover"
          style={{ height: 156 }}
          loading="eager"
        />
      ) : (
        <div
          className="w-full"
          style={{ height: 156, background: `linear-gradient(135deg, #F8D9E0, #FCEEF2)` }}
          aria-hidden="true"
        />
      )}
      <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-1.5">
        <p
          className={`font-bold text-[12px] leading-tight line-clamp-2 ${nunito.className}`}
          style={{ color: C.ink }}
        >
          {product.name}
        </p>
        <div className="flex items-center justify-between gap-1">
          <span
            className={`font-bold text-[13px] ${nunito.className}`}
            style={{ color: C.accent }}
          >
            {price}
            <span className="font-normal text-[10px] ml-0.5" style={{ color: C.muted }}>
              {currencySuffix}
            </span>
          </span>
          <button
            onClick={() => onAdd(product.id)}
            className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
            style={{ background: C.accent }}
            aria-label={`Add ${product.name}`}
          >
            <Plus size={12} color="#fff" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Menu card ───────────────────────────────────────────────────────────────

function MenuCard({
  product,
  currencySuffix,
  onAdd,
}: {
  product: PublicProduct;
  currencySuffix: string;
  onAdd: (id: number) => void;
}) {
  const price = (product.discountPrice ?? product.price).toFixed(2);
  const hasDiscount = product.discountPrice !== null;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: C.surface, boxShadow: '0 1px 12px rgba(42,24,32,0.06)', border: `1px solid ${C.border}` }}
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full object-cover"
          style={{ height: 140 }}
          loading="lazy"
        />
      ) : (
        <div
          className="w-full"
          style={{ height: 140, background: 'linear-gradient(135deg, #F8D9E0, #FCEEF2)' }}
          aria-hidden="true"
        />
      )}

      <div className="px-3 pt-2.5 pb-3 flex flex-col flex-1">
        <p
          className={`font-bold text-[13px] leading-tight line-clamp-2 ${nunito.className}`}
          style={{ color: C.ink }}
        >
          {product.name}
        </p>

        {product.description && (
          <p
            className={`text-[11px] mt-1 line-clamp-2 leading-[1.4] flex-1 ${nunito.className}`}
            style={{ color: C.muted }}
          >
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2.5 gap-1">
          <div className="leading-none">
            <span
              className={`font-extrabold text-[15px] ${nunito.className}`}
              style={{ color: C.accent }}
            >
              {price}
            </span>
            {hasDiscount && (
              <span
                className={`ml-1 text-[11px] line-through ${nunito.className}`}
                style={{ color: C.muted }}
              >
                {product.price.toFixed(2)}
              </span>
            )}
            <span
              className={`ml-0.5 text-[10px] ${nunito.className}`}
              style={{ color: C.muted }}
            >
              {currencySuffix}
            </span>
          </div>

          <button
            onClick={() => onAdd(product.id)}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
            style={{ background: C.accent, boxShadow: `0 2px 8px ${C.accent}55` }}
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

export default function BlossomCafeTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const pickScrollRef = useRef<HTMLDivElement>(null);

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

  const available = useMemo(() => products.filter((p) => p.available), [products]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const p of available) {
      if (!seen.has(p.category)) {
        seen.add(p.category);
        result.push(p.category);
      }
    }
    return result;
  }, [available]);

  const staffPicks = useMemo(() => available.slice(0, 4), [available]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return available;
    return available.filter((p) => p.category === selectedCategory);
  }, [available, selectedCategory]);

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>

      {/* ── Sticky Header ── */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-5 py-3"
        style={{
          background: 'rgba(254,252,253,0.93)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div className="min-w-0">
          <p
            className={`font-extrabold text-[16px] leading-none truncate ${nunito.className}`}
            style={{ color: C.ink }}
          >
            {store.shopName}
          </p>
          <p
            className={`text-[11px] mt-0.5 ${nunito.className}`}
            style={{ color: C.accent }}
          >
            Open · welcoming you in
          </p>
        </div>

        <button
          className="relative w-10 h-10 flex items-center justify-center rounded-full cursor-pointer flex-shrink-0"
          style={{ background: C.tagBg, border: `1px solid ${C.border}` }}
          aria-label={`Cart, ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
        >
          <ShoppingBag size={18} color={C.accent} />
          {cartCount > 0 && (
            <span
              className={`absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-extrabold ${nunito.className}`}
              style={{ background: C.accent, color: '#fff' }}
              aria-hidden="true"
            >
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>
      </header>

      {/* ── Hero ── */}
      <section className="px-5 pt-8 pb-6 relative" style={{ background: C.hero }}>
        {/* Soft decorative blob */}
        <div
          className="absolute top-4 right-6 w-28 h-28 rounded-full pointer-events-none"
          style={{ background: 'rgba(197,96,122,0.08)', filter: 'blur(24px)' }}
          aria-hidden="true"
        />

        {/* Tag */}
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 ${nunito.className}`}
          style={{ background: C.accent + '18', border: `1px solid ${C.accent}30` }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.accent }} aria-hidden="true" />
          <span className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: C.accent }}>
            specialty café
          </span>
        </div>

        <h1
          className={`leading-[1.1] tracking-tight ${dmSerif.className}`}
          style={{ color: C.ink, fontSize: 'clamp(30px, 9vw, 40px)' }}
        >
          {store.shopName}
        </h1>

        {(tc?.heroDescription || store.description) && (
          <p
            className={`text-[13px] mt-2 leading-relaxed max-w-[300px] ${nunito.className}`}
            style={{ color: C.muted }}
          >
            {tc?.heroDescription || store.description}
          </p>
        )}

        {/* Pill row */}
        <div className="flex flex-wrap gap-2 mt-4">
          {(tc?.openingHours || store.openingHours) && (
            <span
              className={`text-[11px] rounded-full px-3 py-1.5 font-semibold ${nunito.className}`}
              style={{ background: C.surface, color: C.muted, border: `1px solid ${C.border}` }}
            >
              {tc?.openingHours || store.openingHours}
            </span>
          )}
          {store.deliveryInfo && (
            <span
              className={`text-[11px] rounded-full px-3 py-1.5 font-semibold ${nunito.className}`}
              style={{ background: C.tagBg, color: C.accent, border: `1px solid ${C.border}` }}
            >
              {store.deliveryInfo}
            </span>
          )}
        </div>
      </section>

      {/* ── Staff Picks Strip ── */}
      <section className="pt-5 pb-3">
        <div className="flex items-center justify-between px-5 mb-3">
          <p
            className={`font-extrabold text-[14px] ${nunito.className}`}
            style={{ color: C.ink }}
          >
            Staff Picks
          </p>
          <button
            onClick={() => pickScrollRef.current?.scrollBy({ left: 160, behavior: 'smooth' })}
            className="flex items-center gap-0.5 cursor-pointer"
            style={{ color: C.accent }}
            aria-label="Scroll picks"
          >
            <span className={`text-[12px] font-semibold ${nunito.className}`}>see all</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div
          ref={pickScrollRef}
          className="flex gap-3 overflow-x-auto px-5"
          style={{ scrollbarWidth: 'none' }}
        >
          {staffPicks.map((p) => (
            <PickCard
              key={p.id}
              product={p}
              currencySuffix={store.currencySuffix}
              onAdd={addToCart}
            />
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="mx-5 my-1" style={{ height: 1, background: C.border }} />

      {/* ── Category Pills ── */}
      <nav
        className="px-4 pt-4 pb-1 flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
        aria-label="Product categories"
      >
        {['All', ...categories].map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-[12px] font-bold whitespace-nowrap flex-shrink-0 cursor-pointer transition-colors ${nunito.className}`}
              style={
                active
                  ? { background: C.accent, color: '#fff' }
                  : { background: C.tagBg, color: C.muted, border: `1px solid ${C.border}` }
              }
              aria-pressed={active}
            >
              {cat}
            </button>
          );
        })}
      </nav>

      {/* ── Section label ── */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <p
          className={`text-[11px] font-bold tracking-[2px] uppercase ${nunito.className}`}
          style={{ color: C.muted }}
        >
          {selectedCategory === 'All' ? 'Full Menu' : selectedCategory}
        </p>
        <p className={`text-[11px] font-medium ${nunito.className}`} style={{ color: C.muted }}>
          {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Product Grid ── */}
      <main
        className="px-4 pb-32 grid grid-cols-2 gap-3 max-w-screen-lg mx-auto"
        aria-label="Menu items"
      >
        {filteredProducts.length === 0 ? (
          <p
            className={`col-span-2 text-center py-14 text-sm ${nunito.className}`}
            style={{ color: C.muted }}
          >
            Nothing here yet.
          </p>
        ) : (
          filteredProducts.map((product) => (
            <MenuCard
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
            background: 'rgba(254,252,253,0.97)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderTop: `1px solid ${C.border}`,
          }}
          aria-live="polite"
          aria-label="Cart summary"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: C.tagBg, border: `1px solid ${C.border}` }}
          >
            <ShoppingBag size={16} color={C.accent} />
          </div>

          <div className="flex-1 min-w-0">
            <p
              className={`font-bold text-[13px] leading-tight ${nunito.className}`}
              style={{ color: C.ink }}
            >
              {cartCount} item{cartCount !== 1 ? 's' : ''} in your order
            </p>
            <p
              className={`text-[12px] font-medium ${nunito.className}`}
              style={{ color: C.muted }}
            >
              {cartTotal.toFixed(2)} {store.currencySuffix}
            </p>
          </div>

          <button
            className={`rounded-full px-5 py-2.5 font-extrabold text-sm cursor-pointer flex-shrink-0 ${nunito.className}`}
            style={{
              background: C.accent,
              color: '#fff',
              boxShadow: `0 4px 16px ${C.accent}50`,
            }}
            aria-label="Proceed to checkout"
          >
            Order Now
          </button>
        </div>
      )}
    </div>
  );
}
