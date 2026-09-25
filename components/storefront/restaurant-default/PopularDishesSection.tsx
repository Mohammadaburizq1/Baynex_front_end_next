'use client';
import { formatMoney } from '@/lib/utils';

import { useRef } from 'react';
import type { PublicProduct } from '@/lib/types/store';
import type { CuisinePreset } from '@/lib/data/cuisine-presets';
import DishCard from './DishCard';

interface DishVM {
  id: number;
  name: string;
  description: string;
  priceLabel: string;
  imageUrl: string;
  /** Can't be bought right now (switched off, or sold out). */
  soldOut?: boolean;
}

interface PopularDishesSectionProps {
  products: PublicProduct[];
  currencySuffix: string;
  preset: CuisinePreset;
  onAddProduct?: (id: number) => void;
}

function buildDishes(products: PublicProduct[], currencySuffix: string): DishVM[] {
  const out: DishVM[] = [];

  for (const p of products) {
    if (out.length >= 6) break;
    if (!p.imageUrl?.trim()) continue;
    const effectivePrice = p.discountPrice ?? p.price;
    out.push({
      id: p.id,
      name: p.name,
      description: p.description || p.category,
      priceLabel: formatMoney(effectivePrice, currencySuffix),
      imageUrl: p.imageUrl.trim(),
      soldOut: !p.available || p.stock <= 0,
    });
  }

  return out;
}

export default function PopularDishesSection({
  products,
  currencySuffix,
  preset,
  onAddProduct,
}: PopularDishesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dishes = buildDishes(products, currencySuffix);
  // Only the store's own products with photos: never padded with sample dishes or ratings.
  if (dishes.length === 0) return null;
  const primary = preset.primary;
  const heading = '#0D102B';
  const bgAlt = preset.backgroundAlt;

  function nudge(delta: number) {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  }

  return (
    <section
      style={{ backgroundColor: bgAlt }}
      className="px-4 sm:px-6 lg:px-8 pt-2 pb-12"
    >
      <div className="mx-auto max-w-[1180px]">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            style={{ color: heading, fontWeight: 900, fontSize: 28, lineHeight: 1.15, margin: 0 }}
            className="font-sans"
          >
            Popular{' '}
            <span style={{ color: primary, borderBottom: `3px solid ${primary}` }}>
              Dishes
            </span>
          </h2>

          {/* Nav arrows */}
          <div className="flex items-center gap-2">
            <NavArrow direction="left" heading={heading} onClick={() => nudge(-280)} />
            <NavArrow direction="right" heading={heading} onClick={() => nudge(280)} />
          </div>
        </div>

        {/* Mobile (<md): horizontal scroll rail */}
        <div
          ref={scrollRef}
          className="flex md:hidden gap-4 overflow-x-auto scrollbar-hide pb-1"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {dishes.map((d, i) => (
            <div key={i} style={{ minWidth: 260, scrollSnapAlign: 'start' }}>
              <DishCard
                name={d.name}
                description={d.description}
                priceLabel={d.priceLabel}
                imageUrl={d.imageUrl}
                preset={preset}
                disabled={!d.id || d.soldOut}
                onAdd={() => { if (d.id && !d.soldOut) onAddProduct?.(d.id); }}
              />
            </div>
          ))}
        </div>

        {/* Tablet (md–lg): 2-col grid */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-5">
          {dishes.map((d, i) => (
            <DishCard
              key={i}
              name={d.name}
              description={d.description}
              priceLabel={d.priceLabel}
              imageUrl={d.imageUrl}
              preset={preset}
              disabled={!d.id || d.soldOut}
              onAdd={() => { if (d.id && !d.soldOut) onAddProduct?.(d.id); }}
            />
          ))}
        </div>

        {/* Desktop (lg+): 3–4-col grid */}
        <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {dishes.map((d, i) => (
            <DishCard
              key={i}
              name={d.name}
              description={d.description}
              priceLabel={d.priceLabel}
              imageUrl={d.imageUrl}
              preset={preset}
              disabled={!d.id || d.soldOut}
              onAdd={() => { if (d.id && !d.soldOut) onAddProduct?.(d.id); }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function NavArrow({
  direction,
  heading,
  onClick,
}: {
  direction: 'left' | 'right';
  heading: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#fff',
        borderRadius: '50%',
        border: 'none',
        width: 42,
        height: 42,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className="transition-opacity hover:opacity-80"
      aria-label={direction === 'left' ? 'Scroll left' : 'Scroll right'}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={heading}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === 'left' ? (
          <polyline points="15 18 9 12 15 6" />
        ) : (
          <polyline points="9 18 15 12 9 6" />
        )}
      </svg>
    </button>
  );
}
