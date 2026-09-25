'use client';
import { formatMoney } from '@/lib/utils';

import { useEffect, useState } from 'react';
import { Bebas_Neue, Work_Sans } from 'next/font/google';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ShoppingBag, Flame } from 'lucide-react';
import CheckoutDrawer from '@/components/storefront/restaurant-default/CheckoutDrawer';
import { ProductOptionsDialog } from '@/components/storefront/shared/ProductOptionsDialog';
import { readCartDraft, clearCartDraft } from '@/lib/utils/cart-draft';
import {
  addLine, cartCount as countOf, cartSubtotal, changeQty as changeLineQty, needsOptions, removeLine, restoreFromDraft,
  type CartLine,
} from '@/lib/utils/cart-lines';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });
const workSans = Work_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

const CATEGORIES = ['All', 'BBQ', 'Sides', 'Drinks', 'Desserts'];

const EMBERS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: (i * 4.6 + 2) % 98,
  y: 20 + (i * 3.7) % 60,
  size: 2 + (i % 4),
  color: i % 3 === 0 ? '#E91E8C' : i % 3 === 1 ? '#FF6FCF' : '#9C27B0',
  delay: (i * 0.38) % 5,
  duration: 3 + (i % 4),
}));

const CARD_GLOWS = ['#E91E8C', '#9C27B0', '#FF6FCF', '#E91E8C', '#7B1FA2'];

