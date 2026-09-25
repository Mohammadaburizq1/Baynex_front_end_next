'use client';
import { formatMoney } from '@/lib/utils';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ChevronUp } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';
import { Cormorant_Garamond } from 'next/font/google';
import CheckoutDrawer from '@/components/storefront/restaurant-default/CheckoutDrawer';
import { ProductOptionsDialog } from '@/components/storefront/shared/ProductOptionsDialog';
import { readCartDraft, clearCartDraft } from '@/lib/utils/cart-draft';
import {
  addLine, cartCount as countOf, changeQty as changeLineQty, needsOptions, removeLine, restoreFromDraft,
  type CartLine,
} from '@/lib/utils/cart-lines';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], display: 'swap' });

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  bg: '#0A0A0A',
  cream: '#F5F0E8',
  gold: '#C9A962',
  muted: '#B8B0A6',
} as const;

// ─── Product Page ─────────────────────────────────────────────────────────────

function ProductPage({
  product,
  currencySuffix,
  inCart,
  onAdd,
}: {
  product: PublicProduct;
  currencySuffix: string;
  inCart: boolean;
  onAdd: () => void;
}) {
  const displayPrice = formatMoney((product.discountPrice ?? product.price), currencySuffix);

  return (
    <div className="min-h-screen snap-start relative overflow-hidden" style={{ background: C.bg }}>
      {/* Full-bleed image */}
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="absolute inset-0 object-cover w-full h-full"
          loading="lazy"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #1a1008 0%, #2c1a0a 35%, #0f0c08 65%, #1a1008 100%)',
          }}
        />
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.35) 62%, rgba(0,0,0,0.88) 100%)',
        }}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-20">
        {/* Category */}
        <p
          className={`${playfair.className} font-semibold text-xs uppercase mb-2`}
          style={{ color: C.gold, letterSpacing: '3px' }}
        >
          {product.category}
        </p>

        {/* Name */}
        <h2
          className={`${playfair.className} font-semibold text-[#F5F0E8] leading-[1.1] mb-2`}
          style={{ fontSize: '36px' }}
        >
          {product.name}
        </h2>

        {/* Description */}
        <p
          className={`${cormorant.className} font-normal italic leading-[1.45] mb-4`}
          style={{ fontSize: '20px', color: C.muted }}
        >
          {product.description}
        </p>

        {/* Price */}
        <p
          className={`${playfair.className} font-bold mb-5`}
          style={{ fontSize: '28px', color: C.cream }}
        >
          {displayPrice}
        </p>

        {/* Add to selection */}
        {inCart ? (
          <p
            className={`${playfair.className} font-semibold text-sm`}
            style={{ color: C.gold }}
          >
            In selection ✓
          </p>
        ) : (
          <button
            onClick={onAdd}
            className={`${playfair.className} font-semibold text-sm px-6 py-3 cursor-pointer`}
            style={{ border: `1px solid ${C.gold}`, color: C.cream, background: 'transparent' }}
          >
            Add to selection
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CuppingRoomTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;

  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  // The product whose variant / add-on choices are being made (null = dialog closed).
  const [optionsFor, setOptionsFor] = useState<PublicProduct | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore a cart saved before a guest was redirected to /customer/login (see CheckoutDrawer).
  useEffect(() => {
    const draft = readCartDraft(store.slug);
    if (!draft || draft.length === 0) return;
    const restored = restoreFromDraft(draft, products);
    if (restored.length > 0) {
      setCart(restored);
      setPanelOpen(true);
    }
    clearCartDraft(store.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.slug]);

  const availableProducts = useMemo(
    () => products.filter((p) => p.available),
    [products],
  );

  const cartCount = countOf(cart);

  const isInCart = (id: number) => cart.some((i) => i.product.id === id);

  const addToCart = (product: PublicProduct) => {
    // A product with variants or add-ons needs the customer to choose first.
    if (needsOptions(product)) {
      setOptionsFor(product);
      return;
    }
    setCart((prev) => addLine(prev, product, 1));
  };

  // Track active page via scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const pageHeight = el.clientHeight;
      if (pageHeight === 0) return;
      const idx = Math.round(el.scrollTop / pageHeight);
      setActiveIdx(Math.max(0, Math.min(idx, availableProducts.length - 1)));
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [availableProducts.length]);

  const scrollToPage = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: idx * el.clientHeight, behavior: 'smooth' });
  };

  if (availableProducts.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <p className={`${cormorant.className} italic text-xl`} style={{ color: C.muted }}>
          No offerings available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ background: C.bg, fontFamily: playfair.style.fontFamily }}>
      {/* Absolute header */}
      <header className="absolute top-0 z-20 w-full px-6 py-5 flex items-center justify-between">
        <span
          className={`${playfair.className} font-semibold`}
          style={{ fontSize: '22px', color: C.cream }}
        >
          {store.shopName}
        </span>

        <button
          onClick={() => setPanelOpen(true)}
          className={`${playfair.className} font-semibold text-xs flex items-center gap-1.5 rounded-2xl px-3 py-1.5 cursor-pointer`}
          style={{
            border: '1px solid rgba(201,169,98,0.5)',
            background: 'rgba(201,169,98,0.15)',
            color: C.gold,
          }}
          aria-label={`Cart, ${cartCount} items`}
        >
          <span>Selection</span>
          {cartCount > 0 && <span>({cartCount})</span>}
        </button>
      </header>

      {/* Main scroll container */}
      <div
        ref={scrollRef}
        className="h-screen overflow-y-auto snap-y snap-mandatory"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {availableProducts.map((product) => (
          <ProductPage
            key={product.id}
            product={product}
            currencySuffix={store.currencySuffix}
            inCart={isInCart(product.id)}
            onAdd={() => addToCart(product)}
          />
        ))}
      </div>

      {/* Page dots */}
      <nav
        className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20"
        aria-label="Product navigation"
      >
        {availableProducts.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToPage(i)}
            aria-label={`Go to product ${i + 1}`}
            className="rounded-full cursor-pointer transition-all duration-300"
            style={{
              background: activeIdx === i ? C.gold : 'rgba(197,169,98,0.3)',
              width: '6px',
              height: activeIdx === i ? '32px' : '12px',
              border: 'none',
              padding: 0,
            }}
          />
        ))}
      </nav>

      {/* View selection floating button */}
      {cartCount > 0 && (
        <button
          onClick={() => setPanelOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 rounded-2xl px-6 py-3 flex items-center gap-2 cursor-pointer"
          style={{
            background: 'rgba(10,10,10,0.85)',
            border: '1px solid rgba(201,169,98,0.4)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <ChevronUp size={16} color={C.gold} />
          <span
            className={`${playfair.className} font-semibold text-base`}
            style={{ color: C.cream }}
          >
            View selection ({cartCount})
          </span>
        </button>
      )}

      <ProductOptionsDialog
        product={optionsFor}
        currencySuffix={store.currencySuffix}
        accent={C.gold}
        onClose={() => setOptionsFor(null)}
        onConfirm={(selection, qty) => {
          if (optionsFor) setCart((prev) => addLine(prev, optionsFor, qty, selection));
          setOptionsFor(null);
        }}
      />
      <CheckoutDrawer
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
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
