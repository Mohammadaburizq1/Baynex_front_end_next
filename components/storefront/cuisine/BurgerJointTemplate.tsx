'use client';

import { useState } from 'react';
import { Anton, Barlow_Condensed } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import { ShoppingCart, X, Flame, ChevronRight } from 'lucide-react';

const anton = Anton({ subsets: ['latin'], weight: '400' });
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['300', '400', '600', '700'] });

type CartItem = { id: number; name: string; price: number; qty: number };

const CATEGORIES = ['All', 'Burgers', 'Sides', 'Drinks', 'Desserts'];

const SPARKS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: (i * 5.7 + 3) % 100,
  delay: (i * 0.38) % 5,
  size: 2 + (i % 3),
  duration: 3.5 + (i % 4),
}));

export default function BurgerJointTemplate({ data }: { data: StorefrontData }) {
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

  const removeOne = (id: number) =>
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c)).filter((c) => c.qty > 0)
    );

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const itemCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const waMsg = `Hi! I'd like to order: ${cart.map((c) => `${c.qty}x ${c.name}`).join(', ')}. Total: $${total.toFixed(2)}`;
  const waHref = `https://wa.me/${(store.whatsappNumber ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(waMsg)}`;

  return (
    <>
      <style>{`
        @keyframes sparkRise {
          0%   { transform: translateY(0) scale(1); opacity: 0.7; }
          100% { transform: translateY(-130px) scale(0); opacity: 0; }
        }
        @keyframes neonPulse {
          0%, 100% { opacity: 1; }
          48% { opacity: 0.4; }
          50% { opacity: 1; }
          96% { opacity: 0.6; }
          98% { opacity: 1; }
        }
        @keyframes titleDrop {
          from { transform: translateY(44px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes cardUp {
          from { transform: translateY(32px) scale(0.96); opacity: 0; }
          to   { transform: translateY(0)    scale(1);    opacity: 1; }
        }
        @keyframes amberGlow {
          0%, 100% { box-shadow: 0 0 18px #F59E0B40; }
          50%       { box-shadow: 0 0 36px #F59E0BAA; }
        }
        @keyframes cartIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .bj-card {
          background: #110D07;
          border: 1px solid #2C2114;
          border-radius: 14px;
          overflow: hidden;
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
          animation: cardUp 0.5s ease both;
        }
        .bj-card:hover {
          transform: translateY(-5px);
          border-color: #F59E0B;
          box-shadow: 0 0 28px #F59E0B28;
        }
        .bj-add {
          background: #F59E0B;
          color: #080501;
          border: none;
          border-radius: 8px;
          padding: 9px 18px;
          cursor: pointer;
          font-weight: 700;
          letter-spacing: 0.04em;
          transition: background 0.18s, transform 0.14s;
        }
        .bj-add:hover { background: #FBBF24; transform: scale(1.04); }
        .bj-tab {
          padding: 7px 18px;
          border-radius: 6px;
          border: 1px solid #2C2114;
          background: transparent;
          color: #9A8570;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .bj-tab.active { background: #F59E0B; border-color: #F59E0B; color: #080501; }
        .bj-tab:hover:not(.active) { border-color: #F59E0B88; color: #F5F0E8; }
      `}</style>

      <div
        style={{
          background: '#080501',
          minHeight: '100vh',
          fontFamily: barlow.style.fontFamily,
          position: 'relative',
          overflowX: 'hidden',
        }}
      >
        {/* Ambient sparks */}
        {SPARKS.map((s) => (
          <div
            key={s.id}
            style={{
              position: 'fixed',
              left: `${s.x}%`,
              bottom: '15%',
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: s.id % 3 === 0 ? '#F59E0B' : s.id % 3 === 1 ? '#FBBF24' : '#EF4444',
              animation: `sparkRise ${s.duration}s ${s.delay}s ease-out infinite`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        ))}

        {/* Header */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'rgba(8,5,1,0.94)',
            backdropFilter: 'blur(14px)',
            borderBottom: '1px solid #2C2114',
            padding: '0 24px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Flame size={18} color="#080501" />
            </div>
            <span
              className={anton.className}
              style={{ fontSize: 22, color: '#F5F0E8', letterSpacing: '0.04em' }}
            >
              {store.shopName}
            </span>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            style={{
              background: 'transparent',
              border: '1px solid #F59E0B',
              color: '#F59E0B',
              borderRadius: 8,
              padding: '8px 18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: barlow.style.fontFamily,
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '0.06em',
            }}
          >
            <ShoppingCart size={15} />
            ORDER ({itemCount})
          </button>
        </header>

        {/* Hero */}
        <section
          style={{ position: 'relative', padding: '80px 24px 60px', textAlign: 'center', zIndex: 1 }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 700,
              height: 240,
              background: 'radial-gradient(ellipse, #F59E0B16, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <p
            className={barlow.className}
            style={{
              color: '#F59E0B',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              marginBottom: 18,
              animation: 'titleDrop 0.55s 0.1s ease both',
              opacity: 0,
            }}
          >
            Premium Smash Burgers · Est. 2024
          </p>
          <h1
            className={anton.className}
            style={{
              fontSize: 'clamp(56px, 13vw, 128px)',
              color: '#F5F0E8',
              lineHeight: 0.88,
              letterSpacing: '0.02em',
              animation: 'titleDrop 0.55s 0.2s ease both',
              opacity: 0,
            }}
          >
            {store.shopName.toUpperCase()}
          </h1>
          <div
            style={{
              width: 130,
              height: 3,
              background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)',
              margin: '22px auto',
              animation: 'neonPulse 5s 2s ease infinite',
            }}
          />
          <p
            className={barlow.className}
            style={{
              color: '#9A8570',
              fontSize: 18,
              fontWeight: 400,
              maxWidth: 480,
              margin: '0 auto 36px',
              lineHeight: 1.55,
              animation: 'titleDrop 0.55s 0.38s ease both',
              opacity: 0,
            }}
          >
            {tc?.heroDescription || store.description}
          </p>
          <button
            onClick={() => document.getElementById('bj-menu')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: '#080501',
              border: 'none',
              borderRadius: 8,
              padding: '14px 38px',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              animation: 'titleDrop 0.55s 0.5s ease both',
              opacity: 0,
              fontFamily: barlow.style.fontFamily,
            }}
          >
            VIEW MENU <ChevronRight size={16} />
          </button>
        </section>

        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, #2C2114 30%, #2C2114 70%, transparent)',
            margin: '0 24px',
          }}
        />

        {/* Menu */}
        <section
          id="bj-menu"
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '52px 24px 130px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 36,
            }}
          >
            <h2
              className={anton.className}
              style={{ fontSize: 42, color: '#F5F0E8', letterSpacing: '0.04em' }}
            >
              FULL MENU
            </h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`bj-tab${activeCategory === cat ? ' active' : ''} ${barlow.className}`}
                  style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 24,
            }}
          >
            {filtered.map((p, i) => (
              <div
                key={p.id}
                className="bj-card"
                style={{ animationDelay: `${i * 0.075}s` }}
              >
                <div
                  style={{
                    height: 210,
                    background: 'linear-gradient(135deg, #1C1507, #2A1D0A)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : null}
                  {p.discountPrice && (
                    <div
                      className={barlow.className}
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: '#F59E0B',
                        color: '#080501',
                        borderRadius: 4,
                        padding: '2px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                      }}
                    >
                      DEAL
                    </div>
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 64,
                      background: 'linear-gradient(transparent, #110D07)',
                    }}
                  />
                </div>

                <div style={{ padding: '16px 20px 20px' }}>
                  <div
                    className={barlow.className}
                    style={{
                      fontSize: 11,
                      color: '#F59E0B',
                      fontWeight: 700,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      marginBottom: 6,
                    }}
                  >
                    {p.category}
                  </div>
                  <h3
                    className={anton.className}
                    style={{ fontSize: 24, color: '#F5F0E8', letterSpacing: '0.04em', marginBottom: 8 }}
                  >
                    {p.name}
                  </h3>
                  <p
                    className={barlow.className}
                    style={{
                      fontSize: 14,
                      color: '#7A6A58',
                      lineHeight: 1.55,
                      marginBottom: 18,
                      fontWeight: 400,
                    }}
                  >
                    {p.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      {p.discountPrice ? (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span
                            className={anton.className}
                            style={{ fontSize: 26, color: '#F59E0B' }}
                          >
                            ${p.discountPrice.toFixed(2)}
                          </span>
                          <span
                            className={barlow.className}
                            style={{ fontSize: 14, color: '#554840', textDecoration: 'line-through' }}
                          >
                            ${p.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span
                          className={anton.className}
                          style={{ fontSize: 26, color: '#F59E0B' }}
                        >
                          ${p.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      className={`bj-add ${barlow.className}`}
                      style={{ fontSize: 13 }}
                      onClick={() => addToCart(p)}
                    >
                      ADD +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cart sidebar */}
        {cartOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
            <div
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)' }}
              onClick={() => setCartOpen(false)}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: 360,
                background: '#0F0B06',
                borderLeft: '1px solid #2C2114',
                animation: 'cartIn 0.28s ease',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #2C2114',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <h3
                  className={anton.className}
                  style={{ fontSize: 26, color: '#F5F0E8', letterSpacing: '0.04em' }}
                >
                  YOUR ORDER
                </h3>
                <button
                  onClick={() => setCartOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#7A6A58', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                {cart.length === 0 ? (
                  <p
                    className={barlow.className}
                    style={{ color: '#554840', textAlign: 'center', marginTop: 48, fontSize: 16 }}
                  >
                    Nothing here yet.
                    <br />
                    Add something from the menu!
                  </p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #1C1507',
                      }}
                    >
                      <div>
                        <p
                          className={barlow.className}
                          style={{ color: '#F5F0E8', fontWeight: 600, fontSize: 15 }}
                        >
                          {item.name}
                        </p>
                        <p
                          className={barlow.className}
                          style={{ color: '#7A6A58', fontSize: 13 }}
                        >
                          x{item.qty} · ${(item.price * item.qty).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeOne(item.id)}
                        style={{
                          background: '#2C2114',
                          border: 'none',
                          color: '#9A8570',
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 16,
                          lineHeight: 1,
                        }}
                      >
                        −
                      </button>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div style={{ padding: '20px 24px', borderTop: '1px solid #2C2114' }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}
                  >
                    <span
                      className={barlow.className}
                      style={{ color: '#9A8570', fontWeight: 700, fontSize: 15, letterSpacing: '0.06em' }}
                    >
                      TOTAL
                    </span>
                    <span
                      className={anton.className}
                      style={{ color: '#F59E0B', fontSize: 24 }}
                    >
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                      color: '#080501',
                      borderRadius: 8,
                      padding: '14px',
                      textAlign: 'center',
                      fontFamily: barlow.style.fontFamily,
                      fontWeight: 700,
                      fontSize: 15,
                      letterSpacing: '0.08em',
                      textDecoration: 'none',
                    }}
                  >
                    ORDER VIA WHATSAPP
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom cart bar */}
        {itemCount > 0 && !cartOpen && (
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 40,
              padding: '0 24px 20px',
            }}
          >
            <button
              onClick={() => setCartOpen(true)}
              className={barlow.className}
              style={{
                width: '100%',
                maxWidth: 600,
                margin: '0 auto',
                display: 'flex',
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                border: 'none',
                borderRadius: 10,
                padding: '15px 24px',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'space-between',
                animation: 'amberGlow 2s ease infinite',
                boxShadow: '0 8px 32px #F59E0B40',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '0.06em', color: '#080501' }}>
                {itemCount} ITEM{itemCount !== 1 ? 'S' : ''}
              </span>
              <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '0.06em', color: '#080501' }}>
                VIEW ORDER · ${total.toFixed(2)}
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
