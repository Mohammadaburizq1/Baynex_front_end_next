import Image from 'next/image';
import type { CuisinePreset } from '@/lib/data/cuisine-presets';
import FloatingFoodCard from './FloatingFoodCard';

interface HeroFoodVisualProps {
  heroImageUrl: string;
  floatingCardImageUrl: string;
  floatingCardName: string;
  floatingCardBlurb: string;
  bestFoodBadge: string;
  preset: CuisinePreset;
  /** Diameter in px for the circular hero image */
  diameter?: number;
}

export default function HeroFoodVisual({
  heroImageUrl,
  floatingCardImageUrl,
  floatingCardName,
  floatingCardBlurb,
  bestFoodBadge,
  preset,
  diameter = 420,
}: HeroFoodVisualProps) {
  const primary = preset.primary;
  const heading = '#0D102B';

  const outerSize = diameter + 48;
  const ringSize = diameter + 28;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: outerSize, height: outerSize + 32, flexShrink: 0 }}
    >
      {/* Dashed ring via SVG */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          fill="none"
          style={{ position: 'absolute' }}
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringSize / 2 - 2}
            stroke={primary}
            strokeOpacity="0.55"
            strokeWidth="2.5"
            strokeDasharray="14 8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Hero circular image */}
      <div
        style={{
          width: diameter,
          height: diameter,
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Image
          src={heroImageUrl}
          alt="Restaurant hero"
          fill
          sizes={`${diameter}px`}
          className="object-cover object-center"
          priority
          unoptimized
        />
      </div>

      {/* Best food badge – top right */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 4,
          backgroundColor: '#fff',
          border: `1px solid ${primary}38`,
          borderRadius: 999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          padding: '6px 12px',
          zIndex: 2,
        }}
      >
        <span
          style={{ color: heading, fontWeight: 800, fontSize: 11 }}
          className="font-sans"
        >
          {bestFoodBadge}
        </span>
      </div>

      {/* Floating card – bottom left */}
      <div
        style={{
          position: 'absolute',
          left: -8,
          bottom: 24,
          zIndex: 2,
        }}
      >
        <FloatingFoodCard
          productName={floatingCardName}
          description={floatingCardBlurb}
          priceLabel="Order now"
          imageUrl={floatingCardImageUrl}
          preset={preset}
        />
      </div>

      {/* Decorative food emojis */}
      <span
        style={{
          position: 'absolute',
          top: `${diameter * 0.08}px`,
          left: -12,
          fontSize: `${diameter * 0.07}px`,
          opacity: 0.4,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        🍕
      </span>
      <span
        style={{
          position: 'absolute',
          bottom: `${diameter * 0.15 + 32}px`,
          right: -4,
          fontSize: `${diameter * 0.065}px`,
          opacity: 0.38,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        🍅
      </span>
      <span
        style={{
          position: 'absolute',
          top: `${diameter * 0.32}px`,
          right: -14,
          fontSize: `${diameter * 0.055}px`,
          opacity: 0.36,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        🧅
      </span>
      <span
        style={{
          position: 'absolute',
          bottom: `${diameter * 0.42 + 32}px`,
          left: -18,
          fontSize: `${diameter * 0.06}px`,
          opacity: 0.34,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        🍃
      </span>
    </div>
  );
}
