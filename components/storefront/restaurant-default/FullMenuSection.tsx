'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { PublicProduct } from '@/lib/types/store';
import type { CuisinePreset } from '@/lib/data/cuisine-presets';

interface FullMenuSectionProps {
  products: PublicProduct[];
  currencySuffix: string;
  preset: CuisinePreset;
  onAddProduct?: (id: number) => void;
}

export default function FullMenuSection({
  products,
  currencySuffix,
  preset,
  onAddProduct,
}: FullMenuSectionProps) {
  const primary = preset.primary;
  const bg = preset.backgroundAlt;
  const heading = '#0D102B';
  const body = '#6B6B78';

  // Collect unique categories
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? products
    : products.filter((p) => p.category === activeCategory);

  if (products.length === 0) return null;

  return (
    <section
      style={{ backgroundColor: bg }}
      className="px-4 sm:px-6 lg:px-8 pt-8 pb-14"
    >
      <div className="mx-auto max-w-[1180px]">
        {/* Header */}
        <div className="mb-6">
          <h2
            style={{ color: heading, fontWeight: 900, fontSize: 26, margin: 0, lineHeight: 1.2 }}
            className="font-sans"
          >
            Our{' '}
            <span style={{ color: primary, borderBottom: `3px solid ${primary}` }}>
              Menu
            </span>
          </h2>
          <p style={{ color: body, fontSize: 14, marginTop: 6, marginBottom: 0 }} className="font-sans">
            Browse our full selection and add to cart
          </p>
        </div>

        {/* Category filter chips */}
        {categories.length > 2 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  backgroundColor: activeCategory === cat ? primary : `${primary}14`,
                  color: activeCategory === cat ? '#fff' : heading,
                  border: 'none',
                  borderRadius: 999,
                  padding: '7px 16px',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
                className="font-sans transition-opacity hover:opacity-90"
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Product rows */}
        <div className="flex flex-col gap-3">
          {filtered.map((product) => {
            const effectivePrice = product.discountPrice ?? product.price;
            return (
              <MenuProductRow
                key={product.id}
                product={product}
                effectivePrice={effectivePrice}
                currencySuffix={currencySuffix}
                primary={primary}
                heading={heading}
                body={body}
                onAdd={() => onAddProduct?.(product.id)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MenuProductRow({
  product,
  effectivePrice,
  currencySuffix,
  primary,
  heading,
  body,
  onAdd,
}: {
  product: PublicProduct;
  effectivePrice: number;
  currencySuffix: string;
  primary: string;
  heading: string;
  body: string;
  onAdd: () => void;
}) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        border: `1px solid ${primary}1a`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 12,
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: `${primary}18`,
          position: 'relative',
        }}
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="72px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          style={{ color: heading, fontWeight: 800, fontSize: 15, margin: 0 }}
          className="font-sans truncate"
        >
          {product.name}
        </p>
        {product.description && (
          <p
            style={{ color: body, fontSize: 12.5, margin: '3px 0 0', lineHeight: 1.4 }}
            className="font-sans line-clamp-2"
          >
            {product.description}
          </p>
        )}
        <p
          style={{ color: primary, fontWeight: 900, fontSize: 15, margin: '5px 0 0' }}
          className="font-sans"
        >
          {effectivePrice.toFixed(2)}{' '}
          <span style={{ fontSize: 12, fontWeight: 600 }}>{currencySuffix}</span>
          {product.discountPrice && (
            <span
              style={{
                color: body,
                fontWeight: 500,
                fontSize: 12,
                textDecoration: 'line-through',
                marginLeft: 6,
              }}
            >
              {product.price.toFixed(2)}
            </span>
          )}
        </p>
      </div>

      {/* Add button */}
      <button
        onClick={onAdd}
        style={{
          backgroundColor: primary,
          border: 'none',
          borderRadius: 10,
          width: 40,
          height: 40,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-label={`Add ${product.name}`}
        className="transition-opacity hover:opacity-90"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
