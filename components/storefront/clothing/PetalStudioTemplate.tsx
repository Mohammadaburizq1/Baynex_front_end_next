'use client';

import { useEffect, useRef, useState } from 'react';
import { Playfair_Display, Nunito_Sans } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400','500','600','700'], style: ['normal','italic'] });
const nunito = Nunito_Sans({ subsets: ['latin'], weight: ['300','400','500','600','700'] });

const C = { cream: '#FBF8F5', blush: '#F2DDD5', rose: '#9B7060', dark: '#1A0F0A', mid: '#6B4F44', light: '#FAF1EC' };

const BLOBS = Array.from({ length: 6 }, (_, i) => ({
  x: (i * 47 + 13) % 88, y: (i * 37 + 7) % 82,
  s: 60 + (i * 23) % 80, op: 0.06 + ((i * 11) % 5) * 0.025,
}));

const TICKER = '  Free shipping on orders above $120  •  New arrivals every Thursday  •  Easy 30-day returns  •  ';

const CATEGORIES = ['All Pieces', 'Dresses', 'Tops', 'Accessories', 'New In'];

const LOOKS = [
  { name: 'The Sunday Edit', img: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Garden Party',    img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80' },
  { name: 'Golden Hour',     img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80' },
];

const TESTIMONIALS = [
  { q: 'Petal Studio is everything I needed — beautiful, effortless, and timeless.', n: 'Sophie L.' },
  { q: 'The dress arrived beautifully packaged and fits perfectly. Stunning quality.', n: 'Amara T.' },
  { q: 'Finally found a brand that gets it. Every piece makes me feel like myself.', n: 'Clara B.' },
];

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

export default function PetalStudioTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const wa = (store.whatsappNumber ?? '').replace(/\D/g, '');

  const [heroVis, setHeroVis] = useState(false);
  const [activeCat, setActiveCat] = useState(0);
  const [tIdx, setTIdx] = useState(0);

  useEffect(() => { const t = setTimeout(() => setHeroVis(true), 100); return () => clearTimeout(t); }, []);
  useEffect(() => { const t = setInterval(() => setTIdx(i => (i + 1) % TESTIMONIALS.length), 5000); return () => clearInterval(t); }, []);

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
        .prod-card:hover { transform:translateY(-5px)!important; box-shadow:0 20px 50px rgba(155,112,96,0.15)!important; border-color:${C.rose}!important }
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
      <nav style={{ position:'sticky',top:0,zIndex:100,background:'rgba(251,248,245,0.96)',backdropFilter:'blur(8px)',borderBottom:`1px solid rgba(155,112,96,0.15)`,padding:'0 5%' }}>
        <div style={{ maxWidth:1280,margin:'0 auto',height:64,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <span style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:22,color:C.dark,letterSpacing:0.5 }}>
            {store.shopName || 'Petal Studio'}
          </span>
          <div style={{ display:'flex',gap:28 }}>
            {['New In','Dresses','Tops','Accessories','About'].map(l => (
              <a key={l} href="#" style={{ fontSize:13,color:C.mid,textDecoration:'none',transition:'color 0.2s' }}
                onMouseOver={e=>(e.currentTarget.style.color=C.rose)} onMouseOut={e=>(e.currentTarget.style.color=C.mid)}>{l}</a>
            ))}
          </div>
          <button style={{ width:36,height:36,background:C.rose,border:'none',cursor:'pointer',color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
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
              <span style={{ fontSize:11,letterSpacing:3,textTransform:'uppercase',color:C.rose,fontWeight:600 }}>Spring Collection 2025</span>
            </div>
            <h1 style={{ ...up(heroVis,150),fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:'clamp(36px,5.5vw,72px)',lineHeight:1.15,marginBottom:24 }}>
              Dressed for the<br />moments you'll<br /><em style={{ color:C.rose }}>remember forever</em>
            </h1>
            <p style={{ ...up(heroVis,300),fontSize:15,color:C.mid,lineHeight:1.85,maxWidth:380,marginBottom:40 }}>
              {store.description || 'Thoughtfully designed women\'s clothing for those who move through life with intention. Each piece crafted to be worn again and again.'}
            </p>
            <div style={{ ...up(heroVis,450),display:'flex',gap:12,flexWrap:'wrap' }}>
              <a href={wa ? `https://wa.me/${wa}` : '#'} style={{ padding:'14px 32px',background:C.rose,color:'#fff',textDecoration:'none',borderRadius:40,fontSize:13,fontWeight:600,cursor:'pointer',letterSpacing:0.5 }}>
                Shop Now
              </a>
              <a href="#products" style={{ padding:'14px 32px',border:`1.5px solid ${C.rose}`,color:C.rose,textDecoration:'none',borderRadius:40,fontSize:13,fontWeight:600,cursor:'pointer' }}>
                New Arrivals
              </a>
            </div>
          </div>
          <div style={{ ...up(heroVis,200),flex:'0 0 auto',width:'clamp(280px,35vw,480px)',position:'relative' }}>
            <div style={{ position:'absolute',inset:-12,border:`2px solid ${C.blush}`,borderRadius:32 }} />
            <div style={{ position:'relative',zIndex:1,borderRadius:24,overflow:'hidden',aspectRatio:'3/4' }}>
              <img src="https://images.unsplash.com/photo-1529139574466-a303027614a4?auto=format&fit=crop&w=700&q=80" alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
            </div>
            <div style={{ position:'absolute',bottom:20,left:-24,background:C.cream,borderRadius:16,padding:'10px 16px',boxShadow:'0 8px 32px rgba(155,112,96,0.2)',zIndex:2 }}>
              <p style={{ fontSize:10,color:C.rose,fontWeight:700,letterSpacing:1,marginBottom:2 }}>NEW IN</p>
              <p style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:13,color:C.dark }}>Spring 2025</p>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background:C.blush,overflow:'hidden',whiteSpace:'nowrap',padding:'10px 0',borderTop:`1px solid rgba(155,112,96,0.15)`,borderBottom:`1px solid rgba(155,112,96,0.15)` }}>
        <div style={{ display:'inline-block',animation:'ticker 22s linear infinite' }}>
          {[1,2].map(k => <span key={k} style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:13,color:C.rose }}>{TICKER}</span>)}
        </div>
      </div>

      {/* PRODUCTS */}
      <section id="products" style={{ padding:'90px 5%',background:C.cream }}>
        <div style={{ maxWidth:1280,margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:40 }}>
            <p style={{ fontSize:11,letterSpacing:3,textTransform:'uppercase',color:C.rose,marginBottom:10,fontWeight:600 }}>New Arrivals</p>
            <h2 style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:'clamp(28px,4vw,48px)',marginBottom:28 }}>The Collection</h2>
            <div style={{ display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap' }}>
              {CATEGORIES.map((c,i) => (
                <button key={i} onClick={()=>setActiveCat(i)} style={{ padding:'8px 20px',borderRadius:24,border:`1.5px solid ${activeCat===i?C.rose:'rgba(155,112,96,0.25)'}`,background:activeCat===i?C.rose:'transparent',color:activeCat===i?'#fff':C.mid,fontSize:12,cursor:'pointer',transition:'all 0.22s',fontFamily:nunito.style.fontFamily,fontWeight:600 }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20 }} className="pgrid">
            {products.slice(0,6).map((p,i) => (
              <div key={i} className="prod-card" style={{ background:'#fff',borderRadius:16,overflow:'hidden',border:`1.5px solid rgba(155,112,96,0.1)`,cursor:'pointer',transition:'transform 0.3s,box-shadow 0.3s,border-color 0.3s' }}>
                <div style={{ aspectRatio:'3/4',overflow:'hidden',background:C.light }}>
                  {p.imageUrl
                    ? <img className="pimg" src={p.imageUrl ?? ''} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.5s' }} />
                    : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}><span style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:32,color:'rgba(155,112,96,0.3)' }}>Petal</span></div>
                  }
                </div>
                <div style={{ padding:'16px 20px' }}>
                  <p style={{ fontSize:11,color:C.rose,fontWeight:600,letterSpacing:1,textTransform:'uppercase',marginBottom:4 }}>{p.category || 'Dress'}</p>
                  <p style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:16,marginBottom:8 }}>{p.name}</p>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                    <p style={{ fontSize:15,fontWeight:700,color:C.rose }}>${p.price}</p>
                    <div style={{ display:'flex',gap:4 }}>
                      {['XS','S','M','L'].map(s => <span key={s} style={{ fontSize:8,color:C.mid,border:`1px solid rgba(155,112,96,0.2)`,borderRadius:3,padding:'1px 4px' }}>{s}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center',marginTop:40 }}>
            <a href="#" style={{ display:'inline-block',padding:'13px 40px',border:`1.5px solid ${C.rose}`,color:C.rose,textDecoration:'none',borderRadius:40,fontSize:13,fontWeight:600,letterSpacing:0.5 }}>View All Pieces</a>
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section style={{ padding:'90px 5%',background:C.blush }}>
        <div style={{ maxWidth:800,margin:'0 auto',textAlign:'center' }}>
          <div style={{ width:40,height:1.5,background:C.rose,margin:'0 auto 24px' }} />
          <blockquote style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:'clamp(22px,3.5vw,38px)',color:C.dark,lineHeight:1.45,marginBottom:24,fontWeight:400 }}>
            "Every woman deserves clothing that feels as good as it looks — made with care, worn with joy."
          </blockquote>
          <p style={{ fontSize:13,color:C.mid,letterSpacing:2,textTransform:'uppercase',fontWeight:600 }}>— {store.shopName || 'Petal Studio'}</p>
        </div>
      </section>

      {/* LOOKBOOK */}
      <section style={{ padding:'90px 5%',background:C.cream }}>
        <div style={{ maxWidth:1280,margin:'0 auto' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:40 }}>
            <div>
              <p style={{ fontSize:11,letterSpacing:3,textTransform:'uppercase',color:C.rose,marginBottom:10,fontWeight:600 }}>Style Inspiration</p>
              <h2 style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:'clamp(28px,4vw,44px)' }}>Shop the Look</h2>
            </div>
            <a href="#" style={{ fontSize:12,color:C.rose,textDecoration:'none',fontWeight:600,borderBottom:`1px solid ${C.rose}`,paddingBottom:2 }}>View All →</a>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16 }} className="lgrid">
            {LOOKS.map((l,i) => (
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
            <p style={{ fontSize:11,letterSpacing:3,textTransform:'uppercase',color:C.rose,marginBottom:10,fontWeight:600 }}>Love Notes</p>
            <h2 style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:'clamp(28px,4vw,44px)' }}>Our Community</h2>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20 }} className="tgrid">
            {TESTIMONIALS.map((t,i) => (
              <div key={i} style={{ background:C.cream,borderRadius:20,padding:'28px',border:`1.5px solid rgba(155,112,96,0.12)` }}>
                <p style={{ color:C.rose,fontSize:16,marginBottom:12 }}>★★★★★</p>
                <p style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:15,lineHeight:1.7,marginBottom:16 }}>"{t.q}"</p>
                <p style={{ fontSize:12,fontWeight:700,color:C.mid,letterSpacing:0.5 }}>— {t.n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ background:C.blush,padding:'80px 5%' }}>
        <div style={{ maxWidth:600,margin:'0 auto',textAlign:'center' }}>
          <p style={{ fontSize:11,letterSpacing:3,textTransform:'uppercase',color:C.rose,marginBottom:12,fontWeight:600 }}>Stay Connected</p>
          <h2 style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:'clamp(28px,4vw,44px)',marginBottom:12 }}>Always First</h2>
          <p style={{ fontSize:14,color:C.mid,marginBottom:32,lineHeight:1.8 }}>Be the first to know about new arrivals, exclusive offers, and styling tips.</p>
          <div style={{ display:'flex',borderRadius:40,overflow:'hidden',border:`1.5px solid rgba(155,112,96,0.3)`,background:'#fff' }}>
            <input type="email" placeholder="your@email.com" style={{ flex:1,padding:'14px 24px',background:'transparent',border:'none',outline:'none',color:C.dark,fontSize:13,fontFamily:nunito.style.fontFamily }} />
            <button style={{ padding:'14px 28px',background:C.rose,color:'#fff',border:'none',cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:nunito.style.fontFamily,borderRadius:40 }}>Join Us</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:C.dark,padding:'48px 5%' }}>
        <div style={{ maxWidth:1280,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16 }}>
          <span style={{ fontFamily:playfair.style.fontFamily,fontStyle:'italic',fontSize:20,color:C.blush }}>{store.shopName || 'Petal Studio'}</span>
          <div style={{ display:'flex',gap:24 }}>
            {['Instagram','Pinterest','TikTok'].map(s => (
              <a key={s} href="#" style={{ fontSize:11,color:'rgba(242,221,213,0.5)',textDecoration:'none',letterSpacing:1 }}>{s}</a>
            ))}
          </div>
          <p style={{ fontSize:11,color:'rgba(242,221,213,0.3)' }}>© 2025 {store.shopName || 'Petal Studio'}.</p>
        </div>
      </footer>
    </div>
  );
}
