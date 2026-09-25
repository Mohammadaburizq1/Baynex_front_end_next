'use client';
import { formatMoney } from '@/lib/utils';

import { useState, useMemo } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ShoppingBag, MessageCircle } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#0F172A',
  surface: '#1E293B',
  border: '#334155',
  text: '#F8FAFC',
  muted: '#94A3B8',
  accent: '#6366F1',
  wa: '#25D366',
  footer: '#0A0F1E',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

// WhatsApp is this template's only contact path: no digits, no inquiry buttons (a bare wa.me
// link opens WhatsApp with no recipient).
function hasWhatsApp(whatsappNumber: string | null | undefined): boolean {
  return (whatsappNumber?.replace(/D/g, '') ?? '').length > 0;
}

function openWhatsApp(whatsappNumber: string | null | undefined, msg: string) {
  const num = whatsappNumber?.replace(/\D/g, '') ?? '';
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ─── Image Component ──────────────────────────────────────────────────────────

function ProductImage({
  imageUrl,
  name,
  className = '',
}: {
  imageUrl: string | null;
  name: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{ background: 'linear-gradient(135deg, #1E293B, #334155)' }}
    >
      <ShoppingBag size={28} color={COLORS.accent} />
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  whatsappNumber,
  currencySuffix,
}: {
  product: PublicProduct;
  whatsappNumber: string | null | undefined;
  currencySuffix: string;
}) {
  const displayPrice = product.discountPrice ?? product.price;

  function handleInquire(e: React.MouseEvent) {
    e.stopPropagation();
    openWhatsApp(
      whatsappNumber,
      `Hi, I'm interested in: ${product.name}`
    );
  }

  return (
    <div
      className="overflow-hidden cursor-pointer transition-colors group"
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '16px',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.accent;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.border;
      }}
    >
      {/* Image */}
      <div className="aspect-square relative overflow-hidden">
        <ProductImage imageUrl={product.imageUrl} name={product.name} />
      </div>

      {/* Info */}
      <div className="p-4">
        <p
          className="font-jakarta font-semibold text-[11px] uppercase tracking-widest"
          style={{ color: COLORS.muted }}
        >
          {product.category}
        </p>
        <p
          className="font-jakarta font-bold text-sm mt-1 line-clamp-2"
          style={{ color: COLORS.text }}
        >
          {product.name}
        </p>
        {product.description && (
          <p
            className="font-jakarta text-xs mt-1 line-clamp-2"
            style={{ color: COLORS.muted }}
          >
            {product.description}
          </p>
        )}
        <p
          className="font-jakarta font-extrabold text-base mt-2"
          style={{ color: COLORS.text }}
        >
          {formatMoney(displayPrice, currencySuffix)}
        </p>

        {/* Inquire Button */}

        {hasWhatsApp(whatsappNumber) && (
        <button
          onClick={handleInquire}
          className="w-full mt-3 py-2 rounded-xl font-jakarta font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-opacity hover:opacity-80"
          style={{
            background: 'rgba(37,211,102,0.1)',
            border: '1px solid rgba(37,211,102,0.3)',
            color: COLORS.wa,
          }}
          aria-label={`Inquire about ${product.name} on WhatsApp`}
        >
          <MessageCircle size={14} />
          Inquire on WhatsApp
        </button>

        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CatalogInquiryTemplate({ data }: { data: StorefrontData }) {
  const tc = data.templateContent;
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(data.products.map((p) => p.category)));
    return ['All', ...cats];
  }, [data.products]);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return data.products;
    return data.products.filter((p) => p.category === activeCategory);
  }, [data.products, activeCategory]);

  function handleHeaderWhatsApp() {
    openWhatsApp(data.store.whatsappNumber, `Hi, I'd like to know more about ${data.store.shopName}`);
  }

  function handleFooterWhatsApp() {
    openWhatsApp(
      data.store.whatsappNumber,
      `Hi, I'd like to know more about ${data.store.shopName}`
    );
  }

  return (
    <div className="min-h-screen font-jakarta" style={{ background: COLORS.bg }}>
      {/* ── Sticky Header ── */}
      <header
        className="px-4 md:px-8 h-14 flex items-center justify-between sticky top-0 z-20"
        style={{
          background: COLORS.bg,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <span
          className="font-jakarta font-bold text-lg"
          style={{ color: COLORS.text }}
        >
          {data.store.shopName}
        </span>

        {hasWhatsApp(data.store.whatsappNumber) && (
          <button
            onClick={handleHeaderWhatsApp}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 font-jakarta font-bold text-xs cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: COLORS.wa, color: '#FFFFFF' }}
            aria-label="Contact via WhatsApp"
          >
            <MessageCircle size={14} />
            Inquire via WhatsApp
          </button>
        )}
      </header>

      {/* ── Hero ── */}
      <section
        className="px-6 py-12 md:py-20 text-center"
        style={{ background: COLORS.bg }}
      >
        <p
          className="font-jakarta font-extrabold text-[11px] tracking-[0.3em] uppercase mb-3"
          style={{ color: COLORS.accent }}
        >
          OUR CATALOG
        </p>
        <h1
          className="font-jakarta font-extrabold text-[40px] md:text-[56px] leading-none"
          style={{ color: COLORS.text }}
        >
          {data.store.shopName}
        </h1>
        {(tc?.heroDescription || data.store.description) && (
          <p
            className="font-jakarta text-base mt-4 max-w-xl mx-auto"
            style={{ color: COLORS.muted }}
          >
            {tc?.heroDescription || data.store.description}
          </p>
        )}
      </section>

      {/* ── Filter Tabs ── */}
      <nav
        className="sticky top-14 z-10 overflow-x-auto"
        style={{
          borderBottom: `1px solid ${COLORS.border}`,
          background: COLORS.bg,
        }}
        aria-label="Product categories"
      >
        <div className="px-4 py-2 flex gap-1" style={{ minWidth: 'max-content' }}>
          {categories.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 font-jakarta font-semibold text-sm cursor-pointer whitespace-nowrap transition-colors"
                style={{
                  color: isActive ? COLORS.accent : COLORS.muted,
                  borderBottom: isActive
                    ? `2px solid ${COLORS.accent}`
                    : '2px solid transparent',
                  background: 'transparent',
                }}
                aria-pressed={isActive}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Product Grid ── */}
      <main className="px-4 md:px-8 py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-3">
            <ShoppingBag size={40} color={COLORS.muted} />
            <p className="font-jakarta text-sm" style={{ color: COLORS.muted }}>
              No products in this category
            </p>
          </div>
        ) : (
          filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              whatsappNumber={data.store.whatsappNumber}
              currencySuffix={data.store.currencySuffix}
            />
          ))
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="px-6 md:px-12 py-12" style={{ background: COLORS.footer }}>
        <p
          className="font-jakarta font-extrabold text-xl text-white"
        >
          {data.store.shopName}
        </p>
        {(tc?.openingHours || data.store.openingHours) && (
          <p className="font-jakarta text-sm mt-1" style={{ color: COLORS.muted }}>
            {tc?.openingHours || data.store.openingHours}
          </p>
        )}
        {data.store.deliveryInfo && (
          <p className="font-jakarta text-sm mt-0.5" style={{ color: COLORS.muted }}>
            {data.store.deliveryInfo}
          </p>
        )}

        <hr className="my-6" style={{ borderColor: COLORS.surface }} />

        {hasWhatsApp(data.store.whatsappNumber) && (<>

        <button
          onClick={handleFooterWhatsApp}
          className="w-full h-14 rounded-xl font-jakarta font-bold text-base text-white flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: COLORS.wa }}
        >
          <MessageCircle size={20} />
          Contact us on WhatsApp
        </button>

        </>)}
      </footer>
    </div>
  );
}
