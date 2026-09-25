'use client';
import { formatMoney } from '@/lib/utils';

import { useEffect, useState, useMemo } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ShoppingBag } from 'lucide-react';
import CheckoutDrawer from '@/components/storefront/restaurant-default/CheckoutDrawer';
import { readCartDraft, clearCartDraft } from '@/lib/utils/cart-draft';
import {
  addLine, cartCount as countOf, changeQty as changeLineQty, needsOptions, removeLine, restoreFromDraft,
  type CartLine,
} from '@/lib/utils/cart-lines';
import { ProductOptionsDialog } from '@/components/storefront/shared/ProductOptionsDialog';

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#F8F8F8',
  surface: '#FFFFFF',
  ink: '#1A1A1A',
  muted: '#6B7280',
  border: '#E5E7EB',
} as const;

// ─── Image Component ──────────────────────────────────────────────────────────

function ProductImage({
  imageUrl,
  name,
  primary,
  className = '',
}: {
  imageUrl: string | null;
  name: string;
  primary: string;
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
      style={{ background: `linear-gradient(135deg, ${primary}22, ${primary}11)` }}
    >
      <ShoppingBag size={32} color={COLORS.muted} />
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  primary,
  currencySuffix,
  onAdd,
}: {
  product: PublicProduct;
  primary: string;
  currencySuffix: string;
  onAdd: (id: number) => void;
}) {
  const displayPrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice !== null && product.discountPrice < product.price;

  return (
    <div className="bg-white rounded-2xl overflow-hidden hover:shadow-md transition cursor-pointer">
      <div className="aspect-[3/4] relative overflow-hidden">
        <ProductImage imageUrl={product.imageUrl} name={product.name} primary={primary} />
      </div>
      <div className="p-3">
        <p className="font-jakarta font-semibold text-[11px] uppercase tracking-wider" style={{ color: COLORS.muted }}>
          {product.category}
        </p>
        <p className="font-jakarta font-bold text-sm mt-0.5 line-clamp-2" style={{ color: COLORS.ink }}>
          {product.name}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-jakarta font-extrabold text-[15px]" style={{ color: COLORS.ink }}>
            {formatMoney(displayPrice, currencySuffix)}
          </span>
          {hasDiscount && (
            <span className="font-jakarta text-sm line-through" style={{ color: COLORS.muted }}>
              {formatMoney(product.price, currencySuffix)}
            </span>
          )}
        </div>
        {product.available && product.stock > 0 ? (
          <button
            onClick={() => onAdd(product.id)}
            className="w-full py-2 mt-2 rounded-xl font-jakarta font-bold text-sm text-white cursor-pointer"
            style={{ background: primary }}
            aria-label={`Add ${product.name} to bag`}
          >
            Add to bag
          </button>
        ) : (
          <button
            disabled
            className="w-full py-2 mt-2 rounded-xl font-jakarta font-bold text-sm cursor-not-allowed opacity-40"
            style={{ background: COLORS.muted, color: COLORS.surface }}
          >
            Out of stock
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RetailClassicTemplate({ data }: { data: StorefrontData }) {
  const primary = data.store.primaryColor ?? '#475569';
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
    <div className="min-h-screen font-jakarta" style={{ background: COLORS.bg }}>
      {/* ── Sticky Navbar ── */}
      <header
        className="bg-white border-b px-4 md:px-8 h-14 flex items-center justify-between sticky top-0 z-20"
        style={{ borderColor: COLORS.border }}
      >
        <span className="font-jakarta font-bold text-lg" style={{ color: COLORS.ink }}>
          {data.store.shopName}
        </span>

        <button
          onClick={() => setCartOpen(true)}
          className="relative p-2 cursor-pointer"
          aria-label={`Open cart, ${cartCount} items`}
        >
          <ShoppingBag size={22} color={COLORS.ink} />
          {cartCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-white text-[10px] font-bold"
              style={{ background: primary }}
            >
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      </header>

      {/* ── Hero Banner ── */}
      <section
        className="h-[280px] md:h-[340px] relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primary} 0%, #1a1a2e 100%)` }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="font-jakarta font-extrabold text-xs tracking-widest text-white/70 uppercase mb-3">
            NEW COLLECTION
          </p>
          <h1 className="font-jakarta font-extrabold text-4xl md:text-5xl text-white leading-none">
            {data.store.shopName}
          </h1>
          <p className="font-jakarta text-base text-white/70 mt-4 max-w-md">
            {tc?.heroDescription || data.store.description || 'Quality & style for every occasion'}
          </p>
          <button
            className="bg-white rounded-full px-6 py-2.5 font-jakarta font-bold text-sm mt-6 cursor-pointer hover:opacity-90 transition"
            style={{ color: primary }}
            onClick={() => {
              document.getElementById('rc-products')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Shop Now
          </button>
        </div>
      </section>

      {/* ── Category Tabs ── */}
      <nav
        className="bg-white border-b sticky top-14 z-10 overflow-x-auto"
        style={{ borderColor: COLORS.border }}
        aria-label="Product categories"
      >
        <div className="px-4 py-2 flex gap-1" style={{ minWidth: 'max-content' }}>
          {categories.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 font-jakarta font-semibold text-sm cursor-pointer rounded-lg transition whitespace-nowrap"
                style={{
                  color: isActive ? primary : COLORS.muted,
                  borderBottom: isActive ? `2px solid ${primary}` : '2px solid transparent',
                  background: 'transparent',
                }}
                aria-pressed={isActive}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Product Grid ── */}
      <main
        id="rc-products"
        className="px-4 md:px-8 py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-3">
            <ShoppingBag size={40} color={COLORS.muted} />
            <p className="font-jakarta text-sm" style={{ color: COLORS.muted }}>
              No products in this category yet
            </p>
          </div>
        ) : (
          filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              primary={primary}
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
      <footer className="px-6 md:px-12 py-10 text-white" style={{ background: COLORS.ink }}>
        <p className="font-jakarta font-extrabold text-xl">{data.store.shopName}</p>
        {(tc?.openingHours || data.store.openingHours) && (
          <p className="text-sm text-white/60 mt-1">{tc?.openingHours || data.store.openingHours}</p>
        )}
        {data.store.deliveryInfo && (
          <p className="text-sm text-white/60 mt-0.5">{data.store.deliveryInfo}</p>
        )}
      </footer>
    </div>
  );
}
