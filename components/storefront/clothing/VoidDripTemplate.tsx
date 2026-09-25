'use client';
import { formatMoney } from '@/lib/utils';

import { useEffect, useRef, useState } from 'react';
import { Anton, Space_Grotesk } from 'next/font/google';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import type { ClothingTemplateContent } from '@/lib/types/clothing-template-content';
import { defaultClothingContent } from '@/lib/data/clothing-presets';
import { parseNavLinks, parseSocialLinks } from '@/lib/utils/clothing-content';
import CheckoutDrawer from '@/components/storefront/restaurant-default/CheckoutDrawer';
import { readCartDraft, clearCartDraft } from '@/lib/utils/cart-draft';
import {
  addLine, cartCount as countOf, changeQty as changeLineQty, needsOptions, removeLine, restoreFromDraft,
  type CartLine,
} from '@/lib/utils/cart-lines';
import { ProductOptionsDialog } from '@/components/storefront/shared/ProductOptionsDialog';

const anton = Anton({ subsets: ['latin'], weight: ['400'] });
const space = Space_Grotesk({ subsets: ['latin'], weight: ['300','400','500','600','700'] });

const BLACK = '#0D0D0D';
const WHITE = '#F5F5F5';
const GRAY = '#1A1A1A';
const MID = '#2A2A2A';
const DEFAULT_LIME = '#D4F500';

const NOISE = Array.from({ length: 22 }, (_, i) => ({
  x1: (i * 41 + 7) % 100, x2: (i * 59 + 23) % 100,
  y: (i * 17 + 11) % 100, op: 0.03 + ((i * 7) % 5) * 0.01,
}));

const TESTIMONIALS = [
  { q: 'This brand hits different. Every cop is a statement.', n: 'Marcus D.', r: 'NYC' },
  { q: 'The quality is insane for the price. Street certified.', n: 'Kenji R.', r: 'Tokyo' },
  { q: 'Copped the first drop and never looked back.', n: 'Destiny L.', r: 'London' },
];

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

