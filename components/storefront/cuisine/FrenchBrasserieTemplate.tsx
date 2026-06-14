'use client';

import { useState } from 'react';
import { Libre_Baskerville, Source_Sans_3 } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import { ShoppingBag, X, Minus, Plus } from 'lucide-react';

const baskerville = Libre_Baskerville({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'] });
const sourceSans = Source_Sans_3({ subsets: ['latin'], weight: ['300', '400', '600', '700'] });

type CartItem = { id: number; name: string; price: number; qty: number };

const CATEGORIES = ['All', 'Entrées', 'Plats', 'Fromages', 'Desserts'];

const CANDLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: (i * 8.4 + 4) % 96,
  y: 10 + (i * 6.3) % 70,
  size: 3 + (i % 4),
  delay: (i * 0.45) % 4,
  duration: 3 + (i % 3),
}));

export default function FrenchBrasserieTemplate({ data }: { data: StorefrontData }) {
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
  const waMsg = `Bonjour! I'd like to order: ${cart.map((c) => `${c.qty}x ${c.name}`).join(', ')}. Total: $${total.toFixed(2)}`;
  const waHref = `https://wa.me/${(store.whatsappNumber ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(waMsg)}`;

  return (
    <>
      <style>{`
        @keyframes candleGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          40%       { opacity: 0.9; transform: scale(1.3); }
          60%       { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes candleDrift {
          0%, 100% { transform: translateY(0) translateX(0); }
          33%       { transform: translateY(-8px) translateX(2px); }
          66%       { transform: translateY(-4px) translateX(-2px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes goldReveal {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cartSlide {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes goldPulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(212,175,55,0.3); }
          50%       { box-shadow: 0 12px 48px rgba(212,175,55,0.55); }
        }
        .fb-card {
          background: #1A2A1E;
          border: 1px solid #2C4030;
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.24s, transform 0.24s, box-shadow 0.24s;
          animation: cardIn 0.48s ease both;
          position: relative;
        }
        .fb-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          border: 1px solid transparent;
          transition: border-color 0.24s;
          pointer-events: none;
          z-index: 1;
        }
        .fb-card:hover {
          border-color: #D4AF37;
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(212,175,55,0.18);
        }
        .fb-tab {
          padding: 7px 18px;
          border-radius: 4px;
          border: 1px solid #2C4030;
          background: transparent;
          color: #5A7A5E;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
          letter-spacing: 0.04em;
        }
        .fb-tab.active { background: #D4AF37; border-color: #D4AF37; color: #111A14; }
        .fb-tab:hover:not(.active) { border-color: #D4AF3788; color: #C8D8C0; }
        .fb-add {
          background: transparent;
          color: #D4AF37;
          border: 1px solid #D4AF37;
          border-radius: 4px;
          padding: 8px 18px;
          cursor: pointer;
          font-weight: 700;
          letter-spacing: 0.06em;
          transition: background 0.18s, color 0.18s, transform 0.14s;
        }
        .fb-add:hover { background: #D4AF37; color: #111A14; transform: scale(1.04); }
      `}</style>

      <div style={{ background: '#111A14', minHeight: '100vh', fontFamily: sourceSans.style.fontFamily, position: 'relative', overflowX: 'hidden' }}>

        {/* Candlelight particles */}
        {CANDLES.map((c) => (
          <div key={c.id} style={{
            position: 'fixed',
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: c.size,
            height: c.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, #D4AF37, #B8942C88)`,
            animation: `candleGlow ${c.duration}s ${c.delay}s ease-in-out infinite, candleDrift ${c.duration + 1}s ${c.delay}s ease-in-out infinite`,
            pointerEvents: 'none',
            zIndex: 0,
            filter: `blur(${c.size > 5 ? 1 : 0}px)`,
          }} />
        ))}

        {/* Ambient warm green glow */}
        <div style={{ position: 'fixed', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, #1B3A2D22, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(17,26,20,0.96)', backdropFilter: 'blur(14px)', borderBottom: '1px solid #2C4030', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Fleur-de-lis logo */}
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #1B3A2D, #2C4030)', border: '1px solid #D4AF3766', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#D4AF37', fontSize: 20, lineHeight: 1 }}>⚜</span>
            </div>
            <div>
              <span className={baskerville.className} style={{ fontSize: 18, color: '#D4AF37', fontStyle: 'italic', letterSpacing: '0.02em' }}>{store.shopName}</span>
            </div>
          </div>
          <button onClick={() => setCartOpen(true)} style={{ background: 'transparent', border: '1px solid #D4AF37', color: '#D4AF37', borderRadius: 4, padding: '8px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: sourceSans.style.fontFamily, fontWeight: 600, fontSize: 14, letterSpacing: '0.06em' }}>
            <ShoppingBag size={15} />
            {itemCount > 0 ? `Table (${itemCount})` : 'Reserve'}
          </button>
        </header>

        {/* Hero */}
        <section style={{ position: 'relative', padding: '88px 24px 72px', textAlign: 'center', zIndex: 1 }}>
          {/* Gold ornamental divider top */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24, animation: 'fadeUp 0.6s 0.1s ease both', opacity: 0 }}>
            <div style={{ height: 1, width: 80, background: 'linear-gradient(to right, transparent, #D4AF37)' }} />
            <span style={{ color: '#D4AF37', fontSize: 18 }}>⚜</span>
            <div style={{ height: 1, width: 80, background: 'linear-gradient(to left, transparent, #D4AF37)' }} />
          </div>

          <p className={sourceSans.className} style={{ color: '#D4AF37', fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 18, animation: 'fadeUp 0.6s 0.18s ease both', opacity: 0 }}>
            Paris · Est. 1948 · Brasserie de Luxe
          </p>
          <h1 className={baskerville.className} style={{ fontSize: 'clamp(44px, 9vw, 88px)', fontStyle: 'italic', color: '#E8D8A8', lineHeight: 1.05, animation: 'fadeUp 0.6s 0.28s ease both', opacity: 0 }}>
            {store.shopName}
          </h1>

          {/* Animated gold underline */}
          <div style={{ position: 'relative', height: 2, maxWidth: 200, margin: '22px auto 24px', overflow: 'hidden', borderRadius: 1 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', animation: 'goldReveal 1.4s 0.9s ease both', width: 0 }} />
          </div>

          <p className={sourceSans.className} style={{ color: '#4A6A4E', fontSize: 18, maxWidth: 460, margin: '0 auto 40px', lineHeight: 1.7, fontWeight: 300, animation: 'fadeUp 0.6s 0.42s ease both', opacity: 0 }}>
            {store.description}
          </p>
          <button onClick={() => document.getElementById('fb-menu')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', border: '1px solid #D4AF37', color: '#D4AF37', borderRadius: 4, padding: '14px 44px', fontSize: 15, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: sourceSans.style.fontFamily, animation: 'fadeUp 0.6s 0.54s ease both, goldPulse 3s 2s ease infinite', opacity: 0 }}>
            Voir la Carte
          </button>
        </section>

        {/* Gold rule */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #D4AF3755 30%, #D4AF3755 70%, transparent)', margin: '0 40px' }} />

        {/* Menu */}
        <section id="fb-menu" style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 130px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 44 }}>
            <div>
              <p className={sourceSans.className} style={{ color: '#D4AF37', fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 8 }}>La Carte du Jour</p>
              <h2 className={baskerville.className} style={{ fontSize: 36, color: '#E8D8A8', fontStyle: 'italic' }}>Our Menu</h2>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button key={cat} className={`fb-tab${activeCategory === cat ? ' active' : ''} ${sourceSans.className}`} style={{ fontSize: 13, fontWeight: 600 }} onClick={() => setActiveCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {filtered.map((p, i) => (
              <div key={p.id} className="fb-card" style={{ animationDelay: `${i * 0.07}s` }}>
                {/* Gold top accent */}
                <div style={{ height: 2, background: 'linear-gradient(90deg, #D4AF37, #B8942C, #D4AF37)' }} />
                <div style={{ height: 200, background: 'linear-gradient(135deg, #1B3A2D, #152E20)', position: 'relative', overflow: 'hidden' }}>
                  {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(transparent, #1A2A1E)' }} />
                  {p.discountPrice && (
                    <div className={sourceSans.className} style={{ position: 'absolute', top: 12, left: 12, background: '#D4AF37', color: '#111A14', borderRadius: 2, padding: '2px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>CHEF'S SPECIAL</div>
                  )}
                </div>
                <div style={{ padding: '18px 20px 22px' }}>
                  {/* Category with gold dot */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#D4AF37' }} />
                    <span className={sourceSans.className} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', color: '#D4AF3799', textTransform: 'uppercase' }}>{p.category}</span>
                  </div>
                  <h3 className={baskerville.className} style={{ fontSize: 22, color: '#E8D8A8', fontStyle: 'italic', marginBottom: 8 }}>{p.name}</h3>
                  <p className={sourceSans.className} style={{ fontSize: 13, color: '#4A6A4E', lineHeight: 1.6, marginBottom: 18, fontWeight: 300 }}>{p.description}</p>

                  {/* Thin divider */}
                  <div style={{ height: 1, background: '#2C4030', marginBottom: 16 }} />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      {p.discountPrice ? (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span className={baskerville.className} style={{ fontSize: 22, fontWeight: 700, color: '#D4AF37' }}>${p.discountPrice.toFixed(2)}</span>
                          <span className={sourceSans.className} style={{ fontSize: 13, color: '#3A5A3E', textDecoration: 'line-through' }}>${p.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className={baskerville.className} style={{ fontSize: 22, fontWeight: 700, color: '#D4AF37' }}>${p.price.toFixed(2)}</span>
                      )}
                    </div>
                    <button className={`fb-add ${sourceSans.className}`} style={{ fontSize: 13 }} onClick={() => addToCart(p)}>AJOUTER</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cart sidebar */}
        {cartOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.74)' }} onClick={() => setCartOpen(false)} />
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 380, background: '#111A14', borderLeft: '1px solid #2C4030', animation: 'cartSlide 0.28s ease', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #2C4030', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 className={baskerville.className} style={{ fontSize: 22, color: '#E8D8A8', fontStyle: 'italic' }}>Votre Commande</h3>
                  <p className={sourceSans.className} style={{ color: '#4A6A4E', fontSize: 12, letterSpacing: '0.06em' }}>YOUR ORDER</p>
                </div>
                <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', color: '#4A6A4E', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                {cart.length === 0 ? (
                  <p className={baskerville.className} style={{ color: '#3A5A3E', textAlign: 'center', marginTop: 48, lineHeight: 1.8, fontStyle: 'italic', fontSize: 17 }}>
                    La table vous attend.<br />
                    <span className={sourceSans.className} style={{ fontSize: 13, fontStyle: 'normal', color: '#3A5A3E' }}>Add something from the menu.</span>
                  </p>
                ) : cart.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid #1B3A2D' }}>
                    <div style={{ flex: 1 }}>
                      <p className={baskerville.className} style={{ color: '#E8D8A8', fontSize: 15, fontStyle: 'italic' }}>{item.name}</p>
                      <p className={sourceSans.className} style={{ color: '#4A6A4E', fontSize: 13 }}>${(item.price * item.qty).toFixed(2)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button onClick={() => changeQty(item.id, -1)} style={{ background: '#1B3A2D', border: '1px solid #2C4030', color: '#D4AF37', width: 26, height: 26, borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
                      <span className={sourceSans.className} style={{ color: '#E8D8A8', fontWeight: 700, fontSize: 14, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => changeQty(item.id, 1)} style={{ background: '#1B3A2D', border: '1px solid #2C4030', color: '#D4AF37', width: 26, height: 26, borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div style={{ padding: '20px 24px', borderTop: '1px solid #2C4030' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
                    <span className={sourceSans.className} style={{ color: '#4A6A4E', fontWeight: 700, letterSpacing: '0.08em', fontSize: 13 }}>TOTAL</span>
                    <span className={baskerville.className} style={{ color: '#D4AF37', fontSize: 24, fontStyle: 'italic' }}>${total.toFixed(2)}</span>
                  </div>
                  <a href={waHref} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#D4AF37', color: '#111A14', borderRadius: 4, padding: '14px', textAlign: 'center', fontFamily: sourceSans.style.fontFamily, fontWeight: 700, fontSize: 15, letterSpacing: '0.1em', textDecoration: 'none', boxShadow: '0 8px 28px rgba(212,175,55,0.3)' }}>
                    ORDER VIA WHATSAPP
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom bar */}
        {itemCount > 0 && !cartOpen && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, padding: '0 24px 20px' }}>
            <button onClick={() => setCartOpen(true)} className={sourceSans.className} style={{ width: '100%', maxWidth: 600, margin: '0 auto', display: 'flex', background: '#D4AF37', border: 'none', borderRadius: 6, padding: '15px 24px', cursor: 'pointer', alignItems: 'center', justifyContent: 'space-between', animation: 'goldPulse 2.5s ease infinite' }}>
              <span style={{ color: '#111A14', fontWeight: 700, fontSize: 14, letterSpacing: '0.06em' }}>{itemCount} ITEM{itemCount !== 1 ? 'S' : ''}</span>
              <span style={{ color: '#111A14', fontWeight: 700, fontSize: 15, letterSpacing: '0.06em' }}>VIEW ORDER · ${total.toFixed(2)}</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