export default function KoreanGrilleTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  // Real stores filter by their own categories; the fixed list is showcase-only (it matched nothing real).
  const categories = data.demo ? CATEGORIES : ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const tc = data.templateContent;
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  // The product whose variant / add-on choices are being made (null = dialog closed).
  const [optionsFor, setOptionsFor] = useState<PublicProduct | null>(null);

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

  const filtered =
    activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory);

  const addToCart = (p: PublicProduct) => {
    // A product with variants or add-ons needs the customer to choose first.
    if (needsOptions(p)) {
      setOptionsFor(p);
      return;
    }
    setCart((prev) => addLine(prev, p, 1));
  };

  const total = cartSubtotal(cart);
  const itemCount = countOf(cart);

  return (
    <>
      <style>{`
        @keyframes emberFloat {
          0%   { transform: translate(0, 0) scale(1); opacity: 0.7; }
          50%  { transform: translate(var(--dx), calc(var(--dy) - 50px)) scale(0.7); opacity: 0.4; }
          100% { transform: translate(calc(var(--dx) * 1.5), calc(var(--dy) - 100px)) scale(0); opacity: 0; }
        }
        @keyframes neonFlick {
          0%, 92%, 100% { opacity: 1; filter: drop-shadow(0 0 8px #E91E8CAA); }
          93% { opacity: 0.2; filter: none; }
          95% { opacity: 0.8; filter: drop-shadow(0 0 4px #E91E8C88); }
          97% { opacity: 0.3; filter: none; }
        }
        @keyframes heroUp {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(26px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cartSlide {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes magentaGlow {
          0%, 100% { box-shadow: 0 0 24px #E91E8C44; }
          50%       { box-shadow: 0 0 48px #E91E8CAA; }
        }
        .kg-card {
          background: #160C18;
          border: 1px solid #2E1A32;
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.22s, transform 0.22s, box-shadow 0.22s;
          animation: cardIn 0.45s ease both;
        }
        .kg-card:hover {
          border-color: #E91E8C;
          transform: translateY(-5px);
          box-shadow: 0 8px 36px #E91E8C28;
        }
        .kg-tab {
          padding: 7px 18px;
          border-radius: 6px;
          border: 1px solid #2E1A32;
          background: transparent;
          color: #7A5A82;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .kg-tab.active { background: #E91E8C; border-color: #E91E8C; color: white; }
        .kg-tab:hover:not(.active) { border-color: #E91E8CAA; color: #F0D0F8; }
        .kg-add {
          background: #E91E8C;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 9px 18px;
          cursor: pointer;
          font-weight: 700;
          transition: background 0.18s, transform 0.14s;
        }
        .kg-add:hover { background: #C2185B; transform: scale(1.04); }
      `}</style>

      <div style={{ background: '#0D0810', minHeight: '100vh', fontFamily: workSans.style.fontFamily, position: 'relative', overflowX: 'hidden' }}>

        {/* Floating embers */}
        {EMBERS.map((e) => (
          <div key={e.id} style={{
            position: 'fixed',
            left: `${e.x}%`,
            top: `${e.y}%`,
            width: e.size,
            height: e.size,
            borderRadius: '50%',
            background: e.color,
            boxShadow: `0 0 ${e.size * 2}px ${e.color}`,
            animation: `emberFloat ${e.duration}s ${e.delay}s ease-out infinite`,
            ['--dx' as string]: `${-10 + (e.id % 20)}px`,
            ['--dy' as string]: `${-20 - (e.id % 30)}px`,
            pointerEvents: 'none',
            zIndex: 0,
          }} />
        ))}

        {/* Magenta gradient orb */}
        <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 300, background: 'radial-gradient(ellipse, #E91E8C0A, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(13,8,16,0.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid #2E1A32', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #E91E8C, #9C27B0)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={18} color="white" fill="white" />
            </div>
            <span className={bebas.className} style={{ fontSize: 24, color: '#F0D0F8', letterSpacing: '0.05em', animation: 'neonFlick 8s 3s ease infinite' }}>
              {store.shopName}
            </span>
          </div>
          <button onClick={() => setCartOpen(true)} style={{ background: 'transparent', border: '1px solid #E91E8C', color: '#E91E8C', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: workSans.style.fontFamily, fontWeight: 700, fontSize: 14 }}>
            <ShoppingBag size={15} />
            {itemCount > 0 ? `Cart (${itemCount})` : 'Order'}
          </button>
        </header>

        {/* Hero */}
        <section style={{ position: 'relative', padding: '84px 24px 64px', textAlign: 'center', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid #E91E8C55', borderRadius: 100, padding: '5px 16px', marginBottom: 22, animation: 'heroUp 0.5s 0.1s ease both', opacity: 0 }}>
            <Flame size={12} color="#E91E8C" fill="#E91E8C" />
            <span className={workSans.className} style={{ color: '#E91E8C', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>K-BBQ · Live Fire · Seoul Style</span>
          </div>
          <h1 className={bebas.className} style={{
            fontSize: 'clamp(56px, 13vw, 124px)',
            color: '#F0D0F8',
            lineHeight: 0.88,
            letterSpacing: '0.02em',
            animation: 'heroUp 0.55s 0.2s ease both, neonFlick 10s 5s ease infinite',
            opacity: 0,
            filter: 'drop-shadow(0 0 20px #E91E8C66)',
          }}>
            {store.shopName}
          </h1>
          {/* Magenta neon underline */}
          <div style={{ width: 140, height: 3, background: 'linear-gradient(90deg, transparent, #E91E8C, #9C27B0, transparent)', margin: '22px auto', borderRadius: 2 }} />
          <p className={workSans.className} style={{ color: '#7A5A82', fontSize: 18, maxWidth: 460, margin: '0 auto 36px', lineHeight: 1.6, fontWeight: 400, animation: 'heroUp 0.55s 0.38s ease both', opacity: 0 }}>
            {tc?.heroDescription || store.description}
          </p>
          <button onClick={() => document.getElementById('kg-menu')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'linear-gradient(135deg, #E91E8C, #9C27B0)', color: 'white', border: 'none', borderRadius: 8, padding: '14px 40px', fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', fontFamily: workSans.style.fontFamily, animation: 'heroUp 0.55s 0.5s ease both, magentaGlow 2.5s 2s ease infinite', opacity: 0, boxShadow: '0 8px 32px #E91E8C44' }}>
            VIEW MENU
          </button>
        </section>

        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #2E1A32 30%, #2E1A32 70%, transparent)', margin: '0 24px' }} />

        {/* Menu */}
        <section id="kg-menu" style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 24px 130px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <p className={workSans.className} style={{ color: '#E91E8C', fontSize: 11, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', marginBottom: 6 }}>Live Fire Menu</p>
              <h2 className={bebas.className} style={{ fontSize: 42, color: '#F0D0F8', letterSpacing: '0.04em' }}>TONIGHT'S MENU</h2>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button key={cat} className={`kg-tab${activeCategory === cat ? ' active' : ''} ${workSans.className}`} style={{ fontSize: 13, fontWeight: 700 }} onClick={() => setActiveCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 22 }}>
            {filtered.map((p, i) => {
              const glow = CARD_GLOWS[i % CARD_GLOWS.length];
              return (
                <div key={p.id} className="kg-card" style={{ animationDelay: `${i * 0.07}s` }}>
                  {/* Glow top accent bar */}
                  <div style={{ height: 3, background: `linear-gradient(90deg, ${glow}, ${CARD_GLOWS[(i + 1) % CARD_GLOWS.length]})` }} />
                  <div style={{ height: 200, background: `linear-gradient(135deg, #1A0E22, #230F2A)`, position: 'relative', overflow: 'hidden' }}>
                    {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(transparent, #160C18)' }} />
                    {p.discountPrice && (
                      <div className={workSans.className} style={{ position: 'absolute', top: 12, right: 12, background: '#E91E8C', color: 'white', borderRadius: 4, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>DEAL</div>
                    )}
                  </div>
                  <div style={{ padding: '16px 20px 20px' }}>
                    <div className={workSans.className} style={{ fontSize: 10, color: glow, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>{p.category}</div>
                    <h3 className={bebas.className} style={{ fontSize: 24, color: '#F0D0F8', letterSpacing: '0.04em', marginBottom: 8 }}>{p.name}</h3>
                    <p className={workSans.className} style={{ fontSize: 13, color: '#5A3D62', lineHeight: 1.55, marginBottom: 18, fontWeight: 400 }}>{p.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        {p.discountPrice ? (
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span className={bebas.className} style={{ fontSize: 26, color: glow }}>{formatMoney(p.discountPrice, store.currencySuffix)}</span>
                            <span className={workSans.className} style={{ fontSize: 13, color: '#4A2A52', textDecoration: 'line-through' }}>{formatMoney(p.price, store.currencySuffix)}</span>
                          </div>
                        ) : (
                          <span className={bebas.className} style={{ fontSize: 26, color: glow }}>{formatMoney(p.price, store.currencySuffix)}</span>
                        )}
                      </div>
                      <button className={`kg-add ${workSans.className}`} style={{ fontSize: 13, background: glow }} onClick={() => addToCart(p)}>Add +</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <ProductOptionsDialog
          product={optionsFor}
          currencySuffix={store.currencySuffix}
          accent="#E91E8C"
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

        {/* Bottom bar */}
        {itemCount > 0 && !cartOpen && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, padding: '0 24px 20px' }}>
            <button onClick={() => setCartOpen(true)} className={workSans.className} style={{ width: '100%', maxWidth: 600, margin: '0 auto', display: 'flex', background: 'linear-gradient(135deg, #E91E8C, #9C27B0)', border: 'none', borderRadius: 10, padding: '15px 24px', cursor: 'pointer', alignItems: 'center', justifyContent: 'space-between', animation: 'magentaGlow 2s ease infinite' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>View Order · {formatMoney(total, store.currencySuffix)}</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
