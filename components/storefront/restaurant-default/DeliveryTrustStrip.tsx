import type { CuisinePreset } from '@/lib/data/cuisine-presets';

interface DeliveryTrustStripProps {
  preset: CuisinePreset;
  deliveryInfo: string | null;
  /** Preview showcase only: the delivery-time and rating claims are illustrative. */
  demo?: boolean;
}

// Illustrative claims (delivery time, rating) no real store has backed — preview only.
const DEMO_ITEMS = [
  { icon: '🚚', label: 'Fast Delivery', sub: '30–45 min' },
  { icon: '⭐', label: 'Top Rated', sub: '4.9 · 200+ reviews' },
];

const TRUST_ITEMS = [
  { icon: '🔒', label: 'Secure Order', sub: 'Safe checkout' },
  { icon: '🍽️', label: 'Fresh Daily', sub: 'Made to order' },
];

export default function DeliveryTrustStrip({ preset, deliveryInfo, demo }: DeliveryTrustStripProps) {
  const primary = preset.primary;
  const heading = '#0D102B';
  const body = '#6B6B78';

  const items = [
    ...(deliveryInfo ? [{ icon: '🚚', label: 'Delivery', sub: deliveryInfo }] : demo ? DEMO_ITEMS.slice(0, 1) : []),
    ...(demo ? DEMO_ITEMS.slice(1) : []),
    ...TRUST_ITEMS,
  ];

  return (
    <section
      style={{ backgroundColor: preset.background, borderTop: `1px solid ${primary}20`, borderBottom: `1px solid ${primary}20` }}
      className="px-4 sm:px-6 lg:px-8 py-5"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div
                style={{ backgroundColor: `${primary}18`, borderRadius: 12 }}
                className="w-11 h-11 flex items-center justify-center flex-shrink-0 text-xl"
              >
                {item.icon}
              </div>
              <div>
                <p style={{ color: heading, fontWeight: 700, fontSize: 13, margin: 0 }} className="font-sans">
                  {item.label}
                </p>
                <p style={{ color: body, fontSize: 12, margin: 0 }} className="font-sans">
                  {item.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
