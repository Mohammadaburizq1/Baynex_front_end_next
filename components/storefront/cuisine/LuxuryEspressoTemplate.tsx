'use client';
import { formatMoney } from '@/lib/utils';

import { useEffect, useState } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import { Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import CheckoutDrawer from '@/components/storefront/restaurant-default/CheckoutDrawer';
import { ProductOptionsDialog } from '@/components/storefront/shared/ProductOptionsDialog';
import { readCartDraft, clearCartDraft } from '@/lib/utils/cart-draft';
import {
  addLine, cartCount as countOf, cartSubtotal, changeQty as changeLineQty, needsOptions, removeLine, restoreFromDraft,
  type CartLine,
} from '@/lib/utils/cart-lines';

/** Key of the one (no variant, no add-ons) line a plain product gets — matches lineKey()'s format. */
function simpleKey(productId: number): string {
  return `${productId}||`;
}

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700', '900'], style: ['normal', 'italic'], display: 'swap' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], display: 'swap' });

const GOLD = '#C9A84C';
const GOLD_LIGHT = '#F0D080';
const GOLD_DIM = 'rgba(201,168,76,0.35)';

export default function LuxuryEspressoTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  // The product whose variant / add-on choices are being made (null = dialog closed).
  const [optionsFor, setOptionsFor] = useState<PublicProduct | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

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

  const totalItems = countOf(cart);
  const totalPrice = cartSubtotal(cart);

  function qtyOf(productId: number): number {
    return cart.filter(l => l.product.id === productId).reduce((s, l) => s + l.qty, 0);
  }

  const add = (id: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    // A product with variants or add-ons needs the customer to choose first.
    if (needsOptions(product)) {
      setOptionsFor(product);
      return;
    }
    setCart(prev => addLine(prev, product, 1));
  };
  const sub = (id: number) => setCart(prev => changeLineQty(prev, simpleKey(id), -1));

  const available = products.filter(p => p.available);
  const categories = ['All', ...Array.from(new Set(available.map(p => p.category)))];
  const filtered = activeCategory === 'All' ? available : available.filter(p => p.category === activeCategory);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -400% center; }
          100% { background-position: 400% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes goldPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); }
          50%     { box-shadow: 0 0 18px 3px rgba(201,168,76,0.25); }
        }
        @keyframes grainMove {
          0%  { transform: translate(0,0); }
          20% { transform: translate(-2%,2%); }
          40% { transform: translate(2%,-1%); }
          60% { transform: translate(-1%,3%); }
          80% { transform: translate(3%,-2%); }
          100%{ transform: translate(0,0); }
        }
        .gold-shimmer {
          background: linear-gradient(90deg,
            #6B4E0A 0%, #C9A84C 20%, #F0D080 40%,
            #C9A84C 60%, #F0D080 80%, #6B4E0A 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }
        .lx-hero-in { animation: fadeUp 1s ease forwards; }
        .lx-hero-in-2 { animation: fadeUp 1s 0.2s ease both; }
        .lx-hero-in-3 { animation: fadeUp 1s 0.4s ease both; }
        .lx-divider span {
          display: block;
          height: 1px;
          background: linear-gradient(90deg, transparent, ${GOLD}, transparent);
          transform-origin: center;
          animation: lineGrow 1.4s 0.6s ease both;
        }
        .lx-row { position: relative; }
        .lx-row::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 2px;
          background: ${GOLD};
          transform: scaleY(0);
          transition: transform 0.35s ease;
          transform-origin: top;
        }
        .lx-row:hover::before { transform: scaleY(1); }
        .lx-row:hover .lx-name { -webkit-text-fill-color: ${GOLD_LIGHT}; }
        .cta-gold { animation: goldPulse 3s ease-in-out infinite; }
        .grain-overlay {
          position: fixed; inset: 0; pointer-events: none; z-index: 1;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          animation: grainMove 8s steps(1) infinite;
          opacity: 0.35;
        }
      `}</style>

      <div className={`min-h-screen relative ${cormorant.className}`} style={{ background: '#080808', color: '#E8E0D0' }}>
        <div className="grain-overlay" aria-hidden />

        {/* ═══════════════════════════════
            HERO
        ═══════════════════════════════ */}
        <section className="relative flex flex-col items-center justify-center min-h-[100dvh] px-6 text-center overflow-hidden">

          {/* Subtle radial vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)' }} />

          {/* Opening hours badge */}
          <p className="lx-hero-in mb-8 text-xs tracking-[0.4em] uppercase" style={{ color: GOLD_DIM }}>
            {tc?.openingHours || store.openingHours}
          </p>

          {/* Store name */}
          <h1 className={`${playfair.className} lx-hero-in-2 text-5xl sm:text-7xl lg:text-8xl font-bold leading-tight mb-6`}>
            <span className="gold-shimmer">{store.shopName}</span>
          </h1>

          {/* Ornamental divider */}
          <div className="lx-hero-in-3 lx-divider flex items-center gap-4 mb-6 w-full max-w-xs">
            <span style={{ flex: 1 }} />
            <span className={`${playfair.className} text-lg italic`} style={{ color: GOLD, lineHeight: 1, WebkitTextFillColor: GOLD }}>◆</span>
            <span style={{ flex: 1 }} />
          </div>

          <p className="lx-hero-in-3 text-lg sm:text-xl italic mb-10 max-w-sm" style={{ color: 'rgba(232,224,208,0.55)', animationDelay: '0.5s' }}>
            {tc?.heroDescription || store.description}
          </p>

          <button
            className="cta-gold px-10 py-3 text-sm tracking-[0.3em] uppercase cursor-pointer transition-colors duration-300"
            style={{ border: `1px solid ${GOLD}`, color: GOLD, background: 'transparent' }}
            onClick={() => document.getElementById('lx-menu')?.scrollIntoView({ behavior: 'smooth' })}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,168,76,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            View Menu
          </button>

          {/* Bottom scroll line */}
          <div className="absolute bottom-8 flex flex-col items-center gap-2" style={{ color: GOLD_DIM }}>
            <span className="text-[10px] tracking-[0.3em] uppercase">Menu</span>
            <div className="w-px h-10" style={{ background: `linear-gradient(to bottom, ${GOLD_DIM}, transparent)` }} />
          </div>
        </section>

        {/* ═══════════════════════════════
            MENU
        ═══════════════════════════════ */}
        <section id="lx-menu" className="max-w-3xl mx-auto px-4 sm:px-8 py-24">

          {/* Section header */}
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.45em] uppercase mb-4" style={{ color: GOLD_DIM }}>The Selection</p>
            <h2 className={`${playfair.className} text-4xl sm:text-5xl italic font-semibold mb-6`} style={{ color: '#E8E0D0' }}>
              Today&apos;s Menu
            </h2>
            <div className="flex items-center gap-4 justify-center">
              <div className="h-px flex-1 max-w-24" style={{ background: `linear-gradient(to right, transparent, ${GOLD_DIM})` }} />
              <span className={`${playfair.className} text-base`} style={{ color: GOLD }}>◆</span>
              <div className="h-px flex-1 max-w-24" style={{ background: `linear-gradient(to left, transparent, ${GOLD_DIM})` }} />
            </div>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {categories.map(cat => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="text-sm tracking-[0.2em] uppercase cursor-pointer transition-all duration-300 pb-1"
                  style={{
                    color: active ? GOLD : 'rgba(232,224,208,0.4)',
                    borderBottom: active ? `1px solid ${GOLD}` : '1px solid transparent',
                    background: 'none',
                    fontFamily: cormorant.style.fontFamily,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Tasting-menu list */}
          <div style={{ borderTop: `1px solid rgba(201,168,76,0.12)` }}>
            {filtered.map((product, i) => {
              const qty = qtyOf(product.id);
              const display = formatMoney(product.discountPrice ?? product.price, store.currencySuffix);

              return (
                <div
                  key={product.id}
                  className="lx-row px-3 py-6 flex items-start gap-5"
                  style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}
                >
                  {/* Index */}
                  <span className="text-xs font-mono shrink-0 pt-1" style={{ color: 'rgba(201,168,76,0.3)', minWidth: 24 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Name + description */}
                  <div className="flex-1 min-w-0">
                    <p className={`${playfair.className} lx-name text-xl sm:text-2xl font-semibold mb-1 transition-all duration-300`} style={{ color: '#E8E0D0' }}>
                      {product.name}
                    </p>
                    <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(232,224,208,0.45)' }}>
                      {product.description}
                    </p>
                  </div>

                  {/* Price + controls */}
                  <div className="shrink-0 flex flex-col items-end gap-3 pl-4">
                    <div className="text-right">
                      <span className={`${playfair.className} text-xl font-semibold`} style={{ color: GOLD }}>
                        {display}
                      </span>
                      {product.discountPrice && (
                        <span className="ml-2 text-sm line-through" style={{ color: 'rgba(201,168,76,0.3)' }}>
                          {formatMoney(product.price, store.currencySuffix)}
                        </span>
                      )}
                    </div>
                    {qty === 0 ? (
                      <button
                        onClick={() => add(product.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
                        style={{ border: `1px solid ${GOLD_DIM}`, color: GOLD, background: 'transparent' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,168,76,0.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                      >
                        <Plus size={14} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={() => sub(product.id)} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer" style={{ border: `1px solid ${GOLD_DIM}`, color: GOLD, background: 'transparent' }}>
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-semibold w-4 text-center" style={{ color: GOLD }}>{qty}</span>
                        <button onClick={() => add(product.id)} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer" style={{ border: `1px solid ${GOLD_DIM}`, color: GOLD, background: 'transparent' }}>
                          <Plus size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs tracking-widest uppercase mt-10" style={{ color: 'rgba(201,168,76,0.25)' }}>
            {store.deliveryInfo}
          </p>
        </section>

        {/* ═══════════════════════════════
            CART BAR
        ═══════════════════════════════ */}
        {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(8,8,8,0.97)', borderTop: `1px solid rgba(201,168,76,0.2)`, backdropFilter: 'blur(20px)' }}>
            <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} style={{ color: GOLD }} />
                <span className="text-sm" style={{ color: 'rgba(232,224,208,0.55)' }}>
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => setCartOpen(true)}
                className="px-8 py-2.5 text-sm tracking-[0.2em] uppercase cursor-pointer transition-all duration-200"
                style={{ border: `1px solid ${GOLD}`, color: '#080808', background: GOLD }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = GOLD_LIGHT; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = GOLD; }}
              >
                Checkout — {formatMoney(totalPrice, store.currencySuffix)}
              </button>
            </div>
          </div>
        )}

        <ProductOptionsDialog
          product={optionsFor}
          currencySuffix={store.currencySuffix}
          accent={GOLD}
          onClose={() => setOptionsFor(null)}
          onConfirm={(selection, qty) => {
            if (optionsFor) setCart(prev => addLine(prev, optionsFor, qty, selection));
            setOptionsFor(null);
          }}
        />
        <CheckoutDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          storeSlug={store.slug}
          cart={cart}
          currencySuffix={store.currencySuffix}
          onChangeQty={(key, delta) => setCart(prev => changeLineQty(prev, key, delta))}
          onRemove={(key) => setCart(prev => removeLine(prev, key))}
          onOrderPlaced={() => setCart([])}
        />
      </div>
    </>
  );
}
