'use client';

import { useEffect, useRef, useState } from 'react';
import { Playfair_Display, Nunito_Sans } from 'next/font/google';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import type { ClothingTemplateContent } from '@/lib/types/clothing-template-content';
import { parseNavLinks, parseSocialLinks } from '@/lib/utils/clothing-content';
import CheckoutDrawer from '@/components/storefront/restaurant-default/CheckoutDrawer';
import { readCartDraft, clearCartDraft } from '@/lib/utils/cart-draft';

interface CartItem {
  product: PublicProduct;
  qty: number;
}

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400','500','600','700'], style: ['normal','italic'] });
const nunito = Nunito_Sans({ subsets: ['latin'], weight: ['300','400','500','600','700'] });

const CREAM = '#FBF8F5';
const BLUSH = '#F2DDD5';
const DARK = '#1A0F0A';
const MID = '#6B4F44';
const LIGHT = '#FAF1EC';
const DEFAULT_ROSE = '#9B7060';

const BLOBS = Array.from({ length: 6 }, (_, i) => ({
  x: (i * 47 + 13) % 88, y: (i * 37 + 7) % 82,
  s: 60 + (i * 23) % 80, op: 0.06 + ((i * 11) % 5) * 0.025,
}));

const CATEGORIES_DEFAULT = ['All Pieces', 'Dresses', 'Tops', 'Accessories', 'New In'];

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1529139574466-a303027614a4?auto=format&fit=crop&w=700&q=80';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', SAR: 'SR ', AED: 'AED ', KWD: 'KD ', QAR: 'QR ', BHD: 'BD ',
};

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

