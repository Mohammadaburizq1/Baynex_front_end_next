'use client';

import { useEffect, useRef, useState } from 'react';
import { Bodoni_Moda, Outfit } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';

const bodoni = Bodoni_Moda({ subsets: ['latin'], weight: ['400','500','700','900'], style: ['normal','italic'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['300','400','500','600'] });

const C = { dark: '#0A0A0A', ivory: '#F2EDE4', gold: '#C4A55A', warm: '#1A1510', muted: '#8A857C' };

const DOTS = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 53 + 9) % 96, y: (i * 37 + 17) % 93,
  s: 1 + (i * 11) % 5, op: 0.08 + ((i * 7) % 5) * 0.04,
}));

const TICKER = '  THE NEW COLLECTION IS HERE  •  AUTUMN/WINTER 2025  •  FREE WORLDWIDE SHIPPING  •  ';

const COLLECTIONS = [
  { name: 'Autumn Noir', sub: '24 pieces', img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Blanc',       sub: '18 pieces', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Velvet Hour', sub: '12 pieces', img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80' },
];

const FEATURES = [
  { icon: '✦', title: 'Free Returns',  desc: '30-day hassle-free' },
  { icon: '◆', title: 'Hand-Crafted',  desc: 'Atelier made in France' },
  { icon: '●', title: 'Sustainable',   desc: 'Carbon neutral shipping' },
  { icon: '◈', title: 'Bespoke',       desc: 'Custom fitting available' },
];

const STATS = [{ v: 12, suf: '', l: 'Years of Craft' }, { v: 48, suf: '', l: 'Ateliers' }, { v: 2000, suf: '+', l: 'Pieces Crafted' }];

const TESTIMONIALS = [
  { q: 'Every piece tells a story. Maison Noir is simply timeless.', n: 'Isabelle M.', r: 'Paris' },
  { q: 'The quality is unmatched. I wear them to every occasion.', n: 'Priya K.', r: 'London' },
  { q: 'Editorial perfection — worth every single centime.', n: 'Yuki T.', r: 'Tokyo' },
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

export default function FashionEditorialTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const wa = (store.whatsappNumber ?? '').replace(/\D/g, '');

  const [heroVis, setHeroVis] = useState(false);
  const [tIdx, setTIdx] = useState(0);
  const [statsRef, statsVis] = useInView();
  const c0 = useCountUp(STATS[0].v, 1400, statsVis);
  const c1 = useCountUp(STATS[1].v, 1700, statsVis);
  const c2 = useCountUp(STATS[2].v, 2000, statsVis);
  const statVals = [c0, c1, c2];

  useEffect(() => { const t = setTimeout(() => setHeroVis(true), 100); return () => clearTimeout(t); }, []);
  useEffect(() => { const t = setInterval(() => setTIdx(i => (i + 1) % TESTIMONIALS.length), 4500); return () => clearInterval(t); }, []);

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
            <div style={{ width:32,height:32,borderRadius:'50%',background:C.dark,display:'flex',alignItems:'center',justifyContent:'center' }}>
              <span style={{ fontSize:12,color:C.gold,fontFamily:bodoni.style.fontFamily,fontStyle:'italic' }}>M</span>
            </div>
            <span style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:18,letterSpacing:1 }}>
              {store.shopName || 'Maison Noir'}
            </span>
          </div>
          <div style={{ display:'flex',gap:32 }}>
            {['Collections','Lookbook','About','Atelier'].map(l => (
              <a key={l} href="#" style={{ fontSize:12,letterSpacing:2,textTransform:'uppercase',color:C.dark,textDecoration:'none',opacity:0.65,transition:'opacity 0.2s' }}
                onMouseOver={e=>(e.currentTarget.style.opacity='1')} onMouseOut={e=>(e.currentTarget.style.opacity='0.65')}>{l}</a>
            ))}
          </div>
          <button style={{ width:36,height:36,background:'none',border:'none',cursor:'pointer',color:C.dark }}>
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
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
              <span style={{ fontSize:11,letterSpacing:4,textTransform:'uppercase',color:C.gold }}>Autumn / Winter 2025</span>
            </div>
            <h1 style={{ ...up(heroVis,150),fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:'clamp(42px,6vw,84px)',fontWeight:700,color:C.ivory,lineHeight:1.08,marginBottom:28 }}>
              The Art of<br />Wearing<br /><em style={{ color:C.gold }}>Nothing but</em><br />Excellence
            </h1>
            <p style={{ ...up(heroVis,300),color:'rgba(242,237,228,0.55)',fontSize:15,lineHeight:1.8,maxWidth:360,marginBottom:40 }}>
              Each piece is a collaboration between tradition and modernity — crafted for those who understand the language of cloth.
            </p>
            <div style={{ ...up(heroVis,450),display:'flex',gap:16,flexWrap:'wrap' }}>
              <a href={wa ? `https://wa.me/${wa}` : '#'} style={{ display:'inline-flex',alignItems:'center',gap:10,padding:'14px 32px',background:C.gold,color:C.dark,textDecoration:'none',fontSize:11,letterSpacing:3,textTransform:'uppercase',fontWeight:600,cursor:'pointer' }}>
                Shop Collection
              </a>
              <a href="#collections" style={{ display:'inline-flex',alignItems:'center',gap:10,padding:'14px 32px',border:`1px solid rgba(242,237,228,0.25)`,color:C.ivory,textDecoration:'none',fontSize:11,letterSpacing:3,textTransform:'uppercase',cursor:'pointer' }}>
                View Lookbook
              </a>
            </div>
          </div>
          <div style={{ ...up(heroVis,200),flex:'0 0 auto',width:'clamp(280px,38vw,520px)',position:'relative' }} className="himgw">
            <div style={{ aspectRatio:'3/4',overflow:'hidden' }}>
              <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80" alt="" style={{ width:'100%',height:'100%',objectFit:'cover',filter:'brightness(0.9)' }} />
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
          {[1,2].map(k => <span key={k} style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:14,color:C.dark,letterSpacing:1 }}>{TICKER}</span>)}
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
            {COLLECTIONS.map((c,i) => (
              <div key={i} className="coll-card" style={{ gridColumn: i===0?'1':'2',gridRow: i===0?'1/3':String(i),position:'relative',overflow:'hidden',cursor:'pointer',aspectRatio: i===0?'3/4':'4/3' }}>
                <img src={c.img} alt={c.name} style={{ width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.6s ease' }} />
                <div className="coll-over" style={{ position:'absolute',inset:0,background:'rgba(10,10,10,0.55)',opacity:0,transition:'opacity 0.4s',display:'flex',alignItems:'flex-end',padding:24 }}>
                  <div>
                    <p style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:22,color:C.ivory,marginBottom:4 }}>{c.name}</p>
                    <p style={{ fontSize:11,color:C.gold,letterSpacing:2 }}>{c.sub} →</p>
                  </div>
                </div>
                <div style={{ position:'absolute',bottom:16,left:16 }}>
                  <p style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize: i===0?26:18,color:C.ivory,textShadow:'0 2px 12px rgba(0,0,0,0.5)' }}>{c.name}</p>
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
            <div key={i} className="feat-box" style={{ padding:'32px 24px',borderRight: i<3?`1px solid rgba(255,255,255,0.08)`:'none',cursor:'default',transition:'background 0.25s,color 0.25s',color:C.ivory }}>
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
                    <img className="prod-img" src={p.imageUrl ?? ''} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.5s ease' }} />
                  ) : (
                    <div className="prod-img" style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}>
                      <span style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:36,color:C.muted }}>M</span>
                    </div>
                  )}
                </div>
                <div style={{ padding:'16px 20px' }}>
                  <p style={{ fontSize:11,letterSpacing:1,textTransform:'uppercase',color:C.muted,marginBottom:6 }}>{p.category || 'Ready-to-Wear'}</p>
                  <p style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:17,marginBottom:8 }}>{p.name}</p>
                  <p style={{ fontSize:15,fontWeight:600,color:C.gold }}>${p.price}</p>
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
            {STATS.map((s,i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:52,color:C.gold,lineHeight:1 }}>
                  {statVals[i]}{s.suf}
                </div>
                <div style={{ fontSize:12,letterSpacing:2,textTransform:'uppercase',color:'rgba(242,237,228,0.5)',marginTop:8 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding:'100px 5%',background:C.ivory }}>
        <div style={{ maxWidth:1000,margin:'0 auto',textAlign:'center' }}>
          <p style={{ fontSize:11,letterSpacing:3,textTransform:'uppercase',color:C.gold,marginBottom:12 }}>Client Stories</p>
          <h2 style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:'clamp(28px,4vw,44px)',marginBottom:56 }}>What They Say</h2>
          <div style={{ position:'relative',minHeight:160 }}>
            {TESTIMONIALS.map((t,i) => (
              <div key={i} style={{ position:'absolute',inset:0,opacity:tIdx===i?1:0,transition:'opacity 0.7s',pointerEvents:tIdx===i?'auto':'none' }}>
                <div style={{ width:40,height:1,background:C.gold,margin:'0 auto 28px' }} />
                <p style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:'clamp(18px,2.5vw,26px)',lineHeight:1.5,marginBottom:24 }}>"{t.q}"</p>
                <p style={{ fontSize:12,letterSpacing:2,textTransform:'uppercase',color:C.muted }}>{t.n} — {t.r}</p>
              </div>
            ))}
          </div>
          <div style={{ display:'flex',justifyContent:'center',gap:8,marginTop:48 }}>
            {TESTIMONIALS.map((_,i) => (
              <button key={i} onClick={()=>setTIdx(i)} style={{ width:tIdx===i?28:8,height:8,borderRadius:4,background:tIdx===i?C.gold:'rgba(10,10,10,0.15)',border:'none',cursor:'pointer',transition:'all 0.3s' }} />
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ background:C.dark,padding:'80px 5%' }}>
        <div style={{ maxWidth:640,margin:'0 auto',textAlign:'center' }}>
          <div style={{ width:40,height:1,background:C.gold,margin:'0 auto 24px' }} />
          <h2 style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:'clamp(28px,4vw,44px)',color:C.ivory,marginBottom:12 }}>Join the Inner Circle</h2>
          <p style={{ color:'rgba(242,237,228,0.5)',fontSize:14,marginBottom:36,lineHeight:1.7 }}>Early access to new collections and exclusive atelier events.</p>
          <div style={{ display:'flex',border:`1px solid rgba(196,165,90,0.5)` }}>
            <input type="email" placeholder="Your email address" style={{ flex:1,padding:'14px 20px',background:'transparent',border:'none',outline:'none',color:C.ivory,fontSize:13,fontFamily:outfit.style.fontFamily }} />
            <button style={{ padding:'14px 28px',background:C.gold,color:C.dark,border:'none',cursor:'pointer',fontSize:11,letterSpacing:2,textTransform:'uppercase',fontWeight:700 }}>Subscribe</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'#050505',padding:'48px 5%',borderTop:`1px solid rgba(196,165,90,0.15)` }}>
        <div style={{ maxWidth:1280,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16 }}>
          <span style={{ fontFamily:bodoni.style.fontFamily,fontStyle:'italic',fontSize:18,color:C.gold }}>{store.shopName || 'Maison Noir'}</span>
          <p style={{ fontSize:11,color:'rgba(242,237,228,0.3)',letterSpacing:1 }}>© 2025 {store.shopName || 'Maison Noir'}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
