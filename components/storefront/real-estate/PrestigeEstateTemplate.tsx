'use client';

import { useState } from 'react';
import { Spectral, Raleway } from 'next/font/google';
import type { StorefrontData } from '@/lib/types/store';
import { Phone, MapPin, ChevronRight, X, BedDouble, Bath, Maximize2 } from 'lucide-react';

const spectral = Spectral({ subsets: ['latin'], weight: ['200', '300', '400', '500', '600', '700', '800'], style: ['normal', 'italic'] });
const raleway = Raleway({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

const CATEGORIES = ['All', 'Penthouses', 'Villas', 'Apartments', 'Lofts', 'Studios'];

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: (i * 5.7 + 3) % 98,
  y: (i * 4.3 + 8) % 85,
  size: 1 + (i % 2),
  delay: (i * 0.55) % 6,
  duration: 5 + (i % 5),
}));

function formatPrice(p: number): string {
  if (p >= 1_000_000) return `$${(p / 1_000_000).toFixed(1)}M`;
  if (p >= 1_000) return `$${(p / 1_000).toFixed(0)}K`;
  return `$${p.toLocaleString()}`;
}

function parseSpecs(desc: string): { specs: string[]; detail: string } {
  const parts = desc.split(' · ');
  const specParts = parts.slice(0, 3);
  const detail = parts.slice(3).join('. ');
  return { specs: specParts, detail };
}

function SpecIcon({ label }: { label: string }) {
  const l = label.toLowerCase();
  if (l.includes('bed')) return <BedDouble size={12} />;
  if (l.includes('bath')) return <Bath size={12} />;
  return <Maximize2 size={12} />;
}

