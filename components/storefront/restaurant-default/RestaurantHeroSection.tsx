import type { CuisinePreset } from '@/lib/data/cuisine-presets';
import HeroFoodVisual from './HeroFoodVisual';

interface HeroContent {
  storeName: string;
  heroEyebrow: string;
  heroTitleMain: string;
  heroTitleEnjoyLine: string;
  heroHighlight: string;
  heroSubtitle: string;
  primaryButtonLabel: string;
  secondaryButtonLabel: string;
  heroImageUrl: string;
  floatingCardName: string;
  floatingCardBlurb: string;
  floatingCardImageUrl: string;
  bestFoodBadge: string;
  openingHours: string;
}

interface RestaurantHeroSectionProps {
  content: HeroContent;
  preset: CuisinePreset;
  onReserveTable: () => void;
  onOnlineOrder: () => void;
}

export default function RestaurantHeroSection({
  content,
  preset,
  onReserveTable,
  onOnlineOrder,
}: RestaurantHeroSectionProps) {
  const primary = preset.primary;
  const bg = preset.background;
  const heading = '#0D102B';
  const body = '#6B6B78';

  return (
    <section
      style={{ backgroundColor: bg }}
      className="px-4 sm:px-6 lg:px-8 pb-9 pt-2"
    >
      <div className="mx-auto max-w-[1180px]">
        {/* Two-column on desktop, stacked on mobile */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:min-h-[600px] gap-7 lg:gap-0">
          {/* Left: copy + CTAs */}
          <div className="flex-[52] flex flex-col items-start">
            {/* Eyebrow */}
            <p
              style={{
                color: primary,
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
              }}
              className="font-sans m-0"
            >
              {content.heroEyebrow}
            </p>

            {/* Main title */}
            <h1
              style={{
                color: heading,
                fontWeight: 900,
                lineHeight: 1.05,
                marginTop: 10,
                marginBottom: 0,
              }}
              className="font-sans text-[34px] lg:text-[48px]"
            >
              {content.heroTitleMain}
            </h1>

            {/* Enjoy line + highlight */}
            <div
              className="flex flex-wrap items-baseline gap-x-1 mt-1.5"
              style={{ lineHeight: 1.05 }}
            >
              <span
                style={{
                  color: heading,
                  fontWeight: 900,
                  fontSize: 'clamp(30px, 5vw, 44px)',
                }}
                className="font-sans"
              >
                {content.heroTitleEnjoyLine}{' '}
              </span>
              <span
                style={{
                  color: primary,
                  fontWeight: 900,
                  fontSize: 'clamp(30px, 5vw, 44px)',
                  borderBottom: `3px solid ${primary}`,
                  paddingBottom: 1,
                }}
                className="font-sans"
              >
                {content.heroHighlight}
              </span>
            </div>

            {/* Subtitle */}
            <p
              style={{
                color: body,
                fontSize: 15,
                lineHeight: 1.55,
                marginTop: 18,
                marginBottom: 0,
              }}
              className="font-sans max-w-md"
            >
              {content.heroSubtitle}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={onReserveTable}
                style={{
                  backgroundColor: primary,
                  color: '#fff',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 14,
                  padding: '0 22px',
                  height: 48,
                  border: 'none',
                  cursor: 'pointer',
                  minWidth: 160,
                }}
                className="font-sans transition-opacity hover:opacity-90"
              >
                {content.primaryButtonLabel}
              </button>
              <button
                onClick={onOnlineOrder}
                style={{
                  backgroundColor: 'transparent',
                  color: heading,
                  border: `1.4px solid ${heading}`,
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 14,
                  padding: '0 20px',
                  height: 48,
                  cursor: 'pointer',
                  minWidth: 150,
                }}
                className="font-sans transition-opacity hover:opacity-80"
              >
                {content.secondaryButtonLabel}
              </button>
            </div>

            {/* Opening hours */}
            <div className="flex items-center gap-2 mt-6">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span
                style={{ color: body, fontWeight: 600, fontSize: 14 }}
                className="font-sans"
              >
                {content.openingHours}
              </span>
            </div>
          </div>

          {/* Right: hero visual */}
          <div className="flex-[48] flex items-center justify-center lg:justify-end overflow-visible">
            <HeroFoodVisual
              heroImageUrl={content.heroImageUrl}
              floatingCardImageUrl={content.floatingCardImageUrl}
              floatingCardName={content.floatingCardName}
              floatingCardBlurb={content.floatingCardBlurb}
              bestFoodBadge={content.bestFoodBadge}
              preset={preset}
              diameter={380}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
