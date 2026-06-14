import Image from 'next/image';
import type { CuisinePreset } from '@/lib/data/cuisine-presets';

interface DishCardProps {
  name: string;
  description: string;
  priceLabel: string;
  imageUrl: string;
  ratingLabel?: string;
  preset: CuisinePreset;
  onAdd: () => void;
}

export default function DishCard({
  name,
  description,
  priceLabel,
  imageUrl,
  ratingLabel,
  preset,
  onAdd,
}: DishCardProps) {
  const primary = preset.primary;
  const heading = '#0D102B';
  const body = '#6B6B78';
  const border = `color-mix(in srgb, ${preset.background} 78%, ${primary})`;

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: 20,
        border: `1px solid ${primary}28`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        padding: '20px 18px 18px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Circular dish image */}
      <div className="flex justify-center mb-3.5">
        <div
          style={{
            width: 112,
            height: 112,
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
            position: 'relative',
            backgroundColor: `${primary}20`,
            flexShrink: 0,
          }}
        >
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="112px"
            className="object-cover"
            unoptimized
          />
        </div>
      </div>

      {/* Rating */}
      {ratingLabel && (
        <p
          style={{
            color: body,
            fontWeight: 700,
            fontSize: 12,
            textAlign: 'center',
            margin: 0,
            marginBottom: 6,
          }}
          className="font-sans"
        >
          {ratingLabel}
        </p>
      )}

      {/* Name */}
      <h3
        style={{
          color: heading,
          fontWeight: 900,
          fontSize: 16,
          textAlign: 'center',
          margin: 0,
          marginBottom: 6,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
        className="font-sans"
      >
        {name}
      </h3>

      {/* Description */}
      <p
        style={{
          color: body,
          fontSize: 12.5,
          lineHeight: 1.35,
          textAlign: 'center',
          margin: 0,
          marginBottom: 12,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          flexGrow: 1,
        }}
        className="font-sans"
      >
        {description}
      </p>

      {/* Price + add button */}
      <div className="flex items-center justify-between mt-auto">
        <span
          style={{ color: primary, fontWeight: 900, fontSize: 17 }}
          className="font-sans"
        >
          {priceLabel}
        </span>
        <button
          onClick={onAdd}
          style={{
            backgroundColor: primary,
            borderRadius: 12,
            border: 'none',
            width: 42,
            height: 42,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label={`Add ${name} to cart`}
          className="transition-opacity hover:opacity-90"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
