'use client';
import { formatMoney } from '@/lib/utils';

import { useEffect, useRef, useState } from 'react';
import { Bodoni_Moda, Outfit } from 'next/font/google';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import type { ClothingTemplateContent } from '@/lib/types/clothing-template-content';
import { defaultClothingContent } from '@/lib/data/clothing-presets';
import { parseNavLinks } from '@/lib/utils/clothing-content';
import CheckoutDrawer from '@/components/storefront/restaurant-default/CheckoutDrawer';
import { readCartDraft, clearCartDraft } from '@/lib/utils/cart-draft';
import {
  addLine, cartCount as countOf, changeQty as changeLineQty, needsOptions, removeLine, restoreFromDraft,
  type CartLine,
} from '@/lib/utils/cart-lines';
import { ProductOptionsDialog } from '@/components/storefront/shared/ProductOptionsDialog';

const bodoni = Bodoni_Moda({ subsets: ['latin'], weight: ['400','500','700','900'], style: ['normal','italic'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['300','400','500','600'] });

const DARK = '#0A0A0A';
const IVORY = '#F2EDE4';
const MUTED = '#8A857C';
const DEFAULT_GOLD = '#C4A55A';

const DOTS = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 53 + 9) % 96, y: (i * 37 + 17) % 93,
  s: 1 + (i * 11) % 5, op: 0.08 + ((i * 7) % 5) * 0.04,
}));

const FEATURES = [
  { icon: '✦', title: 'Free Returns',  desc: '30-day hassle-free' },
  { icon: '◆', title: 'Hand-Crafted',  desc: 'Atelier made with care' },
  { icon: '●', title: 'Sustainable',   desc: 'Carbon neutral shipping' },
  { icon: '◈', title: 'Bespoke',       desc: 'Custom fitting available' },
];

const TESTIMONIALS = [
  { q: 'Every piece tells a story. Simply timeless.', n: 'Isabelle M.', r: 'Paris' },
  { q: 'The quality is unmatched. I wear them to every occasion.', n: 'Priya K.', r: 'London' },
  { q: 'Editorial perfection — worth every single centime.', n: 'Yuki T.', r: 'Tokyo' },
];

const FALLBACK_COLLECTIONS = [
  { name: 'Autumn Noir', sub: '24 pieces', img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Blanc',       sub: '18 pieces', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Velvet Hour', sub: '12 pieces', img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80' },
];

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80';

const hexToRgba = (hex: string, alpha: number) => {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis] as const;
}

function useCountUp(target: number, dur = 1600, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setVal(Math.round(p * p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, dur, active]);
  return val;
}

