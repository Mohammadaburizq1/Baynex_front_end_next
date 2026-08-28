'use client';

import { useState } from 'react';
import { Josefin_Sans, Poppins } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import { ShoppingBag, X, Minus, Plus, Zap } from 'lucide-react';

const josefin = Josefin_Sans({ subsets: ['latin'], weight: ['300', '400', '600', '700'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

type CartItem = { id: number; name: string; price: number; qty: number };

const CATEGORIES = ['All', 'Bowls', 'Smoothies', 'Shots', 'Bites'];

const FRUIT_BLOBS = [
  { id: 0, size: 180, x: -5, y: 10, color: '#FF6B6B', opacity: 0.15, dur: 8, delay: 0 },
  { id: 1, size: 140, x: 80, y: 5, color: '#22C55E', opacity: 0.14, dur: 10, delay: 1 },
  { id: 2, size: 100, x: 55, y: 60, color: '#F59E0B', opacity: 0.12, dur: 7, delay: 2 },
  { id: 3, size: 120, x: 10, y: 70, color: '#A855F7', opacity: 0.12, dur: 9, delay: 0.5 },
  { id: 4, size: 80,  x: 90, y: 55, color: '#06B6D4', opacity: 0.13, dur: 6, delay: 1.5 },
];

const CARD_PALETTES = [
  { top: '#FF6B6B', bg: '#FFF5F5' },
  { top: '#22C55E', bg: '#F0FDF4' },
  { top: '#F59E0B', bg: '#FFFBEB' },
  { top: '#A855F7', bg: '#FAF5FF' },
  { top: '#06B6D4', bg: '#ECFEFF' },
];

export default function SmoothieBarTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const filtered =
    activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory);

  const addToCart = (p: (typeof products)[0]) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === p.id);
      if (exists) return prev.map((c) => (c.id === p.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { id: p.id, name: p.name, price: p.discountPrice ?? p.price, qty: 1 }];
    });
  };

  const changeQty = (id: number, delta: number) =>
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c)).filter((c) => c.qty > 0)
    );

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const itemCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const waMsg = `Hi! I'd like to order: ${cart.map((c) => `${c.qty}x ${c.name}`).join(', ')}. Total: $${total.toFixed(2)}`;
  const waHref = `https://wa.me/${(store.whatsappNumber ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(waMsg)}`;

  return (
    <>
      <style>{`
        @keyframes blobFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-18px) scale(1.04); }
        }
        @keyframes blobMorph {
          0%, 100% { border-radius: 58% 42% 32% 68% / 58% 30% 70% 42%; }
          50%       { border-radius: 32% 68% 64% 36% / 48% 62% 38% 52%; }
        }
        @keyframes bounceIn {
          0%   { opacity: 0; transform: scale(0.85) translateY(24px); }
          60%  { transform: scale(1.04) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes cardPop {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes cartIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes zapPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50%       { box-shadow: 0 0 0 10px rgba(34,197,94,0); }
        }
        @keyframes spinBadge {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .sb-card {
          background: #FFFFFF;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          transition: transform 0.24s ease, box-shadow 0.24s ease;
          animation: cardPop 0.5s ease both;
        }
        .sb-card:hover {
          transform: translateY(-8px) scale(1.015);
          box-shadow: 0 20px 48px rgba(0,0,0,0.1);
        }
        .sb-tab {
          border-radius: 100px;
          padding: 8px 20px;
          border: 2px solid #E2E8F0;
          background: white;
          color: #64748B;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .sb-tab.active { background: #22C55E; border-color: #22C55E; color: white; }
        .sb-tab:hover:not(.active) { border-color: #22C55E; color: #22C55E; }
        .sb-add {
          background: #22C55E;
          color: white;
          border: none;
          border-radius: 100px;
          padding: 9px 20px;
          cursor: pointer;
          font-weight: 700;
          transition: background 0.18s, transform 0.14s;
        }
        .sb-add:hover { background: #16A34A; transform: scale(1.05); }
      `}</style>

      <div style={{ background: '#FAFFFE', minHeight: '100vh', fontFamily: poppins.style.fontFamily, position: 'relative', overflowX: 'hidden' }}>

        {/* Fruit blobs */}
        {FRUIT_BLOBS.map((b) => (
          <div key={b.id} style={{
            position: 'fixed',
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.size,
            height: b.size,
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            background: b.color,
            opacity: b.opacity,
            animation: `blobFloat ${b.dur}s ${b.delay}s ease-in-out infinite, blobMorph ${b.dur + 3}s ${b.delay}s ease-in-out infinite`,
            pointerEvents: 'none',
            zIndex: 0,
          }} />
        ))}

        {/* Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(250,255,254,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #DCFCE7', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #22C55E, #06B6D4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="white" fill="white" />
            </div>
            <span className={josefin.className} style={{ fontSize: 20, color: '#1A2E0A', fontWeight: 700, letterSpacing: '0.04em' }}>{store.shopName.toUpperCase()}</span>
          </div>
          <button onClick={() => setCartOpen(true)} style={{ background: '#22C55E', border: 'none', color: 'white', borderRadius: 100, padding: '8px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: poppins.style.fontFamily, fontWeight: 700, fontSize: 14, animation: itemCount > 0 ? 'zapPulse 2s ease infinite' : 'none' }}>
            <ShoppingBag size={16} />
            {itemCount > 0 ? `Cart (${itemCount})` : 'Cart'}
          </button>
        </header>

        {/* Hero */}
        <section style={{ position: 'relative', padding: '80px 24px 60px', textAlign: 'center', zIndex: 1 }}>
          {/* Large background text */}
          <div className={josefin.className} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 'clamp(80px, 20vw, 200px)', fontWeight: 700, color: '#F0FDF4', letterSpacing: '-0.02em', userSelect: 'none', whiteSpace: 'nowrap', zIndex: -1 }}>
            FUEL
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#DCFCE7', borderRadius: 100, padding: '6px 16px', marginBottom: 20, animation: 'bounceIn 0.6s 0.1s ease both', opacity: 0 }}>
            <Zap size={14} color="#22C55E" fill="#22C55E" />
            <span className={poppins.className} style={{ color: '#16A34A', fontSize: 13, fontWeight: 600 }}>Fresh made · No fillers · Powered by plants</span>
          </div>

          <h1 className={josefin.className} style={{ fontSize: 'clamp(48px, 11vw, 104px)', fontWeight: 700, color: '#1A2E0A', lineHeight: 0.95, letterSpacing: '-0.01em', animation: 'bounceIn 0.65s 0.2s ease both', opacity: 0 }}>
            {store.shopName.toUpperCase()}
          </h1>

          <p className={poppins.className} style={{ color: '#52744A', fontSize: 18, maxWidth: 460, margin: '18px auto 36px', lineHeight: 1.65, fontWeight: 400, animation: 'bounceIn 0.6s 0.35s ease both', opacity: 0 }}>
            {tc?.heroDescription || store.description}
          </p>

          {/* Color dot row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 36, animation: 'bounceIn 0.6s 0.45s ease both', opacity: 0 }}>
            {['#FF6B6B', '#F59E0B', '#22C55E', '#06B6D4', '#A855F7'].map((c) => (
              <div key={c} style={{ width: 14, height: 14, borderRadius: '50%', background: c, boxShadow: `0 0 12px ${c}88` }} />
            ))}
          </div>

          <button onClick={() => document.getElementById('sb-menu')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'linear-gradient(135deg, #22C55E, #06B6D4)', color: 'white', border: 'none', borderRadius: 100, padding: '14px 44px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: josefin.style.fontFamily, letterSpacing: '0.06em', boxShadow: '0 8px 28px rgba(34,197,94,0.35)', animation: 'bounceIn 0.6s 0.54s ease both, zapPulse 2.5s 2s ease infinite', opacity: 0 }}>
            ORDER NOW
          </button>
        </section>

        {/* Green wave */}
        <div style={{ position: 'relative', height: 56, overflow: 'hidden' }}>
          <svg viewBox="0 0 1200 56" style={{ position: 'absolute', bottom: 0, width: '100%' }} preserveAspectRatio="none">
            <path d="M0,28 C300,56 600,0 900,28 C1050,42 1150,14 1200,28 L1200,56 L0,56 Z" fill="#F0FDF4" />
          </svg>
        </div>

        {/* Menu */}
        <section id="sb-menu" style={{ background: '#F0FDF4', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 24px 130px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
              <h2 className={josefin.className} style={{ fontSize: 36, color: '#1A2E0A', fontWeight: 700, letterSpacing: '0.02em' }}>THE MENU</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CATEGORIES.map((cat) => (
                  <button key={cat} className={`sb-tab${activeCategory === cat ? ' active' : ''} ${josefin.className}`} style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.04em' }} onClick={() => setActiveCategory(cat)}>
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 22 }}>
              {filtered.map((p, i) => {
                const { top, bg } = CARD_PALETTES[i % CARD_PALETTES.length];
                return (
                  <div key={p.id} className="sb-card" style={{ animationDelay: `${i * 0.07}s` }}>
                    <div style={{ height: 6, background: top }} />
                    <div style={{ height: 200, background: `linear-gradient(135deg, ${bg}, ${top}22)`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: top, opacity: 0.35 }} />
                      )}
                      {p.discountPrice && (
                        <div className={josefin.className} style={{ position: 'absolute', top: 12, left: 12, background: top, color: 'white', borderRadius: 100, padding: '3px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>DEAL</div>
                      )}
                    </div>
                    <div style={{ padding: '16px 20px 20px' }}>
                      <span className={josefin.className} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: top, textTransform: 'uppercase' }}>{p.category}</span>
                      <h3 className={josefin.className} style={{ fontSize: 20, color: '#1A2E0A', fontWeight: 700, margin: '5px 0 8px', letterSpacing: '0.02em' }}>{p.name}</h3>
                      <p className={poppins.className} style={{ fontSize: 13, color: '#52744A', lineHeight: 1.55, marginBottom: 18, fontWeight: 400 }}>{p.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          {p.discountPrice ? (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                              <span className={josefin.className} style={{ fontSize: 22, fontWeight: 700, color: top }}>${p.discountPrice.toFixed(2)}</span>
                              <span className={poppins.className} style={{ fontSize: 13, color: '#A7C4A0', textDecoration: 'line-through' }}>${p.price.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className={josefin.className} style={{ fontSize: 22, fontWeight: 700, color: top }}>${p.price.toFixed(2)}</span>
                          )}
                        </div>
                        <button className={`sb-add ${poppins.className}`} style={{ fontSize: 14, background: top }} onClick={() => addToCart(p)}>Add +</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Cart sidebar */}
        {cartOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,46,10,0.35)' }} onClick={() => setCartOpen(false)} />
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 360, background: '#FAFFFE', borderLeft: '1px solid #DCFCE7', animation: 'cartIn 0.28s ease', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className={josefin.className} style={{ fontSize: 24, color: '#1A2E0A', fontWeight: 700 }}>YOUR ORDER</h3>
                <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', color: '#52744A', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                {cart.length === 0 ? (
                  <p className={poppins.className} style={{ color: '#A7C4A0', textAlign: 'center', marginTop: 48, lineHeight: 1.8 }}>Nothing here yet!<br />Add something from the menu.</p>
                ) : cart.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #DCFCE7' }}>
                    <div style={{ flex: 1 }}>
                      <p className={poppins.className} style={{ color: '#1A2E0A', fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                      <p className={poppins.className} style={{ color: '#52744A', fontSize: 13 }}>${(item.price * item.qty).toFixed(2)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button onClick={() => changeQty(item.id, -1)} style={{ background: '#DCFCE7', border: 'none', color: '#22C55E', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
                      <span className={poppins.className} style={{ color: '#1A2E0A', fontWeight: 700, fontSize: 14, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => changeQty(item.id, 1)} style={{ background: '#DCFCE7', border: 'none', color: '#22C55E', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div style={{ padding: '20px 24px', borderTop: '1px solid #DCFCE7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span className={poppins.className} style={{ color: '#52744A', fontWeight: 700 }}>Total</span>
                    <span className={josefin.className} style={{ color: '#22C55E', fontSize: 22, fontWeight: 700 }}>${total.toFixed(2)}</span>
                  </div>
                  <a href={waHref} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: 'linear-gradient(135deg, #22C55E, #06B6D4)', color: 'white', borderRadius: 100, padding: '14px', textAlign: 'center', fontFamily: josefin.style.fontFamily, fontWeight: 700, fontSize: 15, letterSpacing: '0.06em', textDecoration: 'none', boxShadow: '0 8px 24px rgba(34,197,94,0.3)' }}>
                    ORDER VIA WHATSAPP
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom cart bar */}
        {itemCount > 0 && !cartOpen && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, padding: '0 24px 20px' }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <button onClick={() => setCartOpen(true)} className={josefin.className} style={{ width: '100%', background: 'linear-gradient(135deg, #22C55E, #06B6D4)', border: 'none', borderRadius: 100, padding: '15px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 32px rgba(34,197,94,0.42)', letterSpacing: '0.04em' }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{itemCount} ITEM{itemCount !== 1 ? 'S' : ''}</span>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>VIEW ORDER · ${total.toFixed(2)}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
