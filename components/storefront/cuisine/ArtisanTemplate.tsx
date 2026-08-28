'use client';

import { useState, useMemo } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ShoppingCart, Coffee, MessageCircle } from 'lucide-react';
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'], weight: ['400', '600'], display: 'swap' });

// ─── Types ───────────────────────────────────────────────────────────────────

interface CartItem {
  product: PublicProduct;
  qty: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#FFFCF8',
  surface: '#FFFFFF',
  ink: '#1C1410',
  muted: '#7A7168',
  border: '#E8DFD6',
  accent: '#A65F3B',
  footerBg: '#3D2A22',
} as const;

const HERO_FALLBACK =
  'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1200&q=80';

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
  const displayPrice = `${(product.discountPrice ?? product.price).toFixed(2)} ${currencySuffix}`;

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm cursor-pointer active:scale-[0.97] transition-transform"
      style={{ backgroundColor: COLORS.surface }}
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-32 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="h-32 w-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #F0E8DF, #D4C4B8)' }}
          aria-hidden="true"
        >
          <Coffee size={32} color={COLORS.accent} />
        </div>
      )}

      <div className="p-3">
        <p
          className="text-sm font-bold leading-tight line-clamp-2"
          style={{ color: COLORS.ink }}
        >
          {product.name}
        </p>
        <p
          className="text-sm font-extrabold mt-1"
          style={{ color: COLORS.accent }}
        >
          {displayPrice}
        </p>
        <button
          onClick={() => onAdd(product.id)}
          className="w-full mt-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-opacity hover:opacity-90"
          style={{ backgroundColor: COLORS.accent, color: '#FFFFFF' }}
          aria-label={`Add ${product.name} to cart`}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ArtisanTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;

  // ── Cart state ──
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

  // ── Grouped products by category ──
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
  const tagline =
    tc?.heroDescription || store.description?.trim() || 'Craft coffee, roasted slow';
  const openingHours = tc?.openingHours || store.openingHours?.trim() || 'Mon–Sun 7:00 AM – 9:00 PM';

  const cartBarTranslate = cartCount === 0 ? 'translateY(100%)' : 'translateY(0)';

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: COLORS.bg, fontFamily: 'sans-serif' }}
    >
      {/* ── Sticky Navbar ── */}
      <header
        className="sticky top-0 z-30 h-14 px-4 flex items-center justify-between"
        style={{
          backgroundColor: COLORS.surface,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <span
          className={`text-[18px] font-semibold ${lora.className}`}
          style={{ color: COLORS.ink }}
        >
          {store.shopName}
        </span>

        <button
          className="relative flex items-center justify-center w-10 h-10 cursor-pointer"
          style={{ color: COLORS.ink }}
          aria-label={`Cart, ${cartCount} items`}
        >
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <span
              className="absolute top-0 right-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none"
              style={{ backgroundColor: COLORS.accent, fontSize: '10px' }}
              aria-hidden="true"
            >
              {cartCount}
            </span>
          )}
        </button>
      </header>

      {/* ── Hero ── */}
      <section className="h-[340px] relative overflow-hidden">
        <img
          src={heroImageSrc}
          alt={store.shopName}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.55))',
          }}
          aria-hidden="true"
        />
        <div className="absolute bottom-0 left-0 pb-6 pl-6">
          <h1
            className={`text-[32px] font-semibold text-white leading-tight ${lora.className}`}
          >
            {store.shopName}
          </h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.88)' }}>
            {tagline}
          </p>
        </div>
      </section>

      {/* ── Category Chips ── */}
      <nav
        className="sticky z-20 px-4 py-2 flex gap-2 overflow-x-auto"
        style={{
          top: '56px', /* h-14 = 56px */
          backgroundColor: COLORS.surface,
          borderBottom: `1px solid ${COLORS.border}`,
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
              className="flex-shrink-0 px-4 py-2 rounded-full border text-sm font-bold cursor-pointer transition-colors whitespace-nowrap"
              style={{
                backgroundColor: isSelected ? COLORS.accent : COLORS.surface,
                color: isSelected ? '#FFFFFF' : COLORS.ink,
                borderColor: isSelected ? 'transparent' : COLORS.border,
              }}
              aria-pressed={isSelected}
            >
              {cat}
            </button>
          );
        })}
      </nav>

      {/* ── Product Grid ── */}
      <main className="px-4 md:px-8 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 pb-28 max-w-screen-xl mx-auto">
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

      {/* ── Footer ── */}
      <footer
        className="px-6 py-8 text-center"
        style={{ backgroundColor: COLORS.footerBg }}
      >
        <p
          className={`text-[22px] font-semibold text-white ${lora.className}`}
        >
          {store.shopName}
        </p>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.60)' }}>
          {openingHours}
        </p>
        {store.whatsappNumber && (
          <a
            href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl border border-white text-white text-sm font-semibold cursor-pointer hover:bg-white/10 transition-colors"
            aria-label="Contact us on WhatsApp"
          >
            <MessageCircle size={16} />
            WhatsApp Us
          </a>
        )}
      </footer>

      {/* ── Cart Bar ── */}
      <div
        className="fixed bottom-0 inset-x-0 z-40 px-4 py-3 flex items-center justify-between transition-transform duration-300"
        style={{
          backgroundColor: COLORS.surface,
          borderTop: `1px solid ${COLORS.border}`,
          boxShadow: '0 -2px 16px rgba(0,0,0,0.08)',
          transform: cartBarTranslate,
        }}
        aria-live="polite"
        aria-label="Cart summary"
      >
        <span className="font-semibold text-sm" style={{ color: COLORS.ink }}>
          {cartCount} {cartCount === 1 ? 'item' : 'items'} &middot;{' '}
          {cartTotal.toFixed(2)} {store.currencySuffix}
        </span>
        <button
          className="px-5 py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: COLORS.accent }}
          aria-label="Proceed to checkout"
        >
          Checkout →
        </button>
      </div>
    </div>
  );
}