export default function VoidDripTemplate({
  data,
  content: contentProp,
}: {
  data: StorefrontData;
  content?: ClothingTemplateContent;
}) {
  const { store, products } = data;
  const content = contentProp ?? defaultClothingContent('clothing-streetwear');
  const wa = (store.whatsappNumber ?? '').replace(/\D/g, '');

  const lime = store.primaryColor || DEFAULT_LIME;
  const C = { black: BLACK, lime, white: WHITE, gray: GRAY, mid: MID };

  const formatPrice = (price: number) => formatMoney(price, store.currencyCode);

  const ticker = `  ${content.tickerText}  •  `;

  const navLinks = parseNavLinks(content.navLinks);
  const testimonials = content.testimonials;
  const socialLinks = parseSocialLinks(content.footerSocialLinks);

  // Derive drops from products (show as limited drops)
  const drops = products.slice(0, 3).map(p => ({
    date: p.category ? p.category.toUpperCase() : 'LIMITED',
    name: p.name.toUpperCase(),
    status: p.available && p.stock > 0 ? 'SHOP NOW' : 'NOTIFY ME',
    hot: p.available && p.stock > 0,
  }));
  if (drops.length === 0) {
    drops.push(
      { date: 'JUL 12', name: 'PHANTOM HOODIE', status: 'COMING SOON', hot: true },
      { date: 'JUL 19', name: 'VOID CARGOS V2', status: 'NOTIFY ME', hot: false },
      { date: 'AUG 03', name: 'DEAD SEASON CAP', status: 'NOTIFY ME', hot: false },
    );
  }

  // Real stores show only their real piece count; the drop-model claims are showcase copy.
  const stats = data.demo ? [
    { v: products.length > 0 ? `${products.length}+` : '04', l: 'PIECES' },
    { v: '48H', l: 'DROP WINDOW' },
    { v: '100%', l: 'LIMITED' },
    { v: '0', l: 'RESTOCKS' },
  ] : [{ v: String(products.length), l: 'PIECES' }];

  // Brand name split: first word gets lime box, rest stays white
  const nameParts = (store.shopName || 'VOID DRIP').split(' ');
  const brandFirst = nameParts[0] || 'VOID';
  const brandRest = nameParts.slice(1).join(' ') || 'DRIP';

  const [heroVis, setHeroVis] = useState(false);
  const [tIdx, setTIdx] = useState(0);
  const [cart, setCart] = useState<CartLine[]>([]);
  // The product whose variant / add-on choices are being made (null = dialog closed).
  const [optionsFor, setOptionsFor] = useState<PublicProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => { const t = setTimeout(() => setHeroVis(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => { const t = setInterval(() => setTIdx(i => (i + 1) % Math.max(testimonials.length, 1)), 4000); return () => clearInterval(t); }, [testimonials.length]);

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

  const up = (d = 0): React.CSSProperties => ({
    opacity: heroVis ? 1 : 0,
    transform: heroVis ? 'translateY(0)' : 'translateY(40px)',
    transition: `opacity 0.6s ease ${d}ms, transform 0.6s ease ${d}ms`,
  });

  return (
    <div style={{ background: C.black, color: C.white, fontFamily: space.style.fontFamily, overflowX: 'hidden' }}>
      <style>{`
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .prod-card:hover { border-color:${C.lime}!important }
        .prod-card:hover .pimg { transform:scale(1.05) }
        .prod-card:hover .ptag { background:${C.lime}!important;color:${C.black}!important }
        .drop-row:hover { background:${hexToRgba(C.lime,0.05)}!important }
        @media(max-width:768px){
          .pgrid{grid-template-columns:1fr 1fr!important}
          .sgrid{grid-template-columns:1fr 1fr!important}
          .who-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position:'sticky',top:0,zIndex:100,background:'rgba(13,13,13,0.96)',backdropFilter:'blur(10px)',borderBottom:`1px solid ${hexToRgba(C.lime,0.12)}`,padding:'0 5%' }}>
        <div style={{ maxWidth:1280,margin:'0 auto',height:60,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center' }}>
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.shopName} style={{ height:32,objectFit:'contain',marginRight:10 }} />
            ) : (
              <>
                <span style={{ background:C.lime,color:C.black,fontFamily:anton.style.fontFamily,fontSize:20,letterSpacing:2,padding:'4px 10px' }}>{brandFirst}</span>
                {brandRest && <span style={{ fontFamily:anton.style.fontFamily,fontSize:20,letterSpacing:2,color:C.white,padding:'4px 8px' }}>{brandRest}</span>}
              </>
            )}
          </div>
          <div style={{ display:'flex',gap:28 }}>
            {navLinks.map(l => (
              <a key={l} href="#" style={{ fontSize:11,letterSpacing:2,color:hexToRgba(C.white,0.55),textDecoration:'none',fontWeight:600,transition:'color 0.2s',textTransform:'uppercase' }}
                onMouseOver={e=>(e.currentTarget.style.color=C.lime)} onMouseOut={e=>(e.currentTarget.style.color=hexToRgba(C.white,0.55))}>{l}</a>
            ))}
          </div>
          <button
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart, ${cartCount} items`}
            style={{ background:'none',border:`1px solid ${hexToRgba(C.lime,0.3)}`,color:C.lime,padding:'7px 18px',fontSize:10,letterSpacing:2,textTransform:'uppercase',cursor:'pointer',fontFamily:space.style.fontFamily,fontWeight:700 }}
          >
            CART ({cartCount})
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'94vh',background:C.black,position:'relative',overflow:'hidden',display:'flex',alignItems:'center',padding:'80px 5%' }}>
        <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',opacity:0.05 }} xmlns="http://www.w3.org/2000/svg">
          {NOISE.map((l,i) => (
            <line key={i} x1={`${l.x1}%`} y1={`${l.y}%`} x2={`${l.x2}%`} y2={`${(l.y+0.5)%100}%`} stroke={C.lime} strokeWidth="0.5" />
          ))}
        </svg>
        <div style={{ position:'absolute',top:'14%',right:'-3%',width:'42%',height:3,background:C.lime,transform:'rotate(-14deg)',opacity:0.55 }} />
        <div style={{ position:'absolute',top:'24%',right:'-6%',width:'28%',height:1,background:C.lime,transform:'rotate(-14deg)',opacity:0.25 }} />

        <div style={{ maxWidth:1280,margin:'0 auto',width:'100%',position:'relative',zIndex:2 }}>
          <p style={{ ...up(0),fontFamily:space.style.fontFamily,fontSize:11,letterSpacing:4,color:C.lime,marginBottom:16,fontWeight:700 }}>
            {content.heroEyebrow}
          </p>
          <h1 style={{ ...up(100),fontFamily:anton.style.fontFamily,fontSize:'clamp(56px,10vw,140px)',lineHeight:0.9,letterSpacing:2,marginBottom:32,color:C.white }}>
            {content.heroTitleLine1}<br />
            {content.heroTitleLine2}<br />
            <span style={{ color:C.lime }}>{content.heroTitleEmphasis}</span>
          </h1>
          <p style={{ ...up(250),fontSize:14,color:hexToRgba(C.white,0.45),maxWidth:380,lineHeight:1.8,marginBottom:40 }}>
            {content.heroDescription}
          </p>
          <div style={{ ...up(380),display:'flex',gap:12,flexWrap:'wrap' }}>
            <a href={wa ? `https://wa.me/${wa}` : '#products'} style={{ padding:'14px 36px',background:C.lime,color:C.black,textDecoration:'none',fontFamily:anton.style.fontFamily,fontSize:16,letterSpacing:2,cursor:'pointer',display:'inline-block' }}>
              {content.primaryCta.toUpperCase()}
            </a>
            <button style={{ padding:'14px 36px',background:'transparent',border:`1px solid ${hexToRgba(C.white,0.2)}`,color:C.white,fontFamily:anton.style.fontFamily,fontSize:16,letterSpacing:2,cursor:'pointer' }}>
              {content.secondaryCta.toUpperCase()}
            </button>
          </div>
        </div>
        <div style={{ position:'absolute',bottom:-20,right:'3%',fontFamily:anton.style.fontFamily,fontSize:'clamp(100px,18vw,260px)',color:hexToRgba(C.lime,0.04),lineHeight:1,userSelect:'none',pointerEvents:'none',letterSpacing:4 }}>
          {data.demo && products.length === 0 ? '04' : products.length}
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background:C.lime,overflow:'hidden',whiteSpace:'nowrap',padding:'10px 0' }}>
        <div style={{ display:'inline-block',animation:'ticker 20s linear infinite' }}>
          {[1,2].map(k => <span key={k} style={{ fontFamily:anton.style.fontFamily,fontSize:14,color:C.black,letterSpacing:3 }}>{ticker}</span>)}
        </div>
      </div>

      {/* PRODUCTS */}
      <section id="products" style={{ padding:'80px 5%',background:C.black }}>
        <div style={{ maxWidth:1280,margin:'0 auto' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:36 }}>
            <div>
              <p style={{ fontSize:10,letterSpacing:4,color:C.lime,marginBottom:8,fontWeight:700 }}>{content.productsEyebrow.toUpperCase()}</p>
              <h2 style={{ fontFamily:anton.style.fontFamily,fontSize:'clamp(32px,5vw,64px)',letterSpacing:2,color:C.white,lineHeight:1 }}>{content.productsTitle.toUpperCase()}</h2>
            </div>
            <a href="#" style={{ fontSize:10,letterSpacing:3,color:C.lime,textDecoration:'none',textTransform:'uppercase',fontWeight:700 }}>{content.productsCta.toUpperCase()}</a>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12 }} className="pgrid">
            {products.slice(0,6).map((p,i) => (
              <div key={i} className="prod-card" style={{ border:`1px solid ${hexToRgba(C.white,0.08)}`,cursor:'pointer',transition:'border-color 0.2s',position:'relative' }}>
                <div style={{ aspectRatio:'3/4',overflow:'hidden',background:C.gray,position:'relative' }}>
                  {p.imageUrl
                    ? <img className="pimg" src={p.imageUrl} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.4s',filter:'grayscale(15%)' }} />
                    : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}><span style={{ fontFamily:anton.style.fontFamily,fontSize:48,color:hexToRgba(C.white,0.08) }}>{brandFirst}</span></div>
                  }
                  <div className="ptag" style={{ position:'absolute',top:10,left:10,background:hexToRgba(C.white,0.1),color:C.white,padding:'3px 8px',fontSize:9,letterSpacing:2,textTransform:'uppercase',fontWeight:700,transition:'background 0.2s,color 0.2s' }}>
                    {p.category || 'DROP'}
                  </div>
                  {!p.available && (
                    <div style={{ position:'absolute',top:10,right:10,background:'rgba(239,68,68,0.85)',color:'#fff',padding:'3px 8px',fontSize:9,letterSpacing:2,textTransform:'uppercase',fontWeight:700 }}>
                      SOLD OUT
                    </div>
                  )}
                </div>
                <div style={{ padding:'14px 16px',borderTop:`1px solid ${hexToRgba(C.white,0.08)}` }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:p.available?10:0 }}>
                    <div>
                      <p style={{ fontFamily:space.style.fontFamily,fontWeight:600,fontSize:13,color:C.white,textTransform:'uppercase',letterSpacing:1,marginBottom:2 }}>{p.name}</p>
                      {p.discountPrice != null && (
                        <p style={{ fontSize:10,color:hexToRgba(C.white,0.4),textDecoration:'line-through' }}>{formatPrice(p.price)}</p>
                      )}
                    </div>
                    <p style={{ fontFamily:anton.style.fontFamily,fontSize:16,color:C.lime,letterSpacing:1 }}>
                      {formatPrice(p.discountPrice ?? p.price)}
                    </p>
                  </div>
                  {p.available && (
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(p.id); }}
                      aria-label={`Add ${p.name} to cart`}
                      style={{ width:'100%',padding:'9px 0',background:C.lime,color:C.black,border:'none',fontFamily:anton.style.fontFamily,fontSize:12,letterSpacing:2,cursor:'pointer' }}
                    >
                      ADD TO CART
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DROPS */}
      <section style={{ padding:'80px 5%',background:C.gray }}>
        <div style={{ maxWidth:1280,margin:'0 auto' }}>
          <div style={{ marginBottom:40 }}>
            <p style={{ fontSize:10,letterSpacing:4,color:C.lime,marginBottom:8,fontWeight:700 }}>UPCOMING</p>
            <h2 style={{ fontFamily:anton.style.fontFamily,fontSize:'clamp(32px,5vw,64px)',color:C.white,letterSpacing:2 }}>NEXT DROPS</h2>
          </div>
          <div style={{ borderTop:`1px solid ${hexToRgba(C.white,0.1)}` }}>
            {drops.map((d,i) => (
              <div key={i} className="drop-row" style={{ display:'flex',alignItems:'center',padding:'20px 16px',borderBottom:`1px solid ${hexToRgba(C.white,0.08)}`,cursor:'pointer',transition:'background 0.2s',gap:24 }}>
                <span style={{ fontFamily:anton.style.fontFamily,fontSize:14,color:hexToRgba(C.white,0.4),letterSpacing:2,minWidth:80 }}>{d.date}</span>
                <span style={{ fontFamily:anton.style.fontFamily,fontSize:22,color:C.white,letterSpacing:2,flex:1 }}>{d.name}</span>
                <span style={{ fontSize:10,letterSpacing:2,color:d.hot?C.lime:hexToRgba(C.white,0.5),fontWeight:700,border:`1px solid ${d.hot?C.lime:hexToRgba(C.white,0.2)}`,padding:'4px 12px' }}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={{ background:C.lime,padding:'40px 5%' }}>
        <div style={{ maxWidth:1280,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)' }} className="sgrid">
          {stats.map((s,i) => (
            <div key={i} style={{ textAlign:'center',padding:'20px 0',borderRight:i<3?`1px solid ${hexToRgba(C.black,0.2)}`:'none' }}>
              <div style={{ fontFamily:anton.style.fontFamily,fontSize:36,color:C.black,letterSpacing:2 }}>{s.v}</div>
              <div style={{ fontSize:9,letterSpacing:3,color:hexToRgba(C.black,0.6),fontWeight:700 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* WHO WE ARE */}
      <section style={{ padding:'100px 5%',background:C.black }}>
        <div style={{ maxWidth:1280,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center' }} className="who-grid">
          <h2 style={{ fontFamily:anton.style.fontFamily,fontSize:'clamp(48px,8vw,100px)',color:C.white,lineHeight:0.9,letterSpacing:2 }}>
            WHO<br />WE<br /><span style={{ color:C.lime }}>ARE</span>
          </h2>
          <div>
            <p style={{ fontSize:14,color:hexToRgba(C.white,0.55),lineHeight:2,marginBottom:24 }}>
              {content.brandStoryQuote}
            </p>
            {store.openingHours && (
              <p style={{ fontSize:12,color:C.lime,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginTop:20 }}>{store.openingHours}</p>
            )}
            <div style={{ marginTop:32,width:60,height:3,background:C.lime }} />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}

      {testimonials.length > 0 && (<>
      <section style={{ padding:'80px 5%',background:C.gray }}>
        <div style={{ maxWidth:800,margin:'0 auto',textAlign:'center' }}>
          <p style={{ fontSize:10,letterSpacing:4,color:C.lime,marginBottom:32,fontWeight:700 }}>{content.testimonialsTitle.toUpperCase()}</p>
          <div style={{ position:'relative',minHeight:120 }}>
            {testimonials.map((t,i) => (
              <div key={i} style={{ position:'absolute',inset:0,opacity:tIdx===i?1:0,transition:'opacity 0.6s',pointerEvents:tIdx===i?'auto':'none' }}>
                <p style={{ fontFamily:space.style.fontFamily,fontSize:'clamp(16px,2vw,22px)',color:C.white,lineHeight:1.6,marginBottom:20,fontStyle:'italic' }}>"{t.quote}"</p>
                <p style={{ fontSize:10,letterSpacing:3,color:C.lime,fontWeight:700 }}>{t.name}</p>
              </div>
            ))}
          </div>
          <div style={{ display:'flex',justifyContent:'center',gap:8,marginTop:48 }}>
            {testimonials.map((_,i) => (
              <button key={i} onClick={()=>setTIdx(i)} style={{ width:tIdx===i?28:8,height:4,borderRadius:2,background:tIdx===i?C.lime:hexToRgba(C.white,0.2),border:'none',cursor:'pointer',transition:'all 0.3s' }} />
            ))}
          </div>
        </div>
      </section>

      </>)}

      {/* NEWSLETTER: no subscription backend exists, so the form renders in the showcase only */}

      {data.demo && (<>
      <section style={{ background:C.black,padding:'80px 5%',borderTop:`3px solid ${C.lime}` }}>
        <div style={{ maxWidth:640,margin:'0 auto' }}>
          <p style={{ fontSize:10,letterSpacing:4,color:C.lime,marginBottom:8,fontWeight:700 }}>{content.newsletterEyebrow.toUpperCase()}</p>
          <h2 style={{ fontFamily:anton.style.fontFamily,fontSize:'clamp(32px,5vw,64px)',color:C.white,letterSpacing:2,marginBottom:4 }}>{content.newsletterTitle.split(' ')[0]?.toUpperCase() ?? 'NEVER'}</h2>
          <h2 style={{ fontFamily:anton.style.fontFamily,fontSize:'clamp(32px,5vw,64px)',color:C.lime,letterSpacing:2,marginBottom:24 }}>{content.newsletterTitle.split(' ').slice(1).join(' ').toUpperCase() || 'MISS A DROP.'}</h2>
          <p style={{ fontSize:13,color:hexToRgba(C.white,0.45),marginBottom:32,lineHeight:1.8 }}>{content.newsletterBody}</p>
          <div style={{ display:'flex',border:`1px solid ${hexToRgba(C.lime,0.4)}` }}>
            <input type="email" placeholder={content.newsletterPlaceholder} style={{ flex:1,padding:'14px 20px',background:'transparent',border:'none',outline:'none',color:C.white,fontSize:13,fontFamily:space.style.fontFamily }} />
            <button style={{ padding:'14px 24px',background:C.lime,color:C.black,border:'none',cursor:'pointer',fontFamily:anton.style.fontFamily,fontSize:14,letterSpacing:2 }}>{content.newsletterButton.toUpperCase()}</button>
          </div>
        </div>
      </section>

      </>)}

      {/* FOOTER */}
      <footer style={{ background:'#050505',padding:'32px 5%',borderTop:`1px solid ${hexToRgba(C.lime,0.1)}` }}>
        <div style={{ maxWidth:1280,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
          <div style={{ display:'flex',alignItems:'center' }}>
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.shopName} style={{ height:24,objectFit:'contain' }} />
            ) : (
              <>
                <span style={{ background:C.lime,color:C.black,fontFamily:anton.style.fontFamily,fontSize:14,letterSpacing:2,padding:'2px 6px' }}>{brandFirst}</span>
                {brandRest && <span style={{ fontFamily:anton.style.fontFamily,fontSize:14,letterSpacing:2,color:C.white,padding:'2px 4px' }}>{brandRest}</span>}
              </>
            )}
          </div>
          <p style={{ fontSize:10,color:hexToRgba(C.white,0.25),letterSpacing:1 }}>© 2025 {store.shopName || 'VOID DRIP'}. ALL RIGHTS RESERVED.</p>
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
