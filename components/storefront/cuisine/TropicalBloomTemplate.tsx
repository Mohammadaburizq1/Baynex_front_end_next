'use client';
import { formatMoney } from '@/lib/utils';

import { useEffect, useState } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import { Pacifico, Nunito } from 'next/font/google';
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

const pacifico = Pacifico({ subsets: ['latin'], weight: ['400'], display: 'swap' });
const nunito = Nunito({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], display: 'swap' });

// Tropical colour wheel — one per card
const CARD_COLORS = [
  { bg: '#FF6B35', text: '#fff', badge: '#FFD93D' },  // coral
  { bg: '#FFD93D', text: '#1A2A1A', badge: '#FF6B35' }, // yellow
  { bg: '#2EC4B6', text: '#fff', badge: '#FF6B35' },   // teal
  { bg: '#FF3EA5', text: '#fff', badge: '#FFD93D' },   // hot pink
  { bg: '#A8E063', text: '#1A2A1A', badge: '#FF6B35' }, // lime
  { bg: '#FF6B35', text: '#fff', badge: '#A8E063' },
  { bg: '#2EC4B6', text: '#fff', badge: '#FFD93D' },
  { bg: '#FF3EA5', text: '#fff', badge: '#A8E063' },
];

const LEAVES = [
  { emoji: '🌿', x: 5,  animDur: 9,  animDel: 0,   size: 28 },
  { emoji: '🌺', x: 15, animDur: 7,  animDel: 1.5, size: 22 },
  { emoji: '🍃', x: 25, animDur: 11, animDel: 0.8, size: 20 },
  { emoji: '🌸', x: 38, animDur: 8,  animDel: 2.3, size: 18 },
  { emoji: '🌿', x: 55, animDur: 10, animDel: 0.4, size: 24 },
  { emoji: '🌺', x: 68, animDur: 6,  animDel: 3.0, size: 20 },
  { emoji: '🍃', x: 80, animDur: 9,  animDel: 1.1, size: 26 },
  { emoji: '🌸', x: 92, animDur: 8,  animDel: 2.7, size: 18 },
  { emoji: '🌿', x: 72, animDur: 12, animDel: 0.2, size: 22 },
  { emoji: '🌺', x: 44, animDur: 7,  animDel: 4.0, size: 16 },
];

