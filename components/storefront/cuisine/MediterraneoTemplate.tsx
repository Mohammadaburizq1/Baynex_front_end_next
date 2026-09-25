'use client';
import { formatMoney } from '@/lib/utils';

import { useEffect, useState } from 'react';
import { Lora, DM_Sans } from 'next/font/google';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ShoppingBag, Leaf } from 'lucide-react';
import CheckoutDrawer from '@/components/storefront/restaurant-default/CheckoutDrawer';
import { ProductOptionsDialog } from '@/components/storefront/shared/ProductOptionsDialog';
import { readCartDraft, clearCartDraft } from '@/lib/utils/cart-draft';
import {
  addLine, cartCount as countOf, cartSubtotal, changeQty as changeLineQty, needsOptions, removeLine, restoreFromDraft,
  type CartLine,
} from '@/lib/utils/cart-lines';

const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600', '700'], style: ['normal', 'italic'] });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '700'] });

const CATEGORIES = ['All', 'Mains', 'Mezze', 'Grills', 'Desserts'];

const OLIVE_LEAVES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: (i * 9 + 5) % 90,
  y: 10 + (i * 7) % 50,
  size: 14 + (i % 10),
  delay: (i * 0.6) % 4,
  rotate: -30 + (i * 18) % 80,
}));

const CARD_COLORS = ['#C0562A', '#6B7A3C', '#D4A843', '#7C4A2D', '#4A6741'];

