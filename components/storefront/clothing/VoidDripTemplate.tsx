'use client';

import { useEffect, useRef, useState } from 'react';
import { Anton, Space_Grotesk } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';

const anton = Anton({ subsets: ['latin'], weight: ['400'] });
const space = Space_Grotesk({ subsets: ['latin'], weight: ['300','400','500','600','700'] });

const C = { black: '#0D0D0D', lime: '#D4F500', white: '#F5F5F5', gray: '#1A1A1A', mid: '#2A2A2A' };

const NOISE = Array.from({ length: 22 }, (_, i) => ({
  x1: (i * 41 + 7) % 100, x2: (i * 59 + 23) % 100,
  y: (i * 17 + 11) % 100, op: 0.03 + ((i * 7) % 5) * 0.01,
}));

const TICKER = '  NEW DROP  •  STREET CERTIFIED  •  VOID DRIP  •  EXCLUSIVE  •  LIMITED PIECES  •  ';

const DROPS = [
  { date: 'JUL 12', name: 'PHANTOM HOODIE',    status: 'COMING SOON', hot: true },
  { date: 'JUL 19', name: 'VOID CARGOS V2',    status: 'NOTIFY ME',   hot: false },
  { date: 'AUG 03', name: 'DEAD SEASON CAP',   status: 'NOTIFY ME',   hot: false },
];

const STATS = [
  { v: '04',   l: 'SEASONS' },
  { v: '48H',  l: 'DROP WINDOW' },
  { v: '10K+', l: 'PIECES MOVED' },
  { v: '100%', l: 'LIMITED' },
];