export default function PetalStudioTemplate({
  data,
  content,
}: {
  data: StorefrontData;
  content: ClothingTemplateContent;
}) {
  const { store, products } = data;
  const wa = (store.whatsappNumber ?? '').replace(/\D/g, '');

  const rose = store.primaryColor || DEFAULT_ROSE;
  const C = { cream: CREAM, blush: BLUSH, rose, dark: DARK, mid: MID, light: LIGHT };

  const currencySymbol = CURRENCY_SYMBOLS[store.currencyCode] ?? (store.currencySuffix ? store.currencySuffix + ' ' : '$');
  const formatPrice = (price: number) =>
    `${currencySymbol}${price % 1 === 0 ? price : price.toFixed(2)}`;

  const ticker = store.deliveryInfo || `  ${content.tickerText}  •  `;

  const navLinks = parseNavLinks(content.navLinks);

  // Unique categories from products for filter tabs
  const uniqueCategories = ['All Pieces', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const categories = uniqueCategories.length > 1 ? uniqueCategories : CATEGORIES_DEFAULT;

  const looks = content.lookbookItems
    .filter(l => l.imageUrl)
    .slice(0, 3)
    .map(l => ({ name: l.name, img: l.imageUrl }));
  if (looks.length < 3) {
    products
      .filter(p => p.imageUrl)
      .slice(0, 3 - looks.length)
      .forEach(p => looks.push({ name: p.name, img: p.imageUrl! }));
  }

  const heroImg =
    content.heroImageUrl ||
    store.logoUrl ||
    products.find(p => p.imageUrl)?.imageUrl ||
    FALLBACK_HERO;

  const testimonials = content.testimonials;
  const socialLinks = parseSocialLinks(content.footerSocialLinks);

  const [heroVis, setHeroVis] = useState(false);
  const [activeCat, setActiveCat] = useState(0);
  const [tIdx, setTIdx] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Filter products by selected category
  const filteredProducts = activeCat === 0 || categories[activeCat] === 'All Pieces'
    ? products
    : products.filter(p => p.category === categories[activeCat]);

  useEffect(() => { const t = setTimeout(() => setHeroVis(true), 100); return () => clearTimeout(t); }, []);
  useEffect(() => { const t = setInterval(() => setTIdx(i => (i + 1) % testimonials.length), 5000); return () => clearInterval(t); }, [testimonials.length]);

  // Restore a cart saved before a guest was redirected to /customer/login (see CheckoutDrawer).
  useEffect(() => {
    const draft = readCartDraft(store.slug);
    if (!draft || draft.length === 0) return;
    const restored: CartItem[] = [];
    for (const d of draft) {
      const product = products.find(p => String(p.id) === d.productId);
      if (product) restored.push({ product, qty: d.qty });
    }
    if (restored.length > 0) {
      setCart(restored);
      setCartOpen(true);
    }
    clearCartDraft(store.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.slug]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  function addToCart(id: number) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === id);
      if (existing) return prev.map(item => item.product.id === id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { product, qty: 1 }];
    });
  }

  function removeFromCart(id: number) {
    setCart(prev => prev.filter(item => item.product.id !== id));
  }

  function changeQty(id: number, delta: number) {
    setCart(prev =>
      prev.map(item => item.product.id === id ? { ...item, qty: item.qty + delta } : item)
        .filter(item => item.qty > 0));
  }

  const up = (v: boolean, d = 0): React.CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.7s ease ${d}ms, transform 0.7s ease ${d}ms`,
  });

  return (
    <div style={{ background: C.cream, color: C.dark, fontFamily: nunito.style.fontFamily, overflowX: 'hidden' }}>
      <style>{`
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes floatBlob { 0%,100%{transform:translateY(0)scale(1)} 50%{transform:translateY(-12px)scale(1.03)} }
        .prod-card:hover { transform:translateY(-5px)!important; box-shadow:0 20px 50px ${hexToRgba(C.rose,0.15)}!important; border-color:${C.rose}!important }
        .prod-card:hover .pimg { transform:scale(1.06) }
        .look-card:hover .lover { opacity:1!important }
        .look-card:hover img { transform:scale(1.08)!important }
        @media(max-width:768px){
          .hsplit{flex-direction:column!important}
          .pgrid{grid-template-columns:1fr 1fr!important}
          .lgrid{grid-template-columns:1fr!important}
          .tgrid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position:'sticky',top:0,zIndex:100,background:'rgba(251,248,245,0.96)',backdropFilter:'blur(8px)',borderBottom:`1px solid ${hexToRgba(C.rose,0.15)}`,padding:'0 5%' }}>
        <div style={{ maxWidth:1280,margin:'0 auto',height:64,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.shopName} style={{ height:36,objectFit:'contain' }} />
          ) : (
            <span style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:22,color:C.dark,letterSpacing:0.5 }}>
              {store.shopName || 'Petal Studio'}
            </span>
          )}
          <div style={{ display:'flex',gap:28 }}>
            {navLinks.map(l => (
              <a key={l} href="#" style={{ fontSize:13,color:C.mid,textDecoration:'none',transition:'color 0.2s' }}
                onMouseOver={e=>(e.currentTarget.style.color=C.rose)} onMouseOut={e=>(e.currentTarget.style.color=C.mid)}>{l}</a>
            ))}
          </div>
          <button
            onClick={() => setCartOpen(true)}
            aria-label={`Open bag, ${cartCount} items`}
            style={{ position:'relative',width:36,height:36,background:C.rose,border:'none',cursor:'pointer',color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center' }}
          >
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span style={{ position:'absolute',top:-4,right:-4,minWidth:16,height:16,padding:'0 3px',borderRadius:8,background:C.dark,color:'#fff',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center' }}>
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'88vh',padding:'60px 5%',position:'relative',overflow:'hidden',display:'flex',alignItems:'center' }}>
        {BLOBS.map((b,i) => (
          <div key={i} style={{ position:'absolute',left:`${b.x}%`,top:`${b.y}%`,width:b.s,height:b.s,borderRadius:'50%',background:C.blush,opacity:b.op,animation:`floatBlob ${5+i*0.8}s ease-in-out infinite`,animationDelay:`${i*0.5}s` }} />
        ))}
        <div style={{ maxWidth:1280,margin:'0 auto',width:'100%',display:'flex',alignItems:'center',gap:60,position:'relative',zIndex:2 }} className="hsplit">
          <div style={{ flex:1 }}>
            <div style={{ ...up(heroVis,0),display:'flex',alignItems:'center',gap:10,marginBottom:20 }}>
              <div style={{ width:24,height:1.5,background:C.rose }} />
              <span style={{ fontSize:11,letterSpacing:3,textTransform:'uppercase',color:C.rose,fontWeight:600 }}>{content.heroEyebrow}</span>
            </div>
            <h1 style={{ ...up(heroVis,150),fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:'clamp(36px,5.5vw,72px)',lineHeight:1.15,marginBottom:24 }}>
              {content.heroTitleLine1}<br />{content.heroTitleLine2}<br /><em style={{ color:C.rose }}>{content.heroTitleEmphasis}</em>
            </h1>
            <p style={{ ...up(heroVis,300),fontSize:15,color:C.mid,lineHeight:1.85,maxWidth:380,marginBottom:40 }}>
              {store.description || content.heroDescription}
            </p>
            <div style={{ ...up(heroVis,450),display:'flex',gap:12,flexWrap:'wrap' }}>
              <a href={wa ? `https://wa.me/${wa}` : '#'} style={{ padding:'14px 32px',background:C.rose,color:'#fff',textDecoration:'none',borderRadius:40,fontSize:13,fontWeight:600,cursor:'pointer',letterSpacing:0.5 }}>
                {content.primaryCta}
              </a>
              <a href="#products" style={{ padding:'14px 32px',border:`1.5px solid ${C.rose}`,color:C.rose,textDecoration:'none',borderRadius:40,fontSize:13,fontWeight:600,cursor:'pointer' }}>
                {content.secondaryCta}
              </a>
            </div>
          </div>
          <div style={{ ...up(heroVis,200),flex:'0 0 auto',width:'clamp(280px,35vw,480px)',position:'relative' }}>
            <div style={{ position:'absolute',inset:-12,border:`2px solid ${C.blush}`,borderRadius:32 }} />
            <div style={{ position:'relative',zIndex:1,borderRadius:24,overflow:'hidden',aspectRatio:'3/4' }}>
              <img src={heroImg} alt={store.shopName} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
            </div>
            <div style={{ position:'absolute',bottom:20,left:-24,background:C.cream,borderRadius:16,padding:'10px 16px',boxShadow:`0 8px 32px ${hexToRgba(C.rose,0.2)}`,zIndex:2 }}>
              <p style={{ fontSize:10,color:C.rose,fontWeight:700,letterSpacing:1,marginBottom:2 }}>{content.heroBadgeLabel}</p>
              <p style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:13,color:C.dark }}>
                {content.heroBadgeSubtitle || store.shopName || 'Spring 2025'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background:C.blush,overflow:'hidden',whiteSpace:'nowrap',padding:'10px 0',borderTop:`1px solid ${hexToRgba(C.rose,0.15)}`,borderBottom:`1px solid ${hexToRgba(C.rose,0.15)}` }}>
        <div style={{ display:'inline-block',animation:'ticker 22s linear infinite' }}>
          {[1,2].map(k => <span key={k} style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:13,color:C.rose }}>{ticker}</span>)}
        </div>
      </div>

      {/* PRODUCTS */}
      <section id="products" style={{ padding:'90px 5%',background:C.cream }}>
        <div style={{ maxWidth:1280,margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:40 }}>
            <p style={{ fontSize:11,letterSpacing:3,textTransform:'uppercase',color:C.rose,marginBottom:10,fontWeight:600 }}>{content.productsEyebrow}</p>
            <h2 style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:'clamp(28px,4vw,48px)',marginBottom:28 }}>{content.productsTitle}</h2>
            <div style={{ display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap' }}>
              {categories.slice(0, 6).map((cat,i) => (
                <button key={i} onClick={()=>setActiveCat(i)} style={{ padding:'8px 20px',borderRadius:24,border:`1.5px solid ${activeCat===i?C.rose:hexToRgba(C.rose,0.25)}`,background:activeCat===i?C.rose:'transparent',color:activeCat===i?'#fff':C.mid,fontSize:12,cursor:'pointer',transition:'all 0.22s',fontFamily:nunito.style.fontFamily,fontWeight:600 }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20 }} className="pgrid">
            {(filteredProducts.length > 0 ? filteredProducts : products).slice(0,6).map((p,i) => (
              <div key={i} className="prod-card" style={{ background:'#fff',borderRadius:16,overflow:'hidden',border:`1.5px solid ${hexToRgba(C.rose,0.1)}`,cursor:'pointer',transition:'transform 0.3s,box-shadow 0.3s,border-color 0.3s' }}>
                <div style={{ aspectRatio:'3/4',overflow:'hidden',background:C.light }}>
                  {p.imageUrl
                    ? <img className="pimg" src={p.imageUrl} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.5s' }} />
                    : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}><span style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:32,color:hexToRgba(C.rose,0.3) }}>{store.shopName || 'Petal'}</span></div>
                  }
                </div>
                <div style={{ padding:'16px 20px' }}>
                  <p style={{ fontSize:11,color:C.rose,fontWeight:600,letterSpacing:1,textTransform:'uppercase',marginBottom:4 }}>{p.category || 'New In'}</p>
                  <p style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:16,marginBottom:8 }}>{p.name}</p>
                  {p.description && (
                    <p style={{ fontSize:12,color:C.mid,marginBottom:8,lineHeight:1.5 }}>{p.description.slice(0, 60)}{p.description.length > 60 ? '…' : ''}</p>
                  )}
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
                    <div>
                      <p style={{ fontSize:15,fontWeight:700,color:C.rose }}>{formatPrice(p.discountPrice ?? p.price)}</p>
                      {p.discountPrice != null && (
                        <p style={{ fontSize:11,color:C.mid,textDecoration:'line-through' }}>{formatPrice(p.price)}</p>
                      )}
                    </div>
                    {!p.available && (
                      <span style={{ fontSize:9,letterSpacing:1,color:'#ef4444',border:'1px solid #ef4444',padding:'2px 6px',textTransform:'uppercase' }}>Sold Out</span>
                    )}
                  </div>
                  {p.available && (
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(p.id); }}
                      aria-label={`Add ${p.name} to bag`}
                      style={{ width:'100%',padding:'10px 0',borderRadius:24,border:`1.5px solid ${C.rose}`,background:'transparent',color:C.rose,fontSize:12,fontWeight:600,letterSpacing:0.5,cursor:'pointer',fontFamily:nunito.style.fontFamily,transition:'background 0.2s,color 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.background = C.rose; e.currentTarget.style.color = '#fff'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.rose; }}
                    >
                      Add to Bag
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center',marginTop:40 }}>
            <a href="#" style={{ display:'inline-block',padding:'13px 40px',border:`1.5px solid ${C.rose}`,color:C.rose,textDecoration:'none',borderRadius:40,fontSize:13,fontWeight:600,letterSpacing:0.5 }}>{content.productsCta}</a>
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section style={{ padding:'90px 5%',background:C.blush }}>
        <div style={{ maxWidth:800,margin:'0 auto',textAlign:'center' }}>
          <div style={{ width:40,height:1.5,background:C.rose,margin:'0 auto 24px' }} />
          <blockquote style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:'clamp(22px,3.5vw,38px)',color:C.dark,lineHeight:1.45,marginBottom:24,fontWeight:400 }}>
            "{store.description || content.brandStoryQuote}"
          </blockquote>
          <p style={{ fontSize:13,color:C.mid,letterSpacing:2,textTransform:'uppercase',fontWeight:600 }}>— {store.shopName || 'Petal Studio'}</p>
        </div>
      </section>

      {/* LOOKBOOK */}
      <section style={{ padding:'90px 5%',background:C.cream }}>
        <div style={{ maxWidth:1280,margin:'0 auto' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:40 }}>
            <div>
              <p style={{ fontSize:11,letterSpacing:3,textTransform:'uppercase',color:C.rose,marginBottom:10,fontWeight:600 }}>{content.lookbookEyebrow}</p>
              <h2 style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:'clamp(28px,4vw,44px)' }}>{content.lookbookTitle}</h2>
            </div>
            <a href="#" style={{ fontSize:12,color:C.rose,textDecoration:'none',fontWeight:600,borderBottom:`1px solid ${C.rose}`,paddingBottom:2 }}>{content.lookbookLinkLabel}</a>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16 }} className="lgrid">
            {looks.map((l,i) => (
              <div key={i} className="look-card" style={{ position:'relative',borderRadius:20,overflow:'hidden',cursor:'pointer',aspectRatio:'3/4' }}>
                <img src={l.img} alt={l.name} style={{ width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.6s' }} />
                <div className="lover" style={{ position:'absolute',inset:0,background:'rgba(26,15,10,0.45)',opacity:0,transition:'opacity 0.4s',display:'flex',alignItems:'flex-end',padding:24 }}>
                  <div>
                    <p style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:20,color:'#fff',marginBottom:8 }}>{l.name}</p>
                    <span style={{ fontSize:11,letterSpacing:2,color:'rgba(255,255,255,0.7)',textTransform:'uppercase',fontWeight:600 }}>Shop the Look →</span>
                  </div>
                </div>
                <div style={{ position:'absolute',bottom:16,left:16 }}>
                  <p style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:18,color:'#fff',textShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>{l.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding:'90px 5%',background:C.light }}>
        <div style={{ maxWidth:1280,margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:48 }}>
            <p style={{ fontSize:11,letterSpacing:3,textTransform:'uppercase',color:C.rose,marginBottom:10,fontWeight:600 }}>{content.testimonialsEyebrow}</p>
            <h2 style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:'clamp(28px,4vw,44px)' }}>{content.testimonialsTitle}</h2>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20 }} className="tgrid">
            {testimonials.map((t,i) => (
              <div key={i} style={{ background:C.cream,borderRadius:20,padding:'28px',border:`1.5px solid ${hexToRgba(C.rose,0.12)}` }}>
                <p style={{ color:C.rose,fontSize:16,marginBottom:12 }}>★★★★★</p>
                <p style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:15,lineHeight:1.7,marginBottom:16 }}>"{t.quote}"</p>
                <p style={{ fontSize:12,fontWeight:700,color:C.mid,letterSpacing:0.5 }}>— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ background:C.blush,padding:'80px 5%' }}>
        <div style={{ maxWidth:600,margin:'0 auto',textAlign:'center' }}>
          <p style={{ fontSize:11,letterSpacing:3,textTransform:'uppercase',color:C.rose,marginBottom:12,fontWeight:600 }}>{content.newsletterEyebrow}</p>
          <h2 style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:'clamp(28px,4vw,44px)',marginBottom:12 }}>{content.newsletterTitle}</h2>
          <p style={{ fontSize:14,color:C.mid,marginBottom:32,lineHeight:1.8 }}>{content.newsletterBody}</p>
          <div style={{ display:'flex',borderRadius:40,overflow:'hidden',border:`1.5px solid ${hexToRgba(C.rose,0.3)}`,background:'#fff' }}>
            <input type="email" placeholder={content.newsletterPlaceholder} style={{ flex:1,padding:'14px 24px',background:'transparent',border:'none',outline:'none',color:C.dark,fontSize:13,fontFamily:nunito.style.fontFamily }} />
            <button style={{ padding:'14px 28px',background:C.rose,color:'#fff',border:'none',cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:nunito.style.fontFamily,borderRadius:40 }}>{content.newsletterButton}</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:C.dark,padding:'48px 5%' }}>
        <div style={{ maxWidth:1280,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16 }}>
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.shopName} style={{ height:28,objectFit:'contain',filter:'brightness(0) invert(1)' }} />
          ) : (
            <span style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:20,color:C.blush }}>{store.shopName || 'Petal Studio'}</span>
          )}
          <div style={{ display:'flex',gap:24 }}>
            {socialLinks.map(s => (
              <a key={s} href="#" style={{ fontSize:11,color:hexToRgba(C.blush,0.5),textDecoration:'none',letterSpacing:1 }}>{s}</a>
            ))}
          </div>
          <p style={{ fontSize:11,color:hexToRgba(C.blush,0.3) }}>© 2025 {store.shopName || 'Petal Studio'}.</p>
        </div>
      </footer>

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
