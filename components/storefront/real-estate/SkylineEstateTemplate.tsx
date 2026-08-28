'use client';

import { useState, useRef, useEffect } from 'react';
import { Cinzel } from 'next/font/google';
import { Cormorant_Garamond } from 'next/font/google';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import {
  MessageCircle,
  ChevronDown,
  X,
  Bed,
  Bath,
  Maximize2,
} from 'lucide-react';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

interface SkylineEstateTemplateProps {
  data: StorefrontData;
}

function formatPrice(price: number, currencySuffix: string): string {
  const formatted =
    price >= 1_000_000
      ? `$${(price / 1_000_000).toFixed(1)}M`
      : price >= 1_000
      ? `$${(price / 1_000).toFixed(0)}K`
      : `$${price.toLocaleString()}`;
  return `${formatted} ${currencySuffix}`;
}

interface SpecChip {
  icon: React.ReactNode;
  label: string;
}

function parseSpecs(description: string): SpecChip[] {
  const chips: SpecChip[] = [];

  const bedMatch = description.match(/(\d+)\s*bed/i);
  if (bedMatch) {
    chips.push({
      icon: <Bed size={14} />,
      label: `${bedMatch[1]} Bedrooms`,
    });
  }

  const bathMatch = description.match(/(\d+)\s*bath/i);
  if (bathMatch) {
    chips.push({
      icon: <Bath size={14} />,
      label: `${bathMatch[1]} Bathrooms`,
    });
  }

  const sqmMatch = description.match(/(\d[\d,]*)\s*m[²2]/i);
  if (sqmMatch) {
    chips.push({
      icon: <Maximize2 size={14} />,
      label: `${sqmMatch[1]} m²`,
    });
  }

  return chips;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80';

export default function SkylineEstateTemplate({ data }: SkylineEstateTemplateProps) {
  const { store, products } = data;
  const tc = data.templateContent;

  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<PublicProduct | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  // Track active section on scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    function onScroll() {
      const containerTop = container!.getBoundingClientRect().top;
      const containerHeight = container!.clientHeight;
      const center = containerTop + containerHeight / 2;

      let closest = 0;
      let minDist = Infinity;

      sectionRefs.current.forEach((section, i) => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const dist = Math.abs(sectionCenter - center);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });

      setActiveIdx(closest);
    }

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  function scrollToSection(idx: number) {
    const section = sectionRefs.current[idx];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function handleRequestViewing(product: PublicProduct) {
    setSelectedProperty(product);
    setContactOpen(true);
  }

  function handleWhatsApp() {
    if (!selectedProperty) return;
    const msg = encodeURIComponent(
      `Hello, I'm interested in a private viewing for "${selectedProperty.name}" — ${formatPrice(selectedProperty.price, store.currencySuffix)}.`
    );
    if (store.whatsappNumber) {
      window.open(
        `https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}?text=${msg}`,
        '_blank'
      );
    }
  }

  return (
    <div
      className="relative"
      style={{ background: '#0B0C10', fontFamily: 'sans-serif' }}
    >
      {/* ── Agency Header (absolute, floats over first section) ── */}
      <header className="absolute top-0 z-20 w-full px-6 py-5 flex justify-between items-center pointer-events-none">
        <span
          className={`${cinzel.className} font-semibold text-xl`}
          style={{ color: '#C5A880' }}
        >
          {store.shopName}
        </span>
        <button
          className={`${cinzel.className} font-semibold text-xs px-4 py-2 cursor-pointer transition pointer-events-auto hover:bg-white/5`}
          style={{
            border: '1px solid rgba(197,168,128,0.4)',
            color: '#C5A880',
          }}
          onClick={() => {
            if (store.whatsappNumber) {
              window.open(
                `https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}`,
                '_blank'
              );
            }
          }}
        >
          Private Inquiries
        </button>
      </header>

      {/* ── Scroll Container ── */}
      <div
        ref={scrollRef}
        className="h-screen overflow-y-auto snap-y snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {products.map((product, idx) => {
          const specs = parseSpecs(product.description);
          const bgImage = product.imageUrl || FALLBACK_IMAGE;

          return (
            <section
              key={product.id}
              ref={(el) => { sectionRefs.current[idx] = el; }}
              className="min-h-screen snap-start relative overflow-hidden"
            >
              {/* Background image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bgImage}
                alt={product.name}
                className="absolute inset-0 object-cover w-full h-full"
              />

              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(11,12,16,0.3) 0%, rgba(11,12,16,0.1) 40%, rgba(11,12,16,0.8) 100%)',
                }}
              />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-12 pt-20">
                {/* FOR SALE pill */}
                <span
                  className={`${cinzel.className} text-[11px] inline-flex items-center rounded-full px-4 py-1.5 mb-3`}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(197,168,128,0.25)',
                    backdropFilter: 'blur(8px)',
                    color: '#C5A880',
                  }}
                >
                  FOR SALE
                </span>

                {/* Category */}
                <p
                  className={`${cinzel.className} font-semibold text-[12px] uppercase mb-2`}
                  style={{
                    color: 'rgba(197,168,128,0.6)',
                    letterSpacing: '3px',
                  }}
                >
                  {product.category}
                </p>

                {/* Property Name */}
                <h2
                  className={`${cinzel.className} font-semibold leading-[1.1] mb-2 text-[28px] md:text-[36px]`}
                  style={{ color: '#F5F0E8' }}
                >
                  {product.name}
                </h2>

                {/* Price */}
                <p
                  className={`${cinzel.className} font-bold text-[22px] mb-4`}
                  style={{ color: '#C5A880' }}
                >
                  {formatPrice(product.price, store.currencySuffix)}
                </p>

                {/* Description */}
                <p
                  className={`${cormorant.className} italic text-[18px] leading-[1.45] mb-5`}
                  style={{ color: 'rgba(245,240,232,0.75)' }}
                >
                  {product.description.slice(0, 120)}
                  {product.description.length > 120 ? '…' : ''}
                </p>

                {/* Spec Chips */}
                {specs.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-5">
                    {specs.map((spec, si) => (
                      <span
                        key={si}
                        className={`${cormorant.className} font-medium text-sm flex items-center gap-1.5 rounded-full px-4 py-2`}
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(197,168,128,0.2)',
                          backdropFilter: 'blur(4px)',
                          color: '#F5F0E8',
                        }}
                      >
                        {spec.icon}
                        {spec.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={() => handleRequestViewing(product)}
                  className="w-full h-14 font-jakarta font-bold text-sm uppercase tracking-widest cursor-pointer transition"
                  style={{
                    border: '2px solid #C5A880',
                    color: '#F5F0E8',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(197,168,128,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'transparent';
                  }}
                >
                  Request Private Viewing
                </button>
              </div>

              {/* Scroll hint on first section */}
              {idx === 0 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none">
                  <ChevronDown size={20} className="animate-bounce" style={{ color: '#C5A880' }} />
                  <span
                    className={`${cormorant.className} italic text-sm`}
                    style={{ color: 'rgba(197,168,128,0.7)' }}
                  >
                    Scroll to explore
                  </span>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* ── Page Indicator (fixed right side) ── */}
      {products.length > 1 && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
          {products.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to property ${i + 1}`}
              onClick={() => scrollToSection(i)}
              className="cursor-pointer transition-all duration-300 rounded-full w-1.5"
              style={{
                height: activeIdx === i ? '32px' : '12px',
                background:
                  activeIdx === i ? '#C5A880' : 'rgba(197,168,128,0.3)',
              }}
            />
          ))}
        </div>
      )}

      {/* ── Contact Modal ── */}
      {contactOpen && selectedProperty && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center backdrop-blur-sm"
          style={{ background: 'rgba(11,12,16,0.7)' }}
          onClick={() => setContactOpen(false)}
        >
          <div
            className="rounded-t-3xl md:rounded-3xl p-6 w-full max-w-md relative"
            style={{
              background: '#1F2833',
              border: '1px solid rgba(197,168,128,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setContactOpen(false)}
              className="absolute top-4 right-4 cursor-pointer transition hover:opacity-70"
              style={{ color: '#C5A880' }}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h3
              className={`${cinzel.className} font-semibold text-xl mb-1`}
              style={{ color: '#C5A880' }}
            >
              Private Viewing
            </h3>
            <p
              className={`${cormorant.className} italic text-base mb-5`}
              style={{ color: 'rgba(245,240,232,0.7)' }}
            >
              {selectedProperty.name}
            </p>

            <button
              onClick={handleWhatsApp}
              className="w-full h-12 rounded-xl text-white font-jakarta font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition"
              style={{ background: '#25D366' }}
            >
              <MessageCircle size={18} />
              WhatsApp Us
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