export default function PrestigeEstateTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;
  const [activeCategory, setActiveCategory] = useState('All');
  const [selected, setSelected] = useState<(typeof products)[0] | null>(null);

  const filtered =
    activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory);

  const waMsg = selected
    ? `Hello, I am interested in ${selected.name} (${formatPrice(selected.discountPrice ?? selected.price)}). Please share more details and available viewing times.`
    : `Hello, I would like to enquire about your available properties.`;
  const waHref = `https://wa.me/${(store.whatsappNumber ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(waMsg)}`;

  return (
    <>
      <style>{`
        @keyframes shimmerSweep {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes lineGrow {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes particlePulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.6); }
        }
        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(40px); letter-spacing: 0.4em; }
          to   { opacity: 1; transform: translateY(0); letter-spacing: 0.12em; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes goldPulse {
          0%, 100% { box-shadow: 0 4px 24px rgba(201,168,76,0.3); }
          50%       { box-shadow: 0 8px 40px rgba(201,168,76,0.55); }
        }
        @keyframes panelIn {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .pe-shimmer-text {
          background: linear-gradient(
            90deg,
            #C0CCD8 0%, #D8E4EE 20%, #F0F4F8 40%, #FFFFFF 50%,
            #F0F4F8 60%, #D8E4EE 80%, #C0CCD8 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerSweep 5s 1.5s linear infinite;
        }
        .pe-card {
          background: #0F1525;
          border: 1px solid #1E2A3C;
          border-radius: 2px;
          overflow: hidden;
          transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
          animation: cardReveal 0.6s ease both;
          cursor: pointer;
        }
        .pe-card:hover {
          border-color: #C9A84C;
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(201,168,76,0.14);
        }
        .pe-tab {
          background: transparent;
          border: none;
          border-bottom: 1px solid transparent;
          color: #4A5A70;
          padding: 8px 0;
          margin: 0 12px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          letter-spacing: 0.12em;
        }
        .pe-tab:first-child { margin-left: 0; }
        .pe-tab.active {
          color: #C9A84C;
          border-bottom-color: #C9A84C;
        }
        .pe-tab:hover:not(.active) { color: #A8B8D0; }
        .pe-cta {
          background: transparent;
          border: 1px solid #C9A84C;
          color: #C9A84C;
          padding: 11px 28px;
          cursor: pointer;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          transition: background 0.22s, color 0.22s, box-shadow 0.22s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .pe-cta:hover {
          background: #C9A84C;
          color: #080B18;
          animation: goldPulse 1.5s ease infinite;
        }
        .pe-card:hover .pe-img-overlay {
          opacity: 1;
        }
        .pe-img-overlay {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
      `}</style>

      <div style={{ background: '#080B18', minHeight: '100vh', fontFamily: raleway.style.fontFamily, position: 'relative', overflowX: 'hidden', color: '#E0E8F0' }}>

        {/* Floating platinum particles */}
        {PARTICLES.map((p) => (
          <div key={p.id} style={{
            position: 'fixed',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: '#A8B8D0',
            animation: `particlePulse ${p.duration}s ${p.delay}s ease-in-out infinite`,
            pointerEvents: 'none',
            zIndex: 0,
          }} />
        ))}

        {/* Deep gradient overlays */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '50vh', background: 'radial-gradient(ellipse at 50% -20%, #1A2540, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '40vh', background: 'radial-gradient(ellipse at 50% 120%, #0F1A30, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,11,24,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1A2438' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Platinum monogram */}
              <div style={{ width: 40, height: 40, border: '1px solid #C9A84C55', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 3, left: 3, right: 3, bottom: 3, border: '1px solid #C9A84C33' }} />
                <span className={spectral.className} style={{ color: '#C9A84C', fontSize: 18, fontStyle: 'italic', fontWeight: 300 }}>
                  {store.shopName.charAt(0)}
                </span>
              </div>
              <div>
                <div className={spectral.className} style={{ fontSize: 17, color: '#D8E4EE', fontStyle: 'italic', letterSpacing: '0.06em', lineHeight: 1.1 }}>
                  {store.shopName}
                </div>
                <div className={raleway.className} style={{ fontSize: 9, color: '#4A5A70', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                  Prestige Real Estate
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={13} color="#4A5A70" />
                <span className={raleway.className} style={{ fontSize: 12, color: '#4A5A70', letterSpacing: '0.06em' }}>{tc?.openingHours || store.openingHours}</span>
              </div>
              <a href={waHref} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1px solid #C9A84C', color: '#C9A84C', padding: '8px 20px', cursor: 'pointer', letterSpacing: '0.12em', fontSize: 12, textDecoration: 'none', fontFamily: raleway.style.fontFamily, fontWeight: 600, transition: 'background 0.2s, color 0.2s' }}>
                <Phone size={13} />
                ENQUIRE
              </a>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section style={{ position: 'relative', padding: '100px 32px 80px', textAlign: 'center', zIndex: 1 }}>
          {/* Thin decorative line top */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 32, animation: 'fadeUp 0.6s 0.1s ease both', opacity: 0 }}>
            <div style={{ flex: 1, maxWidth: 120, height: 1, background: 'linear-gradient(to right, transparent, #C9A84C)' }} />
            <div style={{ width: 5, height: 5, border: '1px solid #C9A84C', transform: 'rotate(45deg)' }} />
            <div style={{ flex: 1, maxWidth: 120, height: 1, background: 'linear-gradient(to left, transparent, #C9A84C)' }} />
          </div>

          <p className={raleway.className} style={{ fontSize: 11, color: '#4A5A70', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 24, animation: 'fadeUp 0.6s 0.2s ease both', opacity: 0 }}>
            Extraordinary Properties · Curated Listings
          </p>

          <h1
            className={`${spectral.className} pe-shimmer-text`}
            style={{
              fontSize: 'clamp(44px, 9vw, 90px)',
              fontStyle: 'italic',
              fontWeight: 300,
              lineHeight: 1.0,
              letterSpacing: '0.12em',
              animation: 'heroReveal 1s 0.3s ease both',
              opacity: 0,
              marginBottom: 10,
            }}
          >
            {store.shopName}
          </h1>

          {/* Animated gold underline */}
          <div style={{ position: 'relative', height: 1, maxWidth: 280, margin: '26px auto 26px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, #C9A84C 40%, #E8D090 60%, #C9A84C, transparent)', animation: 'lineGrow 1.2s 1s ease both', width: 0 }} />
          </div>

          <p className={raleway.className} style={{ color: '#3A4A5C', fontSize: 16, maxWidth: 520, margin: '0 auto 44px', lineHeight: 1.75, fontWeight: 400, animation: 'fadeUp 0.6s 0.6s ease both', opacity: 0 }}>
            {tc?.heroDescription || store.description}
          </p>

          <a href={waHref} target="_blank" rel="noopener noreferrer" className={`pe-cta ${raleway.className}`} style={{ fontSize: 12, textDecoration: 'none', animation: 'fadeUp 0.6s 0.76s ease both, goldPulse 3s 3s ease infinite', opacity: 0 }}>
            Schedule a Private Consultation <ChevronRight size={14} />
          </a>
        </section>

        {/* Category filter */}
        <div style={{ borderTop: '1px solid #1A2438', borderBottom: '1px solid #1A2438', position: 'sticky', top: 72, zIndex: 40, background: 'rgba(8,11,24,0.96)', backdropFilter: 'blur(16px)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`pe-tab${activeCategory === cat ? ' active' : ''} ${raleway.className}`}
                style={{ fontSize: 11, fontWeight: 600 }}
                onClick={() => setActiveCategory(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 24, borderLeft: '1px solid #1A2438', whiteSpace: 'nowrap' }}>
              <span className={raleway.className} style={{ fontSize: 11, color: '#3A4A5C', letterSpacing: '0.12em' }}>
                {filtered.length} PROPERT{filtered.length !== 1 ? 'IES' : 'Y'}
              </span>
            </div>
          </div>
        </div>

        {/* Listings */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 32px 100px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 2 }}>
            {filtered.map((p, i) => {
              const { specs, detail } = parseSpecs(p.description);
              const price = formatPrice(p.discountPrice ?? p.price);
              const isAvailable = p.stock > 0;
              return (
                <div
                  key={p.id}
                  className="pe-card"
                  style={{ animationDelay: `${i * 0.08}s` }}
                  onClick={() => setSelected(p)}
                >
                  {/* Image */}
                  <div style={{ height: 280, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0F1A2E, #162030)' }}>
                    {p.imageUrl && (
                      <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease', display: 'block' }} />
                    )}
                    {/* Dark gradient overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,11,24,0.9) 0%, rgba(8,11,24,0.3) 50%, transparent 100%)' }} />

                    {/* Status badge */}
                    <div style={{ position: 'absolute', top: 16, left: 16 }}>
                      <span className={raleway.className} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', color: isAvailable ? '#6EE7B7' : '#FCD34D', background: isAvailable ? 'rgba(6,78,59,0.8)' : 'rgba(92,47,0,0.8)', padding: '4px 12px', border: `1px solid ${isAvailable ? '#6EE7B766' : '#FCD34D66'}` }}>
                        {isAvailable ? 'AVAILABLE' : 'UNDER OFFER'}
                      </span>
                    </div>

                    {/* Category badge */}
                    <div style={{ position: 'absolute', top: 16, right: 16 }}>
                      <span className={raleway.className} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.16em', color: '#A8B8D0', background: 'rgba(8,11,24,0.7)', padding: '4px 10px', border: '1px solid #1E2A3C' }}>
                        {p.category?.toUpperCase()}
                      </span>
                    </div>

                    {/* Bottom: price + name overlay */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 24px' }}>
                      <div className={spectral.className} style={{ fontSize: 30, fontStyle: 'italic', fontWeight: 300, color: '#C9A84C', letterSpacing: '0.02em', lineHeight: 1 }}>
                        {price}
                      </div>
                      <div className={spectral.className} style={{ fontSize: 18, fontStyle: 'italic', color: '#E0E8F0', marginTop: 4 }}>
                        {p.name}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ padding: '20px 24px 24px' }}>
                    {/* Specs row */}
                    {specs.length > 0 && (
                      <div style={{ display: 'flex', gap: 20, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #1A2438' }}>
                        {specs.map((s, si) => (
                          <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <SpecIcon label={s} />
                            <span className={raleway.className} style={{ fontSize: 12, color: '#A8B8D0', letterSpacing: '0.06em' }}>{s.trim()}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Detail text */}
                    <p className={raleway.className} style={{ fontSize: 13, color: '#3A4A5C', lineHeight: 1.7, marginBottom: 20, fontWeight: 400 }}>
                      {detail || p.description}
                    </p>

                    <button
                      className={`pe-cta ${raleway.className}`}
                      style={{ fontSize: 11, width: '100%', justifyContent: 'center' }}
                      onClick={(e) => { e.stopPropagation(); setSelected(p); }}
                    >
                      Schedule Viewing <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Property detail panel */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={() => setSelected(null)} />
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 480, background: '#080B18', borderLeft: '1px solid #1A2438', animation: 'panelIn 0.35s ease', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              {/* Image */}
              <div style={{ height: 320, position: 'relative', flexShrink: 0 }}>
                {selected.imageUrl && <img src={selected.imageUrl} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,11,24,0.95) 0%, transparent 60%)' }} />
                <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(8,11,24,0.8)', border: '1px solid #1A2438', color: '#4A5A70', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 28px' }}>
                  <div className={spectral.className} style={{ fontSize: 34, fontStyle: 'italic', fontWeight: 300, color: '#C9A84C' }}>{formatPrice(selected.discountPrice ?? selected.price)}</div>
                  <div className={spectral.className} style={{ fontSize: 20, fontStyle: 'italic', color: '#E0E8F0' }}>{selected.name}</div>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '28px', flex: 1 }}>
                {/* Gold rule */}
                <div style={{ height: 1, background: 'linear-gradient(90deg, #C9A84C, transparent)', marginBottom: 24 }} />

                {(() => {
                  const { specs, detail } = parseSpecs(selected.description);
                  return (
                    <>
                      {specs.length > 0 && (
                        <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
                          {specs.map((s, si) => (
                            <div key={si} style={{ textAlign: 'center' }}>
                              <div className={spectral.className} style={{ fontSize: 20, fontStyle: 'italic', color: '#C9A84C', marginBottom: 2 }}>{s.trim().split(' ')[0]}</div>
                              <div className={raleway.className} style={{ fontSize: 10, color: '#3A4A5C', letterSpacing: '0.16em', textTransform: 'uppercase' }}>{s.trim().split(' ').slice(1).join(' ')}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className={raleway.className} style={{ fontSize: 14, color: '#3A4A5C', lineHeight: 1.8, marginBottom: 28 }}>
                        {detail || selected.description}
                      </p>
                    </>
                  );
                })()}

                {/* Info rows */}
                <div style={{ borderTop: '1px solid #1A2438', paddingTop: 20, marginBottom: 28 }}>
                  {[
                    { label: 'Property Type', value: selected.category },
                    { label: 'Availability', value: selected.stock > 0 ? 'Available Now' : 'Under Offer' },
                    { label: 'Delivery', value: store.deliveryInfo },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #0F1525' }}>
                      <span className={raleway.className} style={{ fontSize: 11, color: '#3A4A5C', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</span>
                      <span className={raleway.className} style={{ fontSize: 12, color: '#A8B8D0' }}>{value}</span>
                    </div>
                  ))}
                </div>

                <a href={`https://wa.me/${(store.whatsappNumber ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, I am interested in ${selected.name} (${formatPrice(selected.discountPrice ?? selected.price)}). Please share more details and available viewing times.`)}`} target="_blank" rel="noopener noreferrer" className={`pe-cta ${raleway.className}`} style={{ display: 'flex', justifyContent: 'center', fontSize: 12, textDecoration: 'none', width: '100%' }}>
                  Book a Private Viewing <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