const TESTIMONIALS = [
  { q: 'Void Drip hits different. Every cop is a statement.', n: 'Marcus D.', r: 'NYC' },
  { q: 'The quality is insane for the price. Street certified.', n: 'Kenji R.', r: 'Tokyo' },
  { q: 'Copped the first drop and never looked back.', n: 'Destiny L.', r: 'London' },
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

export default function VoidDripTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const wa = (store.whatsappNumber ?? '').replace(/\D/g, '');

  const [heroVis, setHeroVis] = useState(false);
  const [tIdx, setTIdx] = useState(0);

  useEffect(() => { const t = setTimeout(() => setHeroVis(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => { const t = setInterval(() => setTIdx(i => (i + 1) % TESTIMONIALS.length), 4000); return () => clearInterval(t); }, []);

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
        .drop-row:hover { background:rgba(212,245,0,0.05)!important }
        @media(max-width:768px){
          .pgrid{grid-template-columns:1fr 1fr!important}
          .sgrid{grid-template-columns:1fr 1fr!important}
          .who-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position:'sticky',top:0,zIndex:100,background:'rgba(13,13,13,0.96)',backdropFilter:'blur(10px)',borderBottom:`1px solid rgba(212,245,0,0.12)`,padding:'0 5%' }}>
        <div style={{ maxWidth:1280,margin:'0 auto',height:60,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center' }}>
            <span style={{ background:C.lime,color:C.black,fontFamily:anton.style.fontFamily,fontSize:20,letterSpacing:2,padding:'4px 10px' }}>VOID</span>
            <span style={{ fontFamily:anton.style.fontFamily,fontSize:20,letterSpacing:2,color:C.white,padding:'4px 8px' }}>{store.shopName ? store.shopName.split(' ')[1] || 'DRIP' : 'DRIP'}</span>
          </div>
          <div style={{ display:'flex',gap:28 }}>
            {['DROPS','SHOP','COLLABS','ABOUT'].map(l => (
              <a key={l} href="#" style={{ fontSize:11,letterSpacing:2,color:'rgba(245,245,245,0.55)',textDecoration:'none',fontWeight:600,transition:'color 0.2s' }}
                onMouseOver={e=>(e.currentTarget.style.color=C.lime)} onMouseOut={e=>(e.currentTarget.style.color='rgba(245,245,245,0.55)')}>{l}</a>
            ))}
          </div>
          <button style={{ background:'none',border:`1px solid rgba(212,245,0,0.3)`,color:C.lime,padding:'7px 18px',fontSize:10,letterSpacing:2,textTransform:'uppercase',cursor:'pointer',fontFamily:space.style.fontFamily,fontWeight:700 }}>
            CART (0)
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
          <p style={{ ...up(0),fontFamily:space.style.fontFamily,fontSize:11,letterSpacing:4,color:C.lime,marginBottom:16,fontWeight:700 }}>SEASON 04 — AVAILABLE NOW</p>
          <h1 style={{ ...up(100),fontFamily:anton.style.fontFamily,fontSize:'clamp(56px,10vw,140px)',lineHeight:0.9,letterSpacing:2,marginBottom:32,color:C.white }}>
            DROP<br />THE<br /><span style={{ color:C.lime }}>MASK</span>
          </h1>
          <p style={{ ...up(250),fontSize:14,color:'rgba(245,245,245,0.45)',maxWidth:380,lineHeight:1.8,marginBottom:40 }}>
            {store.description || 'Designed for those who live outside the system. Limited pieces. No restocks. Get yours before it\'s gone.'}
          </p>
          <div style={{ ...up(380),display:'flex',gap:12,flexWrap:'wrap' }}>
            <a href={wa ? `https://wa.me/${wa}` : '#'} style={{ padding:'14px 36px',background:C.lime,color:C.black,textDecoration:'none',fontFamily:anton.style.fontFamily,fontSize:16,letterSpacing:2,cursor:'pointer',display:'inline-block' }}>
              SHOP NOW
            </a>
            <button style={{ padding:'14px 36px',background:'transparent',border:`1px solid rgba(245,245,245,0.2)`,color:C.white,fontFamily:anton.style.fontFamily,fontSize:16,letterSpacing:2,cursor:'pointer' }}>
              SEE DROPS
            </button>
          </div>
        </div>
        <div style={{ position:'absolute',bottom:-20,right:'3%',fontFamily:anton.style.fontFamily,fontSize:'clamp(100px,18vw,260px)',color:'rgba(212,245,0,0.04)',lineHeight:1,userSelect:'none',pointerEvents:'none',letterSpacing:4 }}>
          04
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background:C.lime,overflow:'hidden',whiteSpace:'nowrap',padding:'10px 0' }}>
        <div style={{ display:'inline-block',animation:'ticker 20s linear infinite' }}>
          {[1,2].map(k => <span key={k} style={{ fontFamily:anton.style.fontFamily,fontSize:14,color:C.black,letterSpacing:3 }}>{TICKER}</span>)}
        </div>
      </div>

      {/* PRODUCTS */}
      <section style={{ padding:'80px 5%',background:C.black }}>
        <div style={{ maxWidth:1280,margin:'0 auto' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:36 }}>
            <h2 style={{ fontFamily:anton.style.fontFamily,fontSize:'clamp(32px,5vw,64px)',letterSpacing:2,color:C.white,lineHeight:1 }}>THE EDIT</h2>
            <a href="#" style={{ fontSize:10,letterSpacing:3,color:C.lime,textDecoration:'none',textTransform:'uppercase',fontWeight:700 }}>ALL PIECES →</a>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12 }} className="pgrid">
            {products.slice(0,6).map((p,i) => (
              <div key={i} className="prod-card" style={{ border:`1px solid rgba(245,245,245,0.08)`,cursor:'pointer',transition:'border-color 0.2s',position:'relative' }}>
                <div style={{ aspectRatio:'3/4',overflow:'hidden',background:C.gray,position:'relative' }}>
                  {p.imageUrl
                    ? <img className="pimg" src={p.imageUrl ?? ''} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.4s',filter:'grayscale(15%)' }} />
                    : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}><span style={{ fontFamily:anton.style.fontFamily,fontSize:48,color:'rgba(245,245,245,0.08)' }}>VD</span></div>
                  }
                  <div className="ptag" style={{ position:'absolute',top:10,left:10,background:'rgba(245,245,245,0.1)',color:C.white,padding:'3px 8px',fontSize:9,letterSpacing:2,textTransform:'uppercase',fontWeight:700,transition:'background 0.2s,color 0.2s' }}>
                    {p.category || 'DROP'}
                  </div>
                </div>
                <div style={{ padding:'14px 16px',borderTop:`1px solid rgba(245,245,245,0.08)`,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <p style={{ fontFamily:space.style.fontFamily,fontWeight:600,fontSize:13,color:C.white,textTransform:'uppercase',letterSpacing:1 }}>{p.name}</p>
                  <p style={{ fontFamily:anton.style.fontFamily,fontSize:16,color:C.lime,letterSpacing:1 }}>${p.price}</p>
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
          <div style={{ borderTop:`1px solid rgba(245,245,245,0.1)` }}>
            {DROPS.map((d,i) => (
              <div key={i} className="drop-row" style={{ display:'flex',alignItems:'center',padding:'20px 16px',borderBottom:`1px solid rgba(245,245,245,0.08)`,cursor:'pointer',transition:'background 0.2s',gap:24 }}>
                <span style={{ fontFamily:anton.style.fontFamily,fontSize:14,color:'rgba(245,245,245,0.4)',letterSpacing:2,minWidth:60 }}>{d.date}</span>
                <span style={{ fontFamily:anton.style.fontFamily,fontSize:22,color:C.white,letterSpacing:2,flex:1 }}>{d.name}</span>
                <span style={{ fontSize:10,letterSpacing:2,color: d.hot?C.lime:'rgba(245,245,245,0.5)',fontWeight:700,border:`1px solid ${d.hot?C.lime:'rgba(245,245,245,0.2)'}`,padding:'4px 12px' }}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={{ background:C.lime,padding:'40px 5%' }}>
        <div style={{ maxWidth:1280,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)' }} className="sgrid">
          {STATS.map((s,i) => (
            <div key={i} style={{ textAlign:'center',padding:'20px 0',borderRight: i<3?`1px solid rgba(13,13,13,0.2)`:'none' }}>
              <div style={{ fontFamily:anton.style.fontFamily,fontSize:36,color:C.black,letterSpacing:2 }}>{s.v}</div>
              <div style={{ fontSize:9,letterSpacing:3,color:'rgba(13,13,13,0.6)',fontWeight:700 }}>{s.l}</div>
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
            <p style={{ fontSize:14,color:'rgba(245,245,245,0.55)',lineHeight:2,marginBottom:24 }}>
              {store.description || 'Built for the culture. No suits, no boardrooms — just raw design, limited drops, and a community that lives for the next piece.'}
            </p>
            <p style={{ fontSize:14,color:'rgba(245,245,245,0.55)',lineHeight:2 }}>
              Every season is a chapter. Every drop is a statement. This isn't clothing — it's identity.
            </p>
            <div style={{ marginTop:32,width:60,height:3,background:C.lime }} />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding:'80px 5%',background:C.gray }}>
        <div style={{ maxWidth:800,margin:'0 auto',textAlign:'center' }}>
          <p style={{ fontSize:10,letterSpacing:4,color:C.lime,marginBottom:32,fontWeight:700 }}>THE COMMUNITY SPEAKS</p>
          <div style={{ position:'relative',minHeight:120 }}>
            {TESTIMONIALS.map((t,i) => (
              <div key={i} style={{ position:'absolute',inset:0,opacity:tIdx===i?1:0,transition:'opacity 0.6s',pointerEvents:tIdx===i?'auto':'none' }}>
                <p style={{ fontFamily:space.style.fontFamily,fontSize:'clamp(16px,2vw,22px)',color:C.white,lineHeight:1.6,marginBottom:20,fontStyle:'italic' }}>"{t.q}"</p>
                <p style={{ fontSize:10,letterSpacing:3,color:C.lime,fontWeight:700 }}>{t.n} — {t.r}</p>
              </div>
            ))}
          </div>
          <div style={{ display:'flex',justifyContent:'center',gap:8,marginTop:48 }}>
            {TESTIMONIALS.map((_,i) => (
              <button key={i} onClick={()=>setTIdx(i)} style={{ width:tIdx===i?28:8,height:4,borderRadius:2,background:tIdx===i?C.lime:'rgba(245,245,245,0.2)',border:'none',cursor:'pointer',transition:'all 0.3s' }} />
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ background:C.black,padding:'80px 5%',borderTop:`3px solid ${C.lime}` }}>
        <div style={{ maxWidth:640,margin:'0 auto' }}>
          <h2 style={{ fontFamily:anton.style.fontFamily,fontSize:'clamp(32px,5vw,64px)',color:C.white,letterSpacing:2,marginBottom:4 }}>NEVER</h2>
          <h2 style={{ fontFamily:anton.style.fontFamily,fontSize:'clamp(32px,5vw,64px)',color:C.lime,letterSpacing:2,marginBottom:24 }}>MISS A DROP.</h2>
          <p style={{ fontSize:13,color:'rgba(245,245,245,0.45)',marginBottom:32,lineHeight:1.8 }}>Get drop alerts 24h before the public. Join 10K+ who are always first.</p>
          <div style={{ display:'flex',border:`1px solid rgba(212,245,0,0.4)` }}>
            <input type="email" placeholder="your@email.com" style={{ flex:1,padding:'14px 20px',background:'transparent',border:'none',outline:'none',color:C.white,fontSize:13,fontFamily:space.style.fontFamily }} />
            <button style={{ padding:'14px 24px',background:C.lime,color:C.black,border:'none',cursor:'pointer',fontFamily:anton.style.fontFamily,fontSize:14,letterSpacing:2 }}>LOCK IN</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'#050505',padding:'32px 5%',borderTop:`1px solid rgba(212,245,0,0.1)` }}>
        <div style={{ maxWidth:1280,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
          <div style={{ display:'flex',alignItems:'center' }}>
            <span style={{ background:C.lime,color:C.black,fontFamily:anton.style.fontFamily,fontSize:14,letterSpacing:2,padding:'2px 6px' }}>VOID</span>
            <span style={{ fontFamily:anton.style.fontFamily,fontSize:14,letterSpacing:2,color:C.white,padding:'2px 4px' }}>DRIP</span>
          </div>
          <p style={{ fontSize:10,color:'rgba(245,245,245,0.25)',letterSpacing:1 }}>© 2025 {store.shopName || 'VOID DRIP'}. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}