export default function TropicalBloomTemplate({ data }: { data: StorefrontData }) {
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
        @keyframes leafDrift {
          0%   { transform: translateY(-60px) rotate(-15deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.8; }
          100% { transform: translateY(110vh) rotate(25deg); opacity: 0; }
        }
        @keyframes sunPulse {
          0%,100% { transform: scale(1); opacity: 0.55; }
          50%     { transform: scale(1.08); opacity: 0.75; }
        }
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounceIn {
          0%   { transform: scale(0.6); opacity: 0; }
          60%  { transform: scale(1.1); }
          80%  { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes waveSway {
          0%,100% { transform: rotate(-2deg) translateY(0); }
          50%     { transform: rotate(2deg) translateY(-6px); }
        }
        @keyframes shimmerTrop {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .leaf-float { animation: leafDrift linear infinite; pointer-events: none; }
        .sun-glow   { animation: sunPulse 4s ease-in-out infinite; }
        .hero-word  { animation: heroIn 0.9s cubic-bezier(0.34,1.56,0.64,1) both; }
        .trop-card  {
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
        }
        .trop-card:hover {
          transform: rotate(0deg) scale(1.05) translateY(-6px) !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.4) !important;
        }
        .cat-btn {
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s;
        }
        .cat-btn:hover { transform: scale(1.08); }
        .cat-btn:active { transform: scale(0.93); }
        .cta-tropical {
          animation: waveSway 3s ease-in-out infinite;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cta-tropical:hover {
          transform: rotate(0deg) scale(1.06) !important;
          box-shadow: 0 8px 30px rgba(255,107,53,0.5) !important;
        }
      `}</style>

      <div className={`min-h-screen relative overflow-x-hidden ${nunito.className}`} style={{ background: '#0B2A1D', color: '#FFF5E0' }}>

        {/* ═══════════════════════════════
            HERO
        ═══════════════════════════════ */}
        <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">

          {/* Sun burst glow */}
          <div className="sun-glow absolute top-[-10%] left-1/2 -translate-x-1/2 rounded-full pointer-events-none" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(255,217,61,0.25) 0%, rgba(255,107,53,0.12) 40%, transparent 70%)', filter: 'blur(40px)' }} />

          {/* Floating leaves */}
          {LEAVES.map((l, i) => (
            <span
              key={i}
              className="leaf-float absolute top-0 select-none"
              style={{
                left: `${l.x}%`,
                fontSize: l.size,
                animationDuration: `${l.animDur}s`,
                animationDelay: `${l.animDel}s`,
              }}
            >
              {l.emoji}
            </span>
          ))}

          {/* Badge */}
          <div className="hero-word mb-6 px-5 py-1.5 rounded-full text-xs font-bold tracking-[0.25em] uppercase" style={{ animationDelay: '0s', background: 'rgba(255,107,53,0.2)', border: '1px solid rgba(255,107,53,0.4)', color: '#FF6B35' }}>
            ☀️ {store.shopName}
          </div>

          {/* Main headline */}
          <div className="mb-6">
            <h1 className={`${pacifico.className} hero-word text-6xl sm:text-8xl lg:text-9xl leading-tight`} style={{ animationDelay: '0.15s', color: '#FFD93D', textShadow: '4px 4px 0px rgba(255,107,53,0.5)' }}>
              RISE
            </h1>
            <h1 className={`${pacifico.className} hero-word text-6xl sm:text-8xl lg:text-9xl leading-tight`} style={{ animationDelay: '0.3s', color: '#FF6B35', textShadow: '4px 4px 0px rgba(255,215,61,0.3)' }}>
              & SIP
            </h1>
          </div>

          <p className="hero-word text-lg sm:text-xl mb-12 max-w-sm leading-relaxed" style={{ animationDelay: '0.45s', color: 'rgba(255,245,224,0.65)' }}>
            {tc?.heroDescription || store.description}
          </p>

          {/* CTA */}
          <button
            className="cta-tropical px-10 py-4 rounded-full text-base font-extrabold tracking-wide uppercase cursor-pointer"
            style={{ background: '#FF6B35', color: '#fff', boxShadow: '0 6px 24px rgba(255,107,53,0.45)', rotate: '-1.5deg' }}
            onClick={() => document.getElementById('tb-menu')?.scrollIntoView({ behavior: 'smooth' })}
          >
            🌺 See The Menu
          </button>

          {/* Scroll hint */}
          <div className="absolute bottom-8 flex flex-col items-center gap-2" style={{ color: 'rgba(255,245,224,0.3)' }}>
            <span className="text-[10px] tracking-widest uppercase">Scroll</span>
            <div className="w-px h-10" style={{ background: 'linear-gradient(to bottom, rgba(255,107,53,0.5), transparent)' }} />
          </div>
        </section>

        {/* ═══════════════════════════════
            MENU
        ═══════════════════════════════ */}
        <section id="tb-menu" className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20">

          {/* Section header */}
          <div className="text-center mb-14">
            <h2 className={`${pacifico.className} text-5xl sm:text-6xl mb-4`} style={{ color: '#FFD93D', textShadow: '3px 3px 0 rgba(255,107,53,0.4)' }}>
              The Menu
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,245,224,0.4)' }}>
              {tc?.openingHours || store.openingHours}{store.deliveryInfo ? ` · ${store.deliveryInfo}` : ''}
            </p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat, idx) => {
              const active = activeCategory === cat;
              const clr = CARD_COLORS[idx % CARD_COLORS.length];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="cat-btn px-5 py-2 rounded-full text-xs font-extrabold tracking-widest uppercase cursor-pointer"
                  style={{
                    background: active ? clr.bg : 'rgba(255,255,255,0.07)',
                    color: active ? clr.text : 'rgba(255,245,224,0.5)',
                    border: `2px solid ${active ? clr.bg : 'rgba(255,245,224,0.12)'}`,
                    boxShadow: active ? `0 4px 16px ${clr.bg}60` : 'none',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Polaroid card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filtered.map((product, i) => {
              const clr = CARD_COLORS[i % CARD_COLORS.length];
              const tilt = i % 2 === 0 ? '-2deg' : '2deg';
              const qty = qtyOf(product.id);
              const display = formatMoney(product.discountPrice ?? product.price, store.currencySuffix);

              return (
                <div
                  key={product.id}
                  className="trop-card relative flex flex-col"
                  style={{
                    background: '#fff',
                    borderRadius: 4,
                    padding: '16px 16px 48px',
                    transform: `rotate(${tilt})`,
                    boxShadow: '6px 6px 24px rgba(0,0,0,0.35)',
                  }}
                >
                  {/* Polaroid colour block (the "photo") */}
                  <div className="w-full rounded-sm mb-3 flex items-center justify-center relative overflow-hidden" style={{ background: clr.bg, height: 120 }}>
                    <span className="text-5xl select-none">☕</span>
                    {product.discountPrice && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase" style={{ background: clr.badge, color: '#1A2A1A' }}>
                        SALE
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: clr.bg }}>
                    {product.category}
                  </p>
                  <h3 className={`${nunito.className} text-sm font-extrabold mb-2 leading-snug`} style={{ color: '#1A2A1A' }}>
                    {product.name}
                  </h3>
                  <p className="text-xs leading-relaxed flex-1 mb-4" style={{ color: '#666' }}>
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold" style={{ color: clr.bg }}>{display}</span>
                      {product.discountPrice && (
                        <span className="ml-1 text-xs line-through" style={{ color: '#aaa' }}>{formatMoney(product.price, store.currencySuffix)}</span>
                      )}
                    </div>
                    {qty === 0 ? (
                      <button
                        onClick={() => add(product.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer font-black text-sm transition-transform duration-150 hover:scale-110 active:scale-95"
                        style={{ background: clr.bg, color: clr.text }}
                      >
                        <Plus size={14} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => sub(product.id)} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer text-xs font-black" style={{ background: clr.bg, color: clr.text }}>
                          <Minus size={11} />
                        </button>
                        <span className="w-5 text-center text-sm font-extrabold" style={{ color: '#1A2A1A' }}>{qty}</span>
                        <button onClick={() => add(product.id)} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer text-xs font-black" style={{ background: clr.bg, color: clr.text }}>
                          <Plus size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════
            CART BAR
        ═══════════════════════════════ */}
        {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(11,42,29,0.97)', borderTop: '2px solid #FF6B35', backdropFilter: 'blur(20px)' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} style={{ color: '#FFD93D' }} />
                <span className="text-sm font-bold" style={{ color: 'rgba(255,245,224,0.7)' }}>
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => setCartOpen(true)}
                className="px-8 py-2.5 rounded-full text-sm font-extrabold tracking-wide uppercase cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: '#FF6B35', color: '#fff', boxShadow: '0 4px 16px rgba(255,107,53,0.4)' }}
              >
                Checkout — {formatMoney(totalPrice, store.currencySuffix)} 🌺
              </button>
            </div>
          </div>
        )}

        <ProductOptionsDialog
          product={optionsFor}
          currencySuffix={store.currencySuffix}
          accent="#FF6B35"
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
