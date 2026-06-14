'use client';

import { useState } from 'react';
import { Fraunces, Quicksand } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import { ShoppingBag, X, Heart } from 'lucide-react';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['300', '400', '700'], style: ['normal', 'italic'] });
const quicksand = Quicksand({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

type CartItem = { id: number; name: string; price: number; qty: number };

const CATEGORIES = ['All', 'Cakes', 'Pastries', 'Drinks', 'Seasonal'];

const CONFETTI = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  x: (i * 3.9 + 2) % 100,
  size: 5 + (i % 7),
  delay: (i * 0.22) % 6,
  duration: 7 + (i % 5),
  color: ['#FDDDE6', '#E0D4FB', '#FEF08A', '#BBF7D0', '#BAE6FD', '#FBCFE8'][i % 6],
  shape: i % 3 === 0 ? '50%' : i % 3 === 1 ? '4px' : '0%',
}));

const CARD_ACCENT = ['#F9A8D4', '#C4B5FD', '#FDE68A', '#6EE7B7', '#93C5FD'];

export default function SweetShopTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

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

  const toggleWishlist = (id: number) =>
    setWishlist((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]));

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const itemCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const waMsg = `Hi! I'd like to order: ${cart.map((c) => `${c.qty}x ${c.name}`).join(', ')}. Total: $${total.toFixed(2)}`;
  const waHref = `https://wa.me/${(store.whatsappNumber ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(waMsg)}`;

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-30px) rotate(0deg); opacity: 0; }
          8%   { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(420deg); opacity: 0; }
        }
        @keyframes blobMorph {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50%       { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        @keyframes floatBob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes fadeUp {
          from { transform: translateY(26px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes cardIn {
          from { transform: scale(0.88) translateY(22px); opacity: 0; }
          to   { transform: scale(1)    translateY(0);    opacity: 1; }
        }
        @keyframes heartPop {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.45); }
        }
        @keyframes cartIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes pinkGlow {
          0%, 100% { box-shadow: 0 8px 32px rgba(236,72,153,0.35); }
          50%       { box-shadow: 0 12px 48px rgba(236,72,153,0.6); }
        }
        .ss-card {
          background: #FFFFFF;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(236,72,153,0.08);
          transition: transform 0.24s ease, box-shadow 0.24s ease;
          animation: cardIn 0.5s ease both;
          position: relative;
        }
        .ss-card:hover {
          transform: translateY(-8px) scale(1.015);
          box-shadow: 0 18px 44px rgba(236,72,153,0.2);
        }
        .ss-tab {
          border-radius: 100px;
          padding: 8px 20px;
          border: 2px solid #FBCFE8;
          background: white;
          color: #B06090;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .ss-tab.active { background: #EC4899; border-color: #EC4899; color: white; }
        .ss-tab:hover:not(.active) { border-color: #EC4899; color: #EC4899; }
        .ss-add {
          background: #EC4899;
          color: white;
          border: none;
          border-radius: 100px;
          padding: 10px 22px;
          cursor: pointer;
          font-weight: 700;
          transition: background 0.18s, transform 0.14s;
        }
        .ss-add:hover { background: #DB2777; transform: scale(1.05); }
        .heart-btn { transition: color 0.18s; }
        .heart-btn.liked { animation: heartPop 0.3s ease; }
      `}</style>

      <div
        style={{
          background: '#FFF8F0',
          minHeight: '100vh',
          fontFamily: quicksand.style.fontFamily,
          position: 'relative',
          overflowX: 'hidden',
        }}
      >
        {/* Confetti */}
        {CONFETTI.map((c) => (
          <div
            key={c.id}
            style={{
              position: 'fixed',
              left: `${c.x}%`,
              top: -30,
              width: c.size,
              height: c.size,
              borderRadius: c.shape,
              background: c.color,
              animation: `confettiFall ${c.duration}s ${c.delay}s linear infinite`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        ))}

        {/* Background blobs */}
        <div
          style={{
            position: 'fixed',
            top: -120,
            right: -100,
            width: 440,
            height: 440,
            background: '#FDDDE6',
            opacity: 0.42,
            animation: 'blobMorph 9s ease infinite',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'fixed',
            bottom: -100,
            left: -80,
            width: 360,
            height: 360,
            background: '#E0D4FB',
            opacity: 0.38,
            animation: 'blobMorph 11s 3s ease infinite reverse',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Header */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'rgba(255,248,240,0.9)',
            backdropFilter: 'blur(18px)',
            borderBottom: '1px solid #FBCFE8',
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
                background: 'linear-gradient(135deg, #EC4899, #A855F7)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'floatBob 3s ease infinite',
                fontSize: 18,
                color: 'white',
                fontWeight: 700,
              }}
            >
              ✦
            </div>
            <span
              className={fraunces.className}
              style={{ fontSize: 21, color: '#3D2B1F', fontStyle: 'italic', fontWeight: 700 }}
            >
              {store.shopName}
            </span>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            style={{
              background: '#EC4899',
              border: 'none',
              color: 'white',
              borderRadius: 100,
              padding: '8px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: quicksand.style.fontFamily,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            <ShoppingBag size={16} />
            {itemCount > 0 ? `Cart (${itemCount})` : 'Cart'}
          </button>
        </header>

        {/* Hero */}
        <section
          style={{ position: 'relative', padding: '80px 24px 60px', textAlign: 'center', zIndex: 1 }}
        >
          <p
            className={quicksand.className}
            style={{
              color: '#C084A8',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: 18,
              animation: 'fadeUp 0.6s 0.1s ease both',
              opacity: 0,
            }}
          >
            Handmade with love · Since 2020
          </p>
          <h1
            className={fraunces.className}
            style={{
              fontSize: 'clamp(48px, 10vw, 96px)',
              fontStyle: 'italic',
              fontWeight: 700,
              color: '#3D2B1F',
              lineHeight: 1.05,
              animation: 'fadeUp 0.6s 0.22s ease both',
              opacity: 0,
            }}
          >
            {store.shopName}
          </h1>
          <p
            className={quicksand.className}
            style={{
              color: '#9C6B82',
              fontSize: 18,
              maxWidth: 460,
              margin: '18px auto 32px',
              lineHeight: 1.65,
              animation: 'fadeUp 0.6s 0.36s ease both',
              opacity: 0,
            }}
          >
            {store.description}
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 40,
              animation: 'fadeUp 0.6s 0.48s ease both',
              opacity: 0,
            }}
          >
            {(['Fresh Daily', 'Handmade', 'Artisan'] as const).map((tag, i) => (
              <span
                key={tag}
                className={quicksand.className}
                style={{
                  background: CARD_ACCENT[i],
                  color: '#3D2B1F',
                  borderRadius: 100,
                  padding: '6px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={() => document.getElementById('ss-menu')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: 'linear-gradient(135deg, #EC4899, #A855F7)',
              color: 'white',
              border: 'none',
              borderRadius: 100,
              padding: '14px 42px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: quicksand.style.fontFamily,
              boxShadow: '0 8px 28px rgba(236,72,153,0.35)',
              animation: 'fadeUp 0.6s 0.58s ease both',
              opacity: 0,
            }}
          >
            Shop Now
          </button>
        </section>

        {/* Wavy section break */}
        <div style={{ position: 'relative', height: 56, overflow: 'hidden' }}>
          <svg
            viewBox="0 0 1200 56"
            style={{ position: 'absolute', bottom: 0, width: '100%' }}
            preserveAspectRatio="none"
          >
            <path
              d="M0,28 C200,56 400,0 600,28 C800,56 1000,0 1200,28 L1200,56 L0,56 Z"
              fill="#FFF0F6"
            />
          </svg>
        </div>

        {/* Menu */}
        <section id="ss-menu" style={{ background: '#FFF0F6', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 24px 130px' }}>
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
                className={fraunces.className}
                style={{ fontSize: 38, color: '#3D2B1F', fontStyle: 'italic' }}
              >
                Our Menu
              </h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`ss-tab${activeCategory === cat ? ' active' : ''} ${quicksand.className}`}
                    style={{ fontSize: 14, fontWeight: 700 }}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 24,
              }}
            >
              {filtered.map((p, i) => {
                const accent = CARD_ACCENT[i % CARD_ACCENT.length];
                const nextAccent = CARD_ACCENT[(i + 1) % CARD_ACCENT.length];
                const liked = wishlist.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className="ss-card"
                    style={{ animationDelay: `${i * 0.075}s` }}
                  >
                    <div style={{ height: 4, background: accent }} />
                    <div
                      style={{
                        height: 210,
                        background: `linear-gradient(135deg, ${accent}44, ${nextAccent}28)`,
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 72,
                            height: 72,
                            borderRadius: '50%',
                            background: accent,
                            opacity: 0.5,
                          }}
                        />
                      )}
                      <button
                        className={`heart-btn${liked ? ' liked' : ''}`}
                        onClick={() => toggleWishlist(p.id)}
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          background: 'white',
                          border: 'none',
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          color: liked ? '#EC4899' : '#C084A8',
                        }}
                      >
                        <Heart size={16} fill={liked ? '#EC4899' : 'none'} />
                      </button>
                      {p.discountPrice && (
                        <div
                          className={quicksand.className}
                          style={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            background: '#EC4899',
                            color: 'white',
                            borderRadius: 100,
                            padding: '3px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          Sale
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '16px 20px 20px' }}>
                      <span
                        className={quicksand.className}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.16em',
                          color: '#C084A8',
                          textTransform: 'uppercase',
                        }}
                      >
                        {p.category}
                      </span>
                      <h3
                        className={fraunces.className}
                        style={{
                          fontSize: 21,
                          color: '#3D2B1F',
                          fontStyle: 'italic',
                          margin: '5px 0 8px',
                        }}
                      >
                        {p.name}
                      </h3>
                      <p
                        className={quicksand.className}
                        style={{
                          fontSize: 13,
                          color: '#9C6B82',
                          lineHeight: 1.55,
                          marginBottom: 18,
                        }}
                      >
                        {p.description}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          {p.discountPrice ? (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                              <span
                                className={fraunces.className}
                                style={{ fontSize: 22, fontWeight: 700, color: '#EC4899' }}
                              >
                                ${p.discountPrice.toFixed(2)}
                              </span>
                              <span
                                className={quicksand.className}
                                style={{
                                  fontSize: 14,
                                  color: '#C8A0B4',
                                  textDecoration: 'line-through',
                                }}
                              >
                                ${p.price.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span
                              className={fraunces.className}
                              style={{ fontSize: 22, fontWeight: 700, color: '#EC4899' }}
                            >
                              ${p.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <button
                          className={`ss-add ${quicksand.className}`}
                          style={{ fontSize: 14 }}
                          onClick={() => addToCart(p)}
                        >
                          Add +
                        </button>
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
            <div
              style={{ position: 'absolute', inset: 0, background: 'rgba(61,43,31,0.44)' }}
              onClick={() => setCartOpen(false)}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: 360,
                background: '#FFF8F0',
                borderLeft: '1px solid #FBCFE8',
                animation: 'cartIn 0.28s ease',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #FBCFE8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <h3
                  className={fraunces.className}
                  style={{ fontSize: 24, color: '#3D2B1F', fontStyle: 'italic' }}
                >
                  Your Cart
                </h3>
                <button
                  onClick={() => setCartOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#C084A8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                {cart.length === 0 ? (
                  <p
                    className={quicksand.className}
                    style={{
                      color: '#C084A8',
                      textAlign: 'center',
                      marginTop: 48,
                      lineHeight: 1.8,
                      fontSize: 16,
                    }}
                  >
                    Your cart is empty.
                    <br />
                    Add a treat!
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
                        borderBottom: '1px solid #FBCFE8',
                      }}
                    >
                      <div>
                        <p
                          className={quicksand.className}
                          style={{ color: '#3D2B1F', fontWeight: 700, fontSize: 15 }}
                        >
                          {item.name}
                        </p>
                        <p
                          className={quicksand.className}
                          style={{ color: '#C084A8', fontSize: 13 }}
                        >
                          x{item.qty} · ${(item.price * item.qty).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeOne(item.id)}
                        style={{
                          background: '#FBCFE8',
                          border: 'none',
                          color: '#EC4899',
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          cursor: 'pointer',
                          fontSize: 16,
                          fontWeight: 700,
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
                <div style={{ padding: '20px 24px', borderTop: '1px solid #FBCFE8' }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}
                  >
                    <span
                      className={quicksand.className}
                      style={{ color: '#9C6B82', fontWeight: 700 }}
                    >
                      Total
                    </span>
                    <span
                      className={fraunces.className}
                      style={{ color: '#EC4899', fontSize: 22, fontWeight: 700 }}
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
                      background: 'linear-gradient(135deg, #EC4899, #A855F7)',
                      color: 'white',
                      borderRadius: 100,
                      padding: '14px',
                      textAlign: 'center',
                      fontFamily: quicksand.style.fontFamily,
                      fontWeight: 700,
                      fontSize: 15,
                      textDecoration: 'none',
                      boxShadow: '0 8px 28px rgba(236,72,153,0.32)',
                    }}
                  >
                    Order via WhatsApp
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
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <button
                onClick={() => setCartOpen(true)}
                className={quicksand.className}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #EC4899, #A855F7)',
                  border: 'none',
                  borderRadius: 100,
                  padding: '15px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  animation: 'pinkGlow 2s ease infinite',
                }}
              >
                <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>
                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                </span>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>
                  View Cart · ${total.toFixed(2)}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
