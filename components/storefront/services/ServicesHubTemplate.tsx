'use client';

import { useState, useMemo } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { Phone, MessageCircle, Star } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  bg: '#F0FAFA',
  surface: '#FFFFFF',
  teal: '#0D9488',
  tealDark: '#0F766E',
  ink: '#134E4A',
  muted: '#6B7280',
  border: '#CCFBF1',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function openWhatsApp(number: string, message: string) {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${number.replace(/\D/g, '')}?text=${encoded}`, '_blank');
}

// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({
  product,
  currencySuffix,
  whatsappNumber,
}: {
  product: PublicProduct;
  currencySuffix: string;
  whatsappNumber: string | null;
}) {
  const [booked, setBooked] = useState(false);
  const hasDiscount =
    product.discountPrice !== null && product.discountPrice < product.price;
  const displayPrice = product.discountPrice ?? product.price;

  function handleBook() {
    if (whatsappNumber) {
      openWhatsApp(
        whatsappNumber,
        `Hi, I'd like to book: ${product.name}`,
      );
    } else {
      setBooked(true);
      setTimeout(() => setBooked(false), 2000);
    }
  }

  return (
    <article
      className="bg-white rounded-2xl p-5 hover:shadow-md transition cursor-pointer"
      style={{ border: `1px solid ${C.border}` }}
    >
      {/* Image / Placeholder */}
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-40 object-cover rounded-xl w-full mb-4"
        />
      ) : (
        <div
          className="h-40 rounded-xl mb-4 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #CCFBF1, #99F6E4)' }}
          aria-hidden="true"
        >
          <Star size={32} color={C.teal} />
        </div>
      )}

      {/* Category */}
      <p
        className="font-jakarta font-semibold text-[11px] uppercase tracking-widest"
        style={{ color: C.teal }}
      >
        {product.category}
      </p>

      {/* Name */}
      <h3
        className="font-jakarta font-bold text-lg mt-1"
        style={{ color: C.ink }}
      >
        {product.name}
      </h3>

      {/* Description */}
      <p
        className="font-jakarta text-sm mt-1 line-clamp-3"
        style={{ color: C.muted }}
      >
        {product.description}
      </p>

      {/* Price row */}
      <div className="flex items-center mt-3">
        <span
          className="font-jakarta font-extrabold text-xl"
          style={{ color: C.ink }}
        >
          {displayPrice.toLocaleString()} {currencySuffix}
        </span>
        {hasDiscount && (
          <span
            className="font-jakarta font-bold text-sm line-through ml-2"
            style={{ color: C.muted }}
          >
            {product.price.toLocaleString()} {currencySuffix}
          </span>
        )}
      </div>

      {/* Book Now */}
      <button
        onClick={handleBook}
        disabled={!product.available || product.stock <= 0}
        className="w-full mt-3 h-11 rounded-xl font-jakarta font-bold text-sm text-white cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: booked ? C.tealDark : C.teal }}
        aria-label={`Book ${product.name}`}
      >
        {!product.available || product.stock <= 0
          ? 'Unavailable'
          : booked
          ? 'Booking sent!'
          : 'Book Now'}
      </button>
    </article>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ServicesHubTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;

  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ['All', ...cats];
  }, [products]);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  function handleNavWhatsApp() {
    if (store.whatsappNumber) {
      openWhatsApp(store.whatsappNumber, `Hi, I'd like to book a service from ${store.shopName}`);
    }
  }

  return (
    <div className="min-h-screen font-jakarta" style={{ background: C.bg }}>
      {/* ── Sticky Navbar ─────────────────────────────────────────────────── */}
      <header
        className="bg-white px-4 md:px-8 h-14 flex items-center justify-between sticky top-0 z-20"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <span className="font-jakarta font-bold text-lg" style={{ color: C.ink }}>
          {store.shopName}
        </span>

        <button
          onClick={handleNavWhatsApp}
          className="flex items-center gap-1.5 px-4 py-2 font-jakarta font-semibold text-xs cursor-pointer transition-colors hover:bg-teal-50"
          style={{
            border: `1px solid ${C.teal}`,
            borderRadius: '9999px',
            color: C.teal,
          }}
          aria-label="Book now via WhatsApp"
        >
          <Phone size={14} aria-hidden="true" />
          Book Now
        </button>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="px-6 py-12 md:py-20 text-center"
        style={{ background: 'linear-gradient(135deg, #134E4A 0%, #0D9488 100%)' }}
      >
        <p className="font-jakarta font-extrabold text-[11px] tracking-widest text-white/70 uppercase mb-3">
          PROFESSIONAL SERVICES
        </p>
        <h1 className="font-jakarta font-extrabold text-[40px] md:text-[52px] text-white leading-tight">
          {store.shopName}
        </h1>
        <p className="font-jakarta text-base text-white/70 mt-3 max-w-lg mx-auto">
          {store.description || `Expert services tailored to your needs`}
        </p>
        <button
          className="bg-white inline-flex rounded-full px-8 py-3 font-jakarta font-bold text-sm mt-6 cursor-pointer hover:opacity-90 transition"
          style={{ color: C.teal }}
          onClick={() => {
            document.getElementById('sh-services')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          View All Services
        </button>
      </section>

      {/* ── Category Tabs ─────────────────────────────────────────────────── */}
      <nav
        className="bg-white overflow-x-auto sticky top-14 z-10"
        style={{ borderBottom: `1px solid ${C.border}` }}
        aria-label="Service categories"
      >
        <div className="px-4 py-2 flex gap-1" style={{ minWidth: 'max-content' }}>
          {categories.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="font-jakarta font-semibold text-sm px-4 py-2 cursor-pointer transition whitespace-nowrap"
                style={{
                  color: isActive ? C.teal : C.muted,
                  borderBottom: isActive ? `2px solid ${C.teal}` : '2px solid transparent',
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

      {/* ── Service Grid ──────────────────────────────────────────────────── */}
      <main
        id="sh-services"
        className="px-4 md:px-8 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        style={{ background: C.bg }}
      >
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-3">
            <Star size={40} color={C.muted} aria-hidden="true" />
            <p className="font-jakarta text-sm" style={{ color: C.muted }}>
              No services in this category yet
            </p>
          </div>
        ) : (
          filtered.map((product) => (
            <ServiceCard
              key={product.id}
              product={product}
              currencySuffix={store.currencySuffix}
              whatsappNumber={store.whatsappNumber}
            />
          ))
        )}
      </main>

      {/* ── WhatsApp FAB ──────────────────────────────────────────────────── */}
      {store.whatsappNumber && (
        <button
          onClick={() =>
            openWhatsApp(
              store.whatsappNumber!,
              `Hi, I'd like to inquire about your services at ${store.shopName}`,
            )
          }
          className="fixed bottom-6 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition z-30"
          style={{ background: '#25D366' }}
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={24} color="#FFFFFF" aria-hidden="true" />
        </button>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        className="px-6 md:px-12 py-10 text-white"
        style={{ background: C.ink }}
      >
        <p className="font-jakarta font-extrabold text-xl">{store.shopName}</p>
        {store.openingHours && (
          <p className="font-jakarta text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {store.openingHours}
          </p>
        )}
        {store.whatsappNumber && (
          <button
            onClick={() =>
              openWhatsApp(store.whatsappNumber!, `Hi, I found you on ${store.shopName}`)
            }
            className="font-jakarta text-sm mt-2 cursor-pointer hover:underline block"
            style={{ color: '#99F6E4' }}
            aria-label="Contact via WhatsApp"
          >
            WhatsApp: {store.whatsappNumber}
          </button>
        )}
      </footer>
    </div>
  );
}
