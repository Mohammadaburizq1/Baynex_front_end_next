'use client';

import { useState } from 'react';
import { Source_Serif_4, Lato } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import { ShoppingBag, X, Minus, Plus } from 'lucide-react';

const sourceSerif = Source_Serif_4({ subsets: ['latin'], weight: ['300', '400', '600', '700'], style: ['normal', 'italic'] });
const lato = Lato({ subsets: ['latin'], weight: ['300', '400', '700', '900'] });

type CartItem = { id: number; name: string; price: number; qty: number };

const CATEGORIES = ['All', 'Ramen', 'Small Plates', 'Drinks', 'Add-Ons'];

const STEAM_WISPS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: 8 + (i * 6.8) % 84,
  delay: (i * 0.55) % 5,
  duration: 4 + (i % 4),
  width: 2 + (i % 3),
}));

export default function RamenNightTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
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
        @keyframes steamRise {
          0%   { transform: translateY(0) scaleX(1); opacity: 0; }
          15%  { opacity: 0.45; }
          70%  { opacity: 0.25; }
          100% { transform: translateY(-90px) scaleX(1.8); opacity: 0; }
        }
        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(32px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes redBrush {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cartSlide {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes crimsonPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(220,38,38,0); }
        }
        .rn-card {
          background: #141320;
          border: 1px solid #2A2740;
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.22s, transform 0.22s, box-shadow 0.22s;
          animation: cardIn 0.45s ease both;
        }
        .rn-card:hover {
          border-color: #DC2626;
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(220,38,38,0.18);
        }
        .rn-tab {
          padding: 6px 16px;
          background: transparent;
          border: 1px solid #2A2740;
          border-radius: 6px;
          color: #6B6880;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .rn-tab.active { background: #DC2626; border-color: #DC2626; color: #FFFFFF; }
        .rn-tab:hover:not(.active) { border-color: #DC262688; color: #E8E6F0; }
        .rn-add {
          background: #DC2626;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 9px 18px;
          cursor: pointer;
          font-weight: 700;
          letter-spacing: 0.04em;
          transition: background 0.18s, transform 0.14s;
        }
        .rn-add:hover { background: #B91C1C; transform: scale(1.04); }
      `}</style>

      <div style={{ background: '#0C0B14', minHeight: '100vh', fontFamily: lato.style.fontFamily, position: 'relative', overflowX: 'hidden' }}>

        {/* Steam wisps in hero area */}
        {STEAM_WISPS.map((w) => (
          <div key={w.id} style={{
            position: 'absolute',
            left: `${w.x}%`,
            top: '32%',
            width: w.width,
            height: 40,
            borderRadius: 99,
            background: 'linear-gradient(to top, rgba(232,230,240,0.3), transparent)',
            animation: `steamRise ${w.duration}s ${w.delay}s ease-out infinite`,
            pointerEvents: 'none',
            zIndex: 0,
          }} />
        ))}

        {/* Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(12,11,20,0.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid #2A2740', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 16, fontWeight: 900 }}>拉</span>
            </div>
            <span className={sourceSerif.className} style={{ fontSize: 20, color: '#E8E6F0', fontWeight: 600, letterSpacing: '0.02em' }}>{store.shopName}</span>
          </div>
          <button onClick={() => setCartOpen(true)} style={{ background: 'transparent', border: '1px solid #DC2626', color: '#DC2626', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: lato.style.fontFamily, fontWeight: 700, fontSize: 14 }}>
            <ShoppingBag size={15} />
            {itemCount > 0 ? `Cart (${itemCount})` : 'Order'}
          </button>
        </header>

        {/* Hero */}
        <section style={{ position: 'relative', padding: '88px 24px 72px', textAlign: 'center', zIndex: 1, overflow: 'hidden' }}>
          {/* Red radial glow */}
          <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, #DC262614, transparent 70%)', pointerEvents: 'none' }} />

          <p className={lato.className} style={{ color: '#DC2626', fontSize: 12, fontWeight: 900, letterSpacing: '0.32em', textTransform: 'uppercase', marginBottom: 20, animation: 'heroReveal 0.7s 0.1s ease both', opacity: 0 }}>
            Tokyo · Est. 2019 · Open Late
          </p>
          <h1 className={sourceSerif.className} style={{ fontSize: 'clamp(52px, 11vw, 108px)', fontStyle: 'italic', fontWeight: 700, color: '#E8E6F0', lineHeight: 0.95, animation: 'heroReveal 0.7s 0.22s ease both', opacity: 0 }}>
            {store.shopName}
          </h1>
          {/* Animated red brush underline */}
          <div style={{ position: 'relative', height: 4, maxWidth: 220, margin: '20px auto 24px', overflow: 'hidden', borderRadius: 2 }}>
            <div style={{ position: 'absolute', inset: 0, background: '#DC2626', animation: 'redBrush 1.2s 0.8s ease both', width: 0 }} />
          </div>
          <p className={lato.className} style={{ color: '#6B6880', fontSize: 18, maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.6, fontWeight: 300, animation: 'heroReveal 0.7s 0.44s ease both', opacity: 0 }}>
            {store.description}
          </p>
          <button onClick={() => document.getElementById('rn-menu')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: '#DC2626', color: 'white', border: 'none', borderRadius: 8, padding: '14px 40px', fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', fontFamily: lato.style.fontFamily, animation: 'heroReveal 0.7s 0.56s ease both', opacity: 0 } as React.CSSProperties}>
            TONIGHT'S MENU
          </button>
        </section>

        {/* Thin red rule */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #DC262640 30%, #DC262640 70%, transparent)', margin: '0 24px' }} />

        {/* Menu section */}
        <section id="rn-menu" style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 24px 130px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <p className={lato.className} style={{ color: '#DC2626', fontSize: 11, fontWeight: 900, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 6 }}>Tonight's Offering</p>
              <h2 className={sourceSerif.className} style={{ fontSize: 36, color: '#E8E6F0', fontStyle: 'italic' }}>Full Menu</h2>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button key={cat} className={`rn-tab${activeCategory === cat ? ' active' : ''} ${lato.className}`} style={{ fontSize: 13, fontWeight: 700 }} onClick={() => setActiveCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 22 }}>
            {filtered.map((p, i) => (
              <div key={p.id} className="rn-card" style={{ animationDelay: `${i * 0.07}s` }}>
                <div style={{ height: 200, background: 'linear-gradient(135deg, #1C1A2E, #252240)', position: 'relative', overflow: 'hidden' }}>
                  {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(transparent, #141320)' }} />
                  {p.discountPrice && (
                    <div className={lato.className} style={{ position: 'absolute', top: 12, left: 12, background: '#DC2626', color: 'white', borderRadius: 4, padding: '2px 10px', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em' }}>SPECIAL</div>
                  )}
                </div>
                <div style={{ padding: '16px 20px 20px' }}>
                  <div className={lato.className} style={{ fontSize: 10, color: '#DC2626', fontWeight: 900, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 6 }}>{p.category}</div>
                  <h3 className={sourceSerif.className} style={{ fontSize: 22, color: '#E8E6F0', fontStyle: 'italic', marginBottom: 8 }}>{p.name}</h3>
                  <p className={lato.className} style={{ fontSize: 13, color: '#6B6880', lineHeight: 1.55, marginBottom: 18, fontWeight: 300 }}>{p.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      {p.discountPrice ? (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span className={sourceSerif.className} style={{ fontSize: 24, fontWeight: 700, color: '#DC2626' }}>${p.discountPrice.toFixed(2)}</span>
                          <span className={lato.className} style={{ fontSize: 14, color: '#4A475C', textDecoration: 'line-through' }}>${p.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className={sourceSerif.className} style={{ fontSize: 24, fontWeight: 700, color: '#DC2626' }}>${p.price.toFixed(2)}</span>
                      )}
                    </div>
                    <button className={`rn-add ${lato.className}`} style={{ fontSize: 13 }} onClick={() => addToCart(p)}>Add +</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cart sidebar */}
        {cartOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} onClick={() => setCartOpen(false)} />
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 360, background: '#0C0B14', borderLeft: '1px solid #2A2740', animation: 'cartSlide 0.28s ease', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #2A2740', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className={sourceSerif.className} style={{ fontSize: 24, color: '#E8E6F0', fontStyle: 'italic' }}>Your Order</h3>
                <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', color: '#6B6880', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                {cart.length === 0 ? (
                  <p className={lato.className} style={{ color: '#4A475C', textAlign: 'center', marginTop: 48, lineHeight: 1.8 }}>Your bowl is empty.<br />Add something from the menu!</p>
                ) : cart.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1C1A2E' }}>
                    <div style={{ flex: 1 }}>
                      <p className={lato.className} style={{ color: '#E8E6F0', fontWeight: 700, fontSize: 14 }}>{item.name}</p>
                      <p className={lato.className} style={{ color: '#6B6880', fontSize: 13 }}>${(item.price * item.qty).toFixed(2)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button onClick={() => changeQty(item.id, -1)} style={{ background: '#2A2740', border: 'none', color: '#9A97A8', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
                      <span className={lato.className} style={{ color: '#E8E6F0', fontWeight: 700, fontSize: 14, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => changeQty(item.id, 1)} style={{ background: '#2A2740', border: 'none', color: '#9A97A8', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div style={{ padding: '20px 24px', borderTop: '1px solid #2A2740' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span className={lato.className} style={{ color: '#9A97A8', fontWeight: 700 }}>Total</span>
                    <span className={sourceSerif.className} style={{ color: '#DC2626', fontSize: 22, fontWeight: 700 }}>${total.toFixed(2)}</span>
                  </div>
                  <a href={waHref} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#DC2626', color: 'white', borderRadius: 8, padding: '14px', textAlign: 'center', fontFamily: lato.style.fontFamily, fontWeight: 700, fontSize: 15, letterSpacing: '0.06em', textDecoration: 'none' }}>
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
            <button onClick={() => setCartOpen(true)} className={lato.className} style={{ width: '100%', maxWidth: 600, margin: '0 auto', display: 'flex', background: '#DC2626', border: 'none', borderRadius: 10, padding: '15px 24px', cursor: 'pointer', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 32px rgba(220,38,38,0.45)' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>View Order · ${total.toFixed(2)}</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
