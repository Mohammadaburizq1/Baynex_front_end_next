'use client';

import { useState, useEffect } from 'react';
import type { StorefrontData } from '@/lib/types/store';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Orbitron, Space_Grotesk } from 'next/font/google';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'], display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], display: 'swap' });

export default function NeonDripTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const [cart, setCart] = useState<Record<number, number>>({});
  const [glitch, setGlitch] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find(p => p.id === Number(id));
    return sum + (p ? (p.discountPrice ?? p.price) * qty : 0);
  }, 0);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      setGlitch(true);
      t = setTimeout(() => {
        setGlitch(false);
        t = setTimeout(tick, 3500 + Math.random() * 4000);
      }, 200);
    };
    t = setTimeout(tick, 2500);
    return () => clearTimeout(t);
  }, []);

  const add = (id: number) => setCart(c => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const sub = (id: number) => setCart(c => {
    const next = { ...c };
    if ((next[id] ?? 0) > 1) next[id]--;
    else delete next[id];
    return next;
  });

  const available = products.filter(p => p.available);
  const categories = ['All', ...Array.from(new Set(available.map(p => p.category)))];
  const filtered = activeCategory === 'All' ? available : available.filter(p => p.category === activeCategory);

  return (
    <>
      <style>{`
        @keyframes steamRise {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.75; }
          40%  { transform: translateY(-24px) translateX(3px) scale(1.3); opacity: 0.4; }
          100% { transform: translateY(-55px) translateX(-2px) scale(0.7); opacity: 0; }
        }
        @keyframes neonCyanFlicker {
          0%,88%,100% { text-shadow: 0 0 8px #00D9FF,0 0 22px #00D9FF,0 0 45px rgba(0,217,255,0.5); }
          89% { text-shadow: none; opacity: 0.8; }
          91% { text-shadow: 0 0 6px #00D9FF; opacity: 1; }
          93% { text-shadow: none; opacity: 0.55; }
          95% { text-shadow: 0 0 8px #00D9FF,0 0 22px #00D9FF; opacity: 1; }
        }
        @keyframes neonPinkFlicker {
          0%,86%,100% { text-shadow: 0 0 8px #FF3CAC,0 0 22px #FF3CAC,0 0 45px rgba(255,60,172,0.5); }
          87% { text-shadow: none; opacity: 0.7; }
          89% { text-shadow: 0 0 6px #FF3CAC; opacity: 1; }
          92% { text-shadow: none; opacity: 0.5; }
          94% { text-shadow: 0 0 8px #FF3CAC,0 0 28px #FF3CAC; opacity: 1; }
        }
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes ctaPulse {
          0%,100% { box-shadow: 0 0 8px rgba(0,217,255,0.35),0 0 18px rgba(0,217,255,0.15); }
          50%     { box-shadow: 0 0 22px rgba(0,217,255,0.7),0 0 44px rgba(0,217,255,0.3); }
        }
        @keyframes floatBob {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-11px); }
        }
        @keyframes scanLine {
          0%   { top: -4%; }
          100% { top: 104%; }
        }
        @keyframes gridPulse {
          0%,100% { opacity: 0.028; }
          50%     { opacity: 0.055; }
        }
        @keyframes orb1Drift {
          0%,100% { transform: translate(0,0) scale(1); }
          33%     { transform: translate(50px,-35px) scale(1.08); }
          66%     { transform: translate(-25px,25px) scale(0.94); }
        }
        @keyframes orb2Drift {
          0%,100% { transform: translate(0,0) scale(1); }
          33%     { transform: translate(-35px,50px) scale(0.92); }
          66%     { transform: translate(25px,-25px) scale(1.08); }
        }
        @keyframes glitchA {
          0%,100% { clip-path: inset(0 0 100% 0); transform: none; }
          20%     { clip-path: inset(18% 0 65% 0); transform: translateX(-5px); }
          40%     { clip-path: inset(55% 0 28% 0); transform: translateX(4px); }
          60%     { clip-path: inset(78% 0 8%  0); transform: translateX(-3px); }
          80%     { clip-path: inset(35% 0 48% 0); transform: translateX(5px); }
        }
        @keyframes glitchB {
          0%,100% { clip-path: inset(0 0 100% 0); transform: none; }
          20%     { clip-path: inset(62% 0 22% 0); transform: translateX(5px); }
          40%     { clip-path: inset(22% 0 62% 0); transform: translateX(-4px); }
          60%     { clip-path: inset(85% 0 5%  0); transform: translateX(3px); }
          80%     { clip-path: inset(8%  0 82% 0); transform: translateX(-5px); }
        }
        .nc { animation: neonCyanFlicker 6.5s linear infinite; }
        .np { animation: neonPinkFlicker 7.5s linear infinite; }
        .card-c { transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease; }
        .card-c:hover { transform: translateY(-6px); box-shadow: 0 0 22px rgba(0,217,255,0.45),0 0 44px rgba(0,217,255,0.2); border-color: #00D9FF !important; }
        .card-p { transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease; }
        .card-p:hover { transform: translateY(-6px); box-shadow: 0 0 22px rgba(255,60,172,0.45),0 0 44px rgba(255,60,172,0.2); border-color: #FF3CAC !important; }
        .cta-btn { animation: ctaPulse 2.5s ease-in-out infinite; transition: background 0.2s ease; }
        .cta-btn:hover { background: rgba(0,217,255,0.14) !important; }
      `}</style>

      <div className={`min-h-screen relative overflow-x-hidden ${spaceGrotesk.className}`} style={{ background: '#070710', color: '#E8E8FF' }}>

        {/* ── Animated dot grid ── */}
        <div className="fixed inset-0 pointer-events-none z-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,217,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,217,255,0.04) 1px,transparent 1px)',
          backgroundSize: '64px 64px',
          animation: 'gridPulse 5s ease-in-out infinite',
        }} />

        {/* ── Ambient orbs ── */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div style={{ position:'absolute', top:'-18%', left:'-10%', width:680, height:680, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,217,255,0.17) 0%, transparent 70%)', filter:'blur(65px)', animation:'orb1Drift 16s ease-in-out infinite' }} />
          <div style={{ position:'absolute', top:'18%', right:'-12%', width:560, height:560, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,60,172,0.14) 0%, transparent 70%)', filter:'blur(65px)', animation:'orb2Drift 20s ease-in-out infinite' }} />
          <div style={{ position:'absolute', bottom:'-8%', left:'28%', width:420, height:420, borderRadius:'50%', background:'radial-gradient(circle, rgba(120,75,160,0.1) 0%, transparent 70%)', filter:'blur(55px)' }} />
        </div>

        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center z-10 overflow-hidden">

          {/* Scanline */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.04 }}>
            <div style={{ position:'absolute', left:0, right:0, height:3, background:'#00D9FF', animation:'scanLine 10s linear infinite' }} />
          </div>

          {/* Store badge */}
          <div className="mb-8 px-5 py-1.5 rounded-full text-xs font-semibold tracking-[0.3em] uppercase" style={{ border:'1px solid rgba(0,217,255,0.28)', color:'#00D9FF', background:'rgba(0,217,255,0.07)' }}>
            ◈&nbsp;&nbsp;{store.shopName}&nbsp;&nbsp;◈
          </div>

          {/* Glitch title */}
          <div className="relative mb-6">
            {glitch && (
              <>
                <span
                  className={`${orbitron.className} absolute inset-0 text-5xl sm:text-7xl lg:text-8xl font-black leading-[1.05] pointer-events-none select-none`}
                  style={{ color:'#FF3CAC', left:4, animation:'glitchA 0.2s steps(3) forwards' }}
                  aria-hidden
                >
                  STAY UP.<br />DRINK<br />COFFEE.
                </span>
                <span
                  className={`${orbitron.className} absolute inset-0 text-5xl sm:text-7xl lg:text-8xl font-black leading-[1.05] pointer-events-none select-none`}
                  style={{ color:'#00D9FF', left:-4, animation:'glitchB 0.2s steps(3) forwards' }}
                  aria-hidden
                >
                  STAY UP.<br />DRINK<br />COFFEE.
                </span>
              </>
            )}
            <h1 className={`${orbitron.className} text-5xl sm:text-7xl lg:text-8xl font-black leading-[1.05] relative z-10`} style={{ letterSpacing:'-0.02em' }}>
              STAY UP.<br />
              <span className="nc" style={{ color:'#00D9FF' }}>DRINK</span><br />
              <span className="np" style={{ color:'#FF3CAC' }}>COFFEE.</span>
            </h1>
          </div>

          <p className="text-base sm:text-lg mb-12 max-w-sm" style={{ color:'rgba(232,232,255,0.5)' }}>
            {store.description}
          </p>

          {/* Floating cups with steam */}
          <div className="flex gap-10 mb-14 select-none" aria-hidden>
            {[0, 1, 2].map(i => (
              <div key={i} className="relative" style={{ animation:`floatBob ${2.6 + i * 0.45}s ease-in-out ${i * 0.55}s infinite` }}>
                <span className="text-5xl">☕</span>
                {[0, 1, 2].map(j => (
                  <span
                    key={j}
                    className="absolute rounded-full"
                    style={{
                      bottom: '88%',
                      left: `${20 + j * 28}%`,
                      width: 5, height: 5,
                      background: i % 2 === 0 ? 'rgba(0,217,255,0.65)' : 'rgba(255,60,172,0.65)',
                      animation: `steamRise ${2.4 + j * 0.55}s ease-in ${j * 0.75 + i * 0.35}s infinite`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            className="cta-btn px-10 py-4 rounded-full text-sm font-bold tracking-[0.22em] uppercase cursor-pointer"
            style={{ border:'1px solid #00D9FF', color:'#00D9FF', background:'transparent' }}
            onClick={() => document.getElementById('nd-menu')?.scrollIntoView({ behavior:'smooth' })}
          >
            ⚡ VIEW MENU
          </button>

          {/* Scroll hint */}
          <div className="absolute bottom-8 flex flex-col items-center gap-2 pointer-events-none" style={{ color:'rgba(232,232,255,0.22)' }}>
            <span className="text-[10px] tracking-[0.28em] uppercase">Scroll</span>
            <div className="w-px h-12" style={{ background:'linear-gradient(to bottom, rgba(0,217,255,0.55), transparent)' }} />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            MARQUEE
        ══════════════════════════════════════════ */}
        <div className="relative overflow-hidden z-10" style={{ borderTop:'1px solid rgba(0,217,255,0.1)', borderBottom:'1px solid rgba(0,217,255,0.1)', background:'rgba(0,217,255,0.035)', padding:'11px 0' }}>
          <div style={{ display:'flex', whiteSpace:'nowrap', animation:'marqueeScroll 24s linear infinite' }}>
            {[...available, ...available].map((p, i) => (
              <span key={i} className="inline-flex items-center gap-4 px-8 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color:'rgba(0,217,255,0.55)' }}>
                <span style={{ color:'rgba(255,60,172,0.55)' }}>◈</span>
                {p.name}
                <span style={{ color:'rgba(255,60,172,0.65)' }}>${(p.discountPrice ?? p.price).toFixed(2)}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            MENU GRID
        ══════════════════════════════════════════ */}
        <section id="nd-menu" className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-1 rounded text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ background:'rgba(255,60,172,0.08)', color:'#FF3CAC', border:'1px solid rgba(255,60,172,0.25)' }}>
              — Menu —
            </div>
            <h2 className={`${orbitron.className} text-4xl sm:text-5xl font-bold`}>
              WHAT&apos;S{' '}
              <span className="np" style={{ color:'#FF3CAC' }}>HOT</span>
            </h2>
            <p className="mt-3 text-xs" style={{ color:'rgba(232,232,255,0.35)' }}>
              {store.openingHours} · {store.deliveryInfo}
            </p>
          </div>

          {/* Category filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map(cat => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-200"
                  style={{
                    border: `1px solid ${isActive ? '#00D9FF' : 'rgba(0,217,255,0.2)'}`,
                    color: isActive ? '#070710' : 'rgba(0,217,255,0.6)',
                    background: isActive ? '#00D9FF' : 'rgba(0,217,255,0.06)',
                    boxShadow: isActive ? '0 0 14px rgba(0,217,255,0.5),0 0 28px rgba(0,217,255,0.2)' : 'none',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((product, i) => {
              const isCyan = i % 2 === 0;
              const accent = isCyan ? '#00D9FF' : '#FF3CAC';
              const glowClass = isCyan ? 'card-c' : 'card-p';
              const qty = cart[product.id] ?? 0;
              const display = (product.discountPrice ?? product.price).toFixed(2);

              return (
                <div
                  key={product.id}
                  className={`relative flex flex-col rounded-2xl border p-5 ${glowClass}`}
                  style={{ background:'rgba(255,255,255,0.027)', borderColor:`${accent}22`, backdropFilter:'blur(14px)' }}
                >
                  {product.discountPrice && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background:`${accent}1A`, color:accent, border:`1px solid ${accent}30` }}>
                      SALE
                    </span>
                  )}

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 shrink-0" style={{ background:`${accent}10`, border:`1px solid ${accent}1E` }}>
                    ☕
                  </div>

                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color:`${accent}70` }}>
                    {product.category}
                  </p>
                  <h3 className={`${orbitron.className} text-[13px] font-bold uppercase tracking-wide mb-2 leading-snug`} style={{ color:'#E8E8FF' }}>
                    {product.name}
                  </h3>
                  <p className="text-xs leading-relaxed flex-1 mb-5" style={{ color:'rgba(232,232,255,0.42)' }}>
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold" style={{ color:accent }}>${display}</span>
                      {product.discountPrice && (
                        <span className="ml-2 text-xs line-through" style={{ color:'rgba(232,232,255,0.28)' }}>${product.price.toFixed(2)}</span>
                      )}
                    </div>
                    {qty === 0 ? (
                      <button
                        onClick={() => add(product.id)}
                        className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:opacity-80"
                        style={{ background:`${accent}16`, color:accent, border:`1px solid ${accent}30` }}
                      >
                        <Plus size={16} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => sub(product.id)} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80" style={{ background:`${accent}16`, color:accent }}>
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-sm font-bold" style={{ color:accent }}>{qty}</span>
                        <button onClick={() => add(product.id)} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80" style={{ background:`${accent}16`, color:accent }}>
                          <Plus size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CART BAR
        ══════════════════════════════════════════ */}
        {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50" style={{ background:'rgba(7,7,16,0.96)', borderTop:'1px solid rgba(0,217,255,0.18)', backdropFilter:'blur(22px)' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart size={20} style={{ color:'#00D9FF' }} />
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold" style={{ background:'#FF3CAC', color:'#fff' }}>
                    {totalItems}
                  </span>
                </div>
                <span className="text-sm" style={{ color:'rgba(232,232,255,0.55)' }}>
                  {totalItems} item{totalItems !== 1 ? 's' : ''} · {store.currencyCode}
                </span>
              </div>
              <button
                className="px-8 py-2.5 rounded-full text-sm font-bold tracking-wider uppercase cursor-pointer transition-opacity hover:opacity-90"
                style={{ background:'linear-gradient(90deg, #00D9FF, #FF3CAC)', color:'#070710' }}
              >
                Checkout — ${totalPrice.toFixed(2)}
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