export default function MediterraneoTemplate({ data }: { data: StorefrontData }) {
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
        @keyframes leafSway {
          0%, 100% { transform: rotate(var(--r)) translateY(0); }
          50%       { transform: rotate(calc(var(--r) + 12deg)) translateY(-8px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardSlide {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cartIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes tileDrift {
          0%, 100% { background-position: 0 0; }
          50%       { background-position: 6px 6px; }
        }
        .med-card {
          background: #FFFFFF;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(44,24,16,0.08);
          transition: transform 0.24s ease, box-shadow 0.24s ease;
          animation: cardSlide 0.5s ease both;
        }
        .med-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(192,86,42,0.18);
        }
        .med-tab {
          padding: 7px 18px;
          border-radius: 100px;
          border: 1.5px solid #E8D5C0;
          background: white;
          color: #8C6B55;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .med-tab.active { background: #C0562A; border-color: #C0562A; color: white; }
        .med-tab:hover:not(.active) { border-color: #C0562A; color: #C0562A; }
        .med-add {
          background: #C0562A;
          color: white;
          border: none;
          border-radius: 100px;
          padding: 9px 20px;
          cursor: pointer;
          font-weight: 700;
          transition: background 0.18s, transform 0.14s;
        }
        .med-add:hover { background: #A0451F; transform: scale(1.04); }
      `}</style>

      <div style={{ background: '#FDF8F2', minHeight: '100vh', fontFamily: dmSans.style.fontFamily, position: 'relative', overflowX: 'hidden' }}>

        {/* Ambient olive leaves */}
        {OLIVE_LEAVES.map((l) => (
          <div key={l.id} style={{
            position: 'fixed',
            left: `${l.x}%`,
            top: `${l.y}%`,
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.12,
            animation: `leafSway ${3 + l.id % 3}s ${l.delay}s ease-in-out infinite`,
            ['--r' as string]: `${l.rotate}deg`,
          }}>
            <Leaf size={l.size} color="#6B7A3C" strokeWidth={1.5} />
          </div>
        ))}

        {/* Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(253,248,242,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #E8D5C0', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #C0562A, #D4A843)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={18} color="white" />
            </div>
            <span className={lora.className} style={{ fontSize: 20, color: '#2C1810', fontWeight: 600, fontStyle: 'italic' }}>{store.shopName}</span>
          </div>
          <button onClick={() => setCartOpen(true)} style={{ background: '#C0562A', border: 'none', color: 'white', borderRadius: 100, padding: '8px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: dmSans.style.fontFamily, fontWeight: 700, fontSize: 14 }}>
            <ShoppingBag size={16} />
            {itemCount > 0 ? `Cart (${itemCount})` : 'Cart'}
          </button>
        </header>

        {/* Hero */}
        <section style={{ position: 'relative', padding: '80px 24px 60px', textAlign: 'center', zIndex: 1 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #FAF3E8, #FDF8F2)', zIndex: -1 }} />

          {/* Decorative vine line */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20, animation: 'fadeUp 0.6s 0.1s ease both', opacity: 0 }}>
            <div style={{ height: 1, width: 60, background: 'linear-gradient(to right, transparent, #C0562A)' }} />
            <Leaf size={14} color="#6B7A3C" />
            <div style={{ height: 1, width: 60, background: 'linear-gradient(to left, transparent, #C0562A)' }} />
          </div>

          <p className={dmSans.className} style={{ color: '#C0562A', fontSize: 12, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', marginBottom: 16, animation: 'fadeUp 0.6s 0.18s ease both', opacity: 0 }}>
            Mediterranean Kitchen
          </p>
          <h1 className={lora.className} style={{ fontSize: 'clamp(48px, 10vw, 96px)', fontStyle: 'italic', fontWeight: 700, color: '#2C1810', lineHeight: 1.0, animation: 'fadeUp 0.6s 0.28s ease both', opacity: 0 }}>
            {store.shopName}
          </h1>
          <p className={dmSans.className} style={{ color: '#8C6B55', fontSize: 18, maxWidth: 480, margin: '18px auto 32px', lineHeight: 1.65, fontWeight: 400, animation: 'fadeUp 0.6s 0.4s ease both', opacity: 0 }}>
            {tc?.heroDescription || store.description}
          </p>

          {/* Badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 40, animation: 'fadeUp 0.6s 0.5s ease both', opacity: 0 }}>
            {[{ label: 'Fresh Daily', color: '#6B7A3C' }, { label: 'Family Recipes', color: '#C0562A' }, { label: 'Slow Cooked', color: '#D4A843' }].map(({ label, color }) => (
              <span key={label} className={dmSans.className} style={{ background: 'white', border: `1.5px solid ${color}`, color, borderRadius: 100, padding: '6px 16px', fontSize: 13, fontWeight: 700 }}>
                {label}
              </span>
            ))}
          </div>

          <button onClick={() => document.getElementById('med-menu')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'linear-gradient(135deg, #C0562A, #D4A843)', color: 'white', border: 'none', borderRadius: 100, padding: '14px 42px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: dmSans.style.fontFamily, boxShadow: '0 8px 24px rgba(192,86,42,0.3)', animation: 'fadeUp 0.6s 0.58s ease both', opacity: 0 }}>
            Explore the Menu
          </button>
        </section>

        {/* Terracotta divider */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, #C0562A 20%, #D4A843 50%, #C0562A 80%, transparent)', margin: '0 auto', maxWidth: 400, borderRadius: 2 }} />

        {/* Menu */}
        <section id="med-menu" style={{ background: '#FAF3E8', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 24px 130px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
              <h2 className={lora.className} style={{ fontSize: 36, color: '#2C1810', fontStyle: 'italic' }}>Our Kitchen</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <button key={cat} className={`med-tab${activeCategory === cat ? ' active' : ''} ${dmSans.className}`} style={{ fontSize: 14, fontWeight: 700 }} onClick={() => setActiveCategory(cat)}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 24 }}>
              {filtered.map((p, i) => {
                const accent = CARD_COLORS[i % CARD_COLORS.length];
                return (
                  <div key={p.id} className="med-card" style={{ animationDelay: `${i * 0.07}s` }}>
                    <div style={{ height: 200, position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${accent}22, ${CARD_COLORS[(i+1) % CARD_COLORS.length]}18)` }}>
                      {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      {p.discountPrice && (
                        <div className={dmSans.className} style={{ position: 'absolute', top: 12, left: 12, background: '#C0562A', color: 'white', borderRadius: 100, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>Special</div>
                      )}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, background: 'linear-gradient(transparent, #FFFFFF)' }} />
                    </div>
                    <div style={{ padding: '16px 20px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />
                        <span className={dmSans.className} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: accent, textTransform: 'uppercase' }}>{p.category}</span>
                      </div>
                      <h3 className={lora.className} style={{ fontSize: 21, color: '#2C1810', fontStyle: 'italic', marginBottom: 8 }}>{p.name}</h3>
                      <p className={dmSans.className} style={{ fontSize: 13, color: '#8C6B55', lineHeight: 1.55, marginBottom: 18 }}>{p.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          {p.discountPrice ? (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                              <span className={lora.className} style={{ fontSize: 22, fontWeight: 700, color: '#C0562A' }}>{formatMoney(p.discountPrice, store.currencySuffix)}</span>
                              <span className={dmSans.className} style={{ fontSize: 13, color: '#C4A89A', textDecoration: 'line-through' }}>{formatMoney(p.price, store.currencySuffix)}</span>
                            </div>
                          ) : (
                            <span className={lora.className} style={{ fontSize: 22, fontWeight: 700, color: '#C0562A' }}>{formatMoney(p.price, store.currencySuffix)}</span>
                          )}
                        </div>
                        <button className={`med-add ${dmSans.className}`} style={{ fontSize: 14 }} onClick={() => addToCart(p)}>Add +</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <ProductOptionsDialog
          product={optionsFor}
          currencySuffix={store.currencySuffix}
          accent="#C0562A"
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

        {/* Bottom cart bar */}
        {itemCount > 0 && !cartOpen && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, padding: '0 24px 20px' }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <button onClick={() => setCartOpen(true)} className={dmSans.className} style={{ width: '100%', background: 'linear-gradient(135deg, #C0562A, #D4A843)', border: 'none', borderRadius: 100, padding: '15px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 28px rgba(192,86,42,0.38)' }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>View Cart · {formatMoney(total, store.currencySuffix)}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
