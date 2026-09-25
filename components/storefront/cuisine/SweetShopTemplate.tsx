'use client';
import { formatMoney } from '@/lib/utils';

import { useEffect, useState } from 'react';
import { Fraunces, Quicksand } from 'next/font/google';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ShoppingBag, Heart } from 'lucide-react';
import CheckoutDrawer from '@/components/storefront/restaurant-default/CheckoutDrawer';
import { ProductOptionsDialog } from '@/components/storefront/shared/ProductOptionsDialog';
import { readCartDraft, clearCartDraft } from '@/lib/utils/cart-draft';
import {
  addLine, cartCount as countOf, cartSubtotal, changeQty as changeLineQty, needsOptions, removeLine, restoreFromDraft,
  type CartLine,
} from '@/lib/utils/cart-lines';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['300', '400', '700'], style: ['normal', 'italic'] });
const quicksand = Quicksand({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

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
  // Real stores filter by their own categories; the fixed list is showcase-only (it matched nothing real).
  const categories = data.demo ? CATEGORIES : ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const tc = data.templateContent;
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);
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

  const toggleWishlist = (id: number) =>
    setWishlist((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]));

  const total = cartSubtotal(cart);
  const itemCount = countOf(cart);

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
            {tc?.heroDescription || store.description}
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
                {categories.map((cat) => (
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
                                {formatMoney(p.discountPrice, store.currencySuffix)}
                              </span>
                              <span
                                className={quicksand.className}
                                style={{
                                  fontSize: 14,
                                  color: '#C8A0B4',
                                  textDecoration: 'line-through',
                                }}
                              >
                                {formatMoney(p.price, store.currencySuffix)}
                              </span>
                            </div>
                          ) : (
                            <span
                              className={fraunces.className}
                              style={{ fontSize: 22, fontWeight: 700, color: '#EC4899' }}
                            >
                              {formatMoney(p.price, store.currencySuffix)}
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

        <ProductOptionsDialog
          product={optionsFor}
          currencySuffix={store.currencySuffix}
          accent="#EC4899"
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
                  View Cart · {formatMoney(total, store.currencySuffix)}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