export default function FashionEditorialTemplate({
  data,
  content: contentProp,
}: {
  data: StorefrontData;
  content?: ClothingTemplateContent;
}) {
  const { store, products } = data;
  const content = contentProp ?? defaultClothingContent('clothing-editorial');
  const wa = (store.whatsappNumber ?? '').replace(/\D/g, '');

  const gold = store.primaryColor || DEFAULT_GOLD;
  const C = { dark: DARK, ivory: IVORY, gold, muted: MUTED };

  const formatPrice = (price: number) => formatMoney(price, store.currencyCode);

  const ticker = `  ${content.tickerText}  •  `;
  const navLinks = parseNavLinks(content.navLinks);
  const testimonials = content.testimonials;

  // Collections: group products by category, use first 3 categories with images
  const categoryMap = new Map<string, typeof products[0][]>();
  products.forEach(p => {
    const cat = p.category || 'Collection';
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push(p);
  });
  const collections = Array.from(categoryMap.entries())
    .slice(0, 3)
    .map(([cat, items]) => ({
      name: cat,
      sub: `${items.length} piece${items.length !== 1 ? 's' : ''}`,
      img: items.find(p => p.imageUrl)?.imageUrl || FALLBACK_COLLECTIONS[0].img,
    }));
  if (collections.length === 0 && data.demo) collections.push(...FALLBACK_COLLECTIONS);

  const heroImg = content.heroImageUrl || products.find(p => p.imageUrl)?.imageUrl || FALLBACK_HERO;

  const stats = [
    // Only the piece count is real; the other two are illustrative and render in the showcase only.
    { v: data.demo ? Math.max(products.length, 12) : products.length, suf: data.demo ? '+' : '', l: 'Pieces Available' },
    { v: 48, suf: '', l: 'Ateliers' },
    { v: 2000, suf: '+', l: 'Pieces Crafted' },
  ];

  const [heroVis, setHeroVis] = useState(false);
  const [tIdx, setTIdx] = useState(0);
  const [statsRef, statsVis] = useInView();
  const c0 = useCountUp(stats[0].v, 1400, statsVis);
  const c1 = useCountUp(stats[1].v, 1700, statsVis);
  const c2 = useCountUp(stats[2].v, 2000, statsVis);
  const statVals = [c0, c1, c2];
  const [cart, setCart] = useState<CartLine[]>([]);
  // The product whose variant / add-on choices are being made (null = dialog closed).
  const [optionsFor, setOptionsFor] = useState<PublicProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => { const t = setTimeout(() => setHeroVis(true), 100); return () => clearTimeout(t); }, []);
  useEffect(() => { const t = setInterval(() => setTIdx(i => (i + 1) % Math.max(testimonials.length, 1)), 4500); return () => clearInterval(t); }, [testimonials.length]);

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

  const cartCount = countOf(cart);

  function addToCart(id: number) {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    // A product with variants or add-ons needs the customer to choose first.
    if (needsOptions(product)) {
      setOptionsFor(product);
      return;
    }
    setCart((prev) => addLine(prev, product, 1));
  }

  function removeFromCart(key: string) {
    setCart((prev) => removeLine(prev, key));
  }

  function changeQty(key: string, delta: number) {
    setCart((prev) => changeLineQty(prev, key, delta));
  }

  const up = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.7s ease ${d}ms, transform 0.7s ease ${d}ms`,
  });

  return (
    <div style={{ background: C.ivory, color: C.dark, fontFamily: outfit.style.fontFamily, overflowX: 'hidden' }}>
      <style>{`
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .coll-card:hover .coll-over { opacity:1!important }
        .coll-card:hover img { transform:scale(1.06)!important }
        .prod-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,0.10)!important }
        .prod-card:hover .prod-img { transform:scale(1.05) }
        .feat-box:hover { background:${C.dark}!important; color:${C.ivory}!important }
        .feat-box:hover .fg { color:${C.gold}!important }
        @media(max-width:768px){
          .hgrid{flex-direction:column!important}
          .cgrid{grid-template-columns:1fr!important}
          .pgrid{grid-template-columns:1fr 1fr!important}
          .srow{flex-direction:column!important;gap:24px!important}
          .himgw{width:100%!important;height:340px!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position:'sticky',top:0,zIndex:100,background:C.ivory,borderBottom:`1px solid rgba(0,0,0,0.08)`,padding:'0 5%' }}>
        <div style={{ maxWidth:1280,margin:'0 auto',height:64,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.shopName} style={{ width:36,height:36,objectFit:'contain',borderRadius:'50%' }} />
            ) : (
              <div style={{ width:32,height:32,borderRadius:'50%',background:C.dark,display:'flex',alignItems:'center',justifyContent:'center' }}>
                <span style={{ fontSize:12,color:C.gold,fontFamily:bodoni.style.fontFamily,fontStyle:'italic' }}>
                  {(store.shopName || 'M')[0].toUpperCase()}
                </span>
              </div>
            )}
            <span style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:18,letterSpacing:1 }}>
              {store.shopName || 'Maison Noir'}
            </span>
          </div>
          <div style={{ display:'flex',gap:32 }}>
            {navLinks.map(l => (
              <a key={l} href="#" style={{ fontSize:12,letterSpacing:2,textTransform:'uppercase',color:C.dark,textDecoration:'none',opacity:0.65,transition:'opacity 0.2s' }}
                onMouseOver={e=>(e.currentTarget.style.opacity='1')} onMouseOut={e=>(e.currentTarget.style.opacity='0.65')}>{l}</a>
            ))}
          </div>
          <button
            onClick={() => setCartOpen(true)}
            aria-label={`Open bag, ${cartCount} items`}
            style={{ position:'relative',width:36,height:36,background:'none',border:'none',cursor:'pointer',color:C.dark }}
          >
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span style={{ position:'absolute',top:2,right:2,minWidth:14,height:14,padding:'0 3px',borderRadius:7,background:C.gold,color:C.dark,fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center' }}>
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background:C.dark,minHeight:'92vh',display:'flex',alignItems:'center',position:'relative',overflow:'hidden',padding:'80px 5%' }}>
        {DOTS.map((d,i) => (
          <div key={i} style={{ position:'absolute',left:`${d.x}%`,top:`${d.y}%`,width:d.s,height:d.s,borderRadius:'50%',background:C.gold,opacity:d.op,pointerEvents:'none' }} />
        ))}
        <div style={{ maxWidth:1280,margin:'0 auto',width:'100%',display:'flex',alignItems:'center',gap:60 }} className="hgrid">
          <div style={{ flex:1,zIndex:2 }}>
            <div style={{ ...up(heroVis,0),display:'flex',alignItems:'center',gap:10,marginBottom:24 }}>
              <div style={{ width:32,height:1,background:C.gold }} />
              <span style={{ fontSize:11,letterSpacing:4,textTransform:'uppercase',color:C.gold }}>{content.heroEyebrow}</span>
            </div>
            <h1 style={{ ...up(heroVis,150),fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:'clamp(42px,6vw,84px)',fontWeight:700,color:C.ivory,lineHeight:1.08,marginBottom:28 }}>
              {content.heroTitleLine1}<br />
              <em style={{ color:C.gold }}>{content.heroTitleEmphasis}</em><br />
              {content.heroTitleLine2}
            </h1>
            <p style={{ ...up(heroVis,300),color:hexToRgba(C.ivory,0.55),fontSize:15,lineHeight:1.8,maxWidth:360,marginBottom:40 }}>
              {content.heroDescription}
            </p>
            <div style={{ ...up(heroVis,450),display:'flex',gap:16,flexWrap:'wrap' }}>
              <a href={wa ? `https://wa.me/${wa}` : '#collections'} style={{ display:'inline-flex',alignItems:'center',gap:10,padding:'14px 32px',background:C.gold,color:C.dark,textDecoration:'none',fontSize:11,letterSpacing:3,textTransform:'uppercase',fontWeight:600,cursor:'pointer' }}>
                {content.primaryCta}
              </a>
              <a href="#collections" style={{ display:'inline-flex',alignItems:'center',gap:10,padding:'14px 32px',border:`1px solid ${hexToRgba(C.ivory,0.25)}`,color:C.ivory,textDecoration:'none',fontSize:11,letterSpacing:3,textTransform:'uppercase',cursor:'pointer' }}>
                {content.secondaryCta}
              </a>
            </div>
          </div>
          <div style={{ ...up(heroVis,200),flex:'0 0 auto',width:'clamp(280px,38vw,520px)',position:'relative' }} className="himgw">
            <div style={{ aspectRatio:'3/4',overflow:'hidden' }}>
              <img src={heroImg} alt={store.shopName} style={{ width:'100%',height:'100%',objectFit:'cover',filter:'brightness(0.9)' }} />
            </div>
            <div style={{ position:'absolute',top:-8,right:-8,width:32,height:32,borderTop:`2px solid ${C.gold}`,borderRight:`2px solid ${C.gold}` }} />
            <div style={{ position:'absolute',bottom:-8,left:-8,width:32,height:32,borderBottom:`2px solid ${C.gold}`,borderLeft:`2px solid ${C.gold}` }} />
            <div style={{ position:'absolute',bottom:24,right:-20,background:C.gold,color:C.dark,padding:'8px 16px',fontSize:10,letterSpacing:2,textTransform:'uppercase',fontWeight:700 }}>
              AW 2025
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background:C.gold,overflow:'hidden',whiteSpace:'nowrap',padding:'12px 0' }}>
        <div style={{ display:'inline-block',animation:'ticker 24s linear infinite' }}>
          {[1,2].map(k => <span key={k} style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:14,color:C.dark,letterSpacing:1 }}>{ticker}</span>)}
        </div>
      </div>

      {/* COLLECTIONS */}
      <section id="collections" style={{ padding:'100px 5%',background:C.ivory }}>
        <div style={{ maxWidth:1280,margin:'0 auto' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:48 }}>
            <div>
              <p style={{ fontSize:11,letterSpacing:3,textTransform:'uppercase',color:C.gold,marginBottom:10 }}>Curated For You</p>
              <h2 style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:'clamp(32px,4vw,52px)',fontWeight:700 }}>Collections</h2>
            </div>
            <a href="#" style={{ fontSize:11,letterSpacing:2,textTransform:'uppercase',color:C.dark,textDecoration:'none',borderBottom:`1px solid ${C.dark}`,paddingBottom:2 }}>View All</a>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr',gap:12 }} className="cgrid">
            {collections.slice(0,3).map((c,i) => (
              <div key={i} className="coll-card" style={{ gridColumn:i===0?'1':'2',gridRow:i===0?'1/3':String(i),position:'relative',overflow:'hidden',cursor:'pointer',aspectRatio:i===0?'3/4':'4/3' }}>
                <img src={c.img} alt={c.name} style={{ width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.6s ease' }} />
                <div className="coll-over" style={{ position:'absolute',inset:0,background:'rgba(10,10,10,0.55)',opacity:0,transition:'opacity 0.4s',display:'flex',alignItems:'flex-end',padding:24 }}>
                  <div>
                    <p style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:22,color:C.ivory,marginBottom:4 }}>{c.name}</p>
                    <p style={{ fontSize:11,color:C.gold,letterSpacing:2 }}>{c.sub} →</p>
                  </div>
                </div>
                <div style={{ position:'absolute',bottom:16,left:16 }}>
                  <p style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:i===0?26:18,color:C.ivory,textShadow:'0 2px 12px rgba(0,0,0,0.5)' }}>{c.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <div style={{ background:C.dark,padding:'0 5%' }}>
        <div style={{ maxWidth:1280,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderTop:`1px solid rgba(255,255,255,0.08)`,borderBottom:`1px solid rgba(255,255,255,0.08)` }}>
          {FEATURES.map((f,i) => (
            <div key={i} className="feat-box" style={{ padding:'32px 24px',borderRight:i<3?`1px solid rgba(255,255,255,0.08)`:'none',cursor:'default',transition:'background 0.25s,color 0.25s',color:C.ivory }}>
              <div className="fg" style={{ fontSize:18,color:C.gold,marginBottom:10,transition:'color 0.25s' }}>{f.icon}</div>
              <p style={{ fontSize:13,fontWeight:600,marginBottom:4,letterSpacing:0.5 }}>{f.title}</p>
              <p style={{ fontSize:12,opacity:0.45 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <section style={{ padding:'100px 5%',background:C.ivory }}>
        <div style={{ maxWidth:1280,margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:56 }}>
            <p style={{ fontSize:11,letterSpacing:3,textTransform:'uppercase',color:C.gold,marginBottom:10 }}>The Edit</p>
            <h2 style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:'clamp(28px,4vw,48px)' }}>Featured Pieces</h2>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24 }} className="pgrid">
            {products.slice(0,6).map((p,i) => (
              <div key={i} className="prod-card" style={{ background:'#fff',cursor:'pointer',transition:'transform 0.3s,box-shadow 0.3s',boxShadow:'0 4px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ aspectRatio:'3/4',overflow:'hidden',background:'#F5F0E8' }}>
                  {p.imageUrl ? (
                    <img className="prod-img" src={p.imageUrl} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.5s ease' }} />
                  ) : (
                    <div className="prod-img" style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}>
                      <span style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:36,color:C.muted }}>
                        {(store.shopName || 'M')[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ padding:'16px 20px' }}>
                  <p style={{ fontSize:11,letterSpacing:1,textTransform:'uppercase',color:C.muted,marginBottom:6 }}>{p.category || 'Ready-to-Wear'}</p>
                  <p style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:17,marginBottom:8 }}>{p.name}</p>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
                    <p style={{ fontSize:15,fontWeight:600,color:C.gold }}>{formatPrice(p.discountPrice ?? p.price)}</p>
                    {p.discountPrice != null && (
                      <p style={{ fontSize:12,color:C.muted,textDecoration:'line-through' }}>{formatPrice(p.price)}</p>
                    )}
                  </div>
                  {p.available ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(p.id); }}
                      aria-label={`Add ${p.name} to bag`}
                      style={{ width:'100%',padding:'11px 0',border:`1px solid ${C.dark}`,background:'transparent',color:C.dark,fontSize:11,letterSpacing:2,textTransform:'uppercase',fontWeight:600,cursor:'pointer',fontFamily:outfit.style.fontFamily,transition:'background 0.2s,color 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.background = C.dark; e.currentTarget.style.color = C.gold; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.dark; }}
                    >
                      Add to Bag
                    </button>
                  ) : (
                    <p style={{ fontSize:11,letterSpacing:2,textTransform:'uppercase',color:C.muted,textAlign:'center' }}>Sold Out</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section ref={statsRef} style={{ background:C.dark,padding:'100px 5%',position:'relative',overflow:'hidden' }}>
        {DOTS.slice(0,10).map((d,i) => (
          <div key={i} style={{ position:'absolute',left:`${d.x}%`,top:`${d.y}%`,width:d.s,height:d.s,borderRadius:'50%',background:C.gold,opacity:d.op*0.7 }} />
        ))}
        <div style={{ maxWidth:1280,margin:'0 auto',position:'relative',zIndex:2 }}>
          <div style={{ textAlign:'center',marginBottom:64 }}>
            <div style={{ width:48,height:1,background:C.gold,margin:'0 auto 20px' }} />
            <blockquote style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:'clamp(20px,3vw,38px)',color:C.ivory,lineHeight:1.4,maxWidth:760,margin:'0 auto 48px',fontWeight:400 }}>
              "Fashion is not something that exists in dresses only. Fashion is in the sky, in the street — fashion has to do with ideas."
            </blockquote>
          </div>
          <div style={{ display:'flex',justifyContent:'center',gap:80 }} className="srow">
            {(data.demo ? stats : stats.slice(0, 1)).map((s,i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:52,color:C.gold,lineHeight:1 }}>
                  {statVals[i]}{s.suf}
                </div>
                <div style={{ fontSize:12,letterSpacing:2,textTransform:'uppercase',color:hexToRgba(C.ivory,0.5),marginTop:8 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}

      {testimonials.length > 0 && (<>
      <section style={{ padding:'100px 5%',background:C.ivory }}>
        <div style={{ maxWidth:1000,margin:'0 auto',textAlign:'center' }}>
          <p style={{ fontSize:11,letterSpacing:3,textTransform:'uppercase',color:C.gold,marginBottom:12 }}>{content.testimonialsEyebrow}</p>
          <h2 style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:'clamp(28px,4vw,44px)',marginBottom:56 }}>{content.testimonialsTitle}</h2>
          <div style={{ position:'relative',minHeight:160 }}>
            {testimonials.map((t,i) => (
              <div key={i} style={{ position:'absolute',inset:0,opacity:tIdx===i?1:0,transition:'opacity 0.7s',pointerEvents:tIdx===i?'auto':'none' }}>
                <div style={{ width:40,height:1,background:C.gold,margin:'0 auto 28px' }} />
                <p style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:'clamp(18px,2.5vw,26px)',lineHeight:1.5,marginBottom:24 }}>"{t.quote}"</p>
                <p style={{ fontSize:12,letterSpacing:2,textTransform:'uppercase',color:C.muted }}>{t.name}</p>
              </div>
            ))}
          </div>
          <div style={{ display:'flex',justifyContent:'center',gap:8,marginTop:48 }}>
            {testimonials.map((_,i) => (
              <button key={i} onClick={()=>setTIdx(i)} style={{ width:tIdx===i?28:8,height:8,borderRadius:4,background:tIdx===i?C.gold:hexToRgba(C.dark,0.15),border:'none',cursor:'pointer',transition:'all 0.3s' }} />
            ))}
          </div>
        </div>
      </section>

      </>)}

      {/* NEWSLETTER: no subscription backend exists, so the form renders in the showcase only */}

      {data.demo && (<>
      <section style={{ background:C.dark,padding:'80px 5%' }}>
        <div style={{ maxWidth:640,margin:'0 auto',textAlign:'center' }}>
          <div style={{ width:40,height:1,background:C.gold,margin:'0 auto 24px' }} />
          <h2 style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:'clamp(28px,4vw,44px)',color:C.ivory,marginBottom:12 }}>Join the Inner Circle</h2>
          <p style={{ color:hexToRgba(C.ivory,0.5),fontSize:14,marginBottom:36,lineHeight:1.7 }}>Early access to new collections and exclusive events.</p>
          <div style={{ display:'flex',border:`1px solid ${hexToRgba(C.gold,0.5)}` }}>
            <input type="email" placeholder="Your email address" style={{ flex:1,padding:'14px 20px',background:'transparent',border:'none',outline:'none',color:C.ivory,fontSize:13,fontFamily:outfit.style.fontFamily }} />
            <button style={{ padding:'14px 28px',background:C.gold,color:C.dark,border:'none',cursor:'pointer',fontSize:11,letterSpacing:2,textTransform:'uppercase',fontWeight:700 }}>Subscribe</button>
          </div>
        </div>
      </section>

      </>)}

      {/* FOOTER */}
      <footer style={{ background:'#050505',padding:'48px 5%',borderTop:`1px solid ${hexToRgba(C.gold,0.15)}` }}>
        <div style={{ maxWidth:1280,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16 }}>
          <span style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:18,color:C.gold }}>{store.shopName || 'Maison Noir'}</span>
          <p style={{ fontSize:11,color:hexToRgba(C.ivory,0.3),letterSpacing:1 }}>© 2025 {store.shopName || 'Maison Noir'}. All rights reserved.</p>
        </div>
      </footer>

      <ProductOptionsDialog
        product={optionsFor}
        currencySuffix={store.currencySuffix}
        accent={store.primaryColor || '#111827'}
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
        onChangeQty={changeQty}
        onRemove={removeFromCart}
        onOrderPlaced={() => setCart([])}
      />
    </div>
  );
}
