'use client';

import { useState, useMemo } from 'react';
import { Cormorant_Garamond } from 'next/font/google';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import {
  Calendar,
  Clock,
  MessageCircle,
  ChevronDown,
  X,
  ShoppingBag,
} from 'lucide-react';

// ─── Font ─────────────────────────────────────────────────────────────────────

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  lavender: '#E6E6FA',
  white: '#FFFFFF',
  ink: '#4A4A6A',
  muted: '#8B8BA8',
  accent: '#B8A9C9',
  accentDark: '#9B8DB0',
  chipBg: '#F0EFF5',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function openWhatsApp(number: string, message: string) {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${number.replace(/\D/g, '')}?text=${encoded}`, '_blank');
}

/** Try to extract a duration string from the description, e.g. "60 min", "45 minutes". */
function parseDuration(description: string): string | null {
  const match = description.match(/\b(\d{1,3})\s*(min(?:utes?)?|hours?|hrs?)\b/i);
  if (!match) return null;
  return `${match[1]} ${match[2]}`;
}

// ─── Booking Modal ────────────────────────────────────────────────────────────

function BookingModal({
  open,
  products,
  bookingList,
  currencySuffix,
  whatsappNumber,
  shopName,
  onClose,
}: {
  open: boolean;
  products: PublicProduct[];
  bookingList: Set<number>;
  currencySuffix: string;
  whatsappNumber: string | null;
  shopName: string;
  onClose: () => void;
}) {
  if (!open) return null;

  const selected = products.filter((p) => bookingList.has(p.id));
  const total = selected.reduce(
    (sum, p) => sum + (p.discountPrice ?? p.price),
    0,
  );

  function handleConfirm() {
    if (!whatsappNumber) return;
    const lines = selected.map(
      (p) =>
        `• ${p.name} — ${(p.discountPrice ?? p.price).toLocaleString()} ${currencySuffix}`,
    );
    const message = [
      `Hi, I'd like to book the following services at ${shopName}:`,
      '',
      ...lines,
      '',
      `Total: ${total.toLocaleString()} ${currencySuffix}`,
    ].join('\n');
    openWhatsApp(whatsappNumber, message);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center backdrop-blur-sm"
      style={{ background: 'rgba(74,74,106,0.4)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Booking summary"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 relative"
        style={{ background: C.white, border: `1px solid ${C.lavender}` }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer hover:opacity-70 transition"
          aria-label="Close booking modal"
          style={{ color: C.muted }}
        >
          <X size={22} />
        </button>

        <h2
          className={`${cormorant.className} font-semibold text-2xl mb-4`}
          style={{ color: C.ink }}
        >
          Your Appointment
        </h2>

        {/* Selected services */}
        <div className="flex flex-col gap-2">
          {selected.map((p) => (
            <div key={p.id} className="flex justify-between items-start gap-3">
              <span
                className={`${cormorant.className} font-semibold text-base leading-snug`}
                style={{ color: C.ink }}
              >
                {p.name}
              </span>
              <span
                className="font-jakarta font-bold text-sm whitespace-nowrap"
                style={{ color: C.ink }}
              >
                {(p.discountPrice ?? p.price).toLocaleString()} {currencySuffix}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          className="my-3 h-px"
          style={{ background: C.lavender }}
          aria-hidden="true"
        />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span
            className="font-jakarta text-sm"
            style={{ color: C.muted }}
          >
            Total
          </span>
          <span
            className="font-jakarta font-bold text-lg"
            style={{ color: C.ink }}
          >
            {total.toLocaleString()} {currencySuffix}
          </span>
        </div>

        {/* Confirm */}
        {whatsappNumber ? (
          <button
            onClick={handleConfirm}
            className="w-full h-12 rounded-xl font-jakarta font-bold text-sm mt-4 flex items-center justify-center gap-2 text-white cursor-pointer hover:opacity-90 transition"
            style={{ background: '#25D366' }}
          >
            <MessageCircle size={18} aria-hidden="true" />
            Confirm via WhatsApp
          </button>
        ) : (
          <p
            className="font-jakarta text-sm mt-4 text-center"
            style={{ color: C.muted }}
          >
            Contact us to finalize your booking.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({
  product,
  expanded,
  selected,
  currencySuffix,
  onToggleExpand,
  onToggleSelect,
}: {
  product: PublicProduct;
  expanded: boolean;
  selected: boolean;
  currencySuffix: string;
  onToggleExpand: () => void;
  onToggleSelect: (e: React.MouseEvent) => void;
}) {
  const duration = parseDuration(product.description);
  const displayPrice = product.discountPrice ?? product.price;

  return (
    <article
      className="bg-white overflow-hidden transition-all duration-[420ms] ease-out cursor-pointer"
      style={{
        borderRadius: '30px',
        boxShadow: '0 2px 12px rgba(74,74,106,0.08)',
      }}
      onClick={onToggleExpand}
    >
      {/* Header row — always visible */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <h3
            className={`${cormorant.className} font-semibold text-lg leading-snug`}
            style={{ color: C.ink }}
          >
            {product.name}
          </h3>
          <p
            className="font-jakarta text-xs mt-0.5"
            style={{ color: C.muted }}
          >
            {product.category}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-jakarta font-bold text-base" style={{ color: C.ink }}>
            {displayPrice.toLocaleString()} {currencySuffix}
          </span>
          <ChevronDown
            size={20}
            color={C.muted}
            aria-hidden="true"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 300ms',
            }}
          />
        </div>
      </div>

      {/* Expandable content */}
      <div
        className="overflow-hidden transition-all duration-[420ms] ease-out"
        style={{ maxHeight: expanded ? '400px' : '0px' }}
        aria-hidden={!expanded}
      >
        <div className="px-5 pb-5">
          {/* Description */}
          <p
            className={`${cormorant.className} italic text-base leading-[1.5] mt-2`}
            style={{ color: C.muted }}
          >
            {product.description}
          </p>

          {/* Duration badge */}
          {duration && (
            <span
              className="inline-flex items-center gap-1.5 px-4 py-1.5 mt-3 font-jakarta text-xs"
              style={{
                background: C.lavender,
                borderRadius: '9999px',
                color: C.ink,
              }}
            >
              <Clock size={14} aria-hidden="true" />
              {duration}
            </span>
          )}

          {/* Action row */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={onToggleSelect}
              disabled={!product.available || product.stock <= 0}
              className={`${cormorant.className} font-semibold text-base cursor-pointer flex-1 px-6 py-3 transition disabled:opacity-40 disabled:cursor-not-allowed`}
              style={{
                background: selected ? C.accentDark : C.accent,
                color: C.white,
                borderRadius: '16px',
              }}
              aria-pressed={selected}
              aria-label={selected ? `Deselect ${product.name}` : `Select ${product.name}`}
            >
              {!product.available || product.stock <= 0
                ? 'Unavailable'
                : selected
                ? 'Selected ✓'
                : 'Select Service'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SerenitySpaTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;

  const [bookingList, setBookingList] = useState<Set<number>>(new Set());
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ['All', ...cats];
  }, [products]);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function toggleSelect(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    setBookingList((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="min-h-screen font-jakarta" style={{ background: C.white }}>
      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <header
        className="px-5 py-4 h-14 flex items-center justify-between sticky top-0 z-20"
        style={{
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${C.lavender}`,
        }}
      >
        <span
          className={`${cormorant.className} font-semibold text-[22px] italic`}
          style={{ color: C.ink }}
        >
          {store.shopName}
        </span>

        <button
          onClick={() => bookingList.size > 0 && setModalOpen(true)}
          className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition"
          aria-label={`View booking list — ${bookingList.size} service${bookingList.size !== 1 ? 's' : ''} selected`}
        >
          <ShoppingBag size={20} color={C.ink} aria-hidden="true" />
          {bookingList.size > 0 && (
            <span
              className="rounded-full px-1.5 font-jakarta font-bold text-[10px] text-white"
              style={{ background: C.accent }}
              aria-hidden="true"
            >
              {bookingList.size}
            </span>
          )}
        </button>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="px-6 py-12 text-center"
        style={{ background: C.lavender }}
      >
        <p
          className="font-jakarta font-bold text-[10px] uppercase mb-4"
          style={{ letterSpacing: '0.3em', color: C.muted }}
        >
          WELLNESS &amp; SPA
        </p>
        <h1
          className={`${cormorant.className} font-semibold text-5xl italic leading-none`}
          style={{ color: C.ink }}
        >
          {store.shopName}
        </h1>
        <p
          className={`${cormorant.className} italic text-lg mt-3 max-w-md mx-auto`}
          style={{ color: C.muted }}
        >
          {tc?.heroDescription || store.description || 'Relax, restore, and renew your spirit'}
        </p>
        <button
          onClick={() => bookingList.size > 0 && setModalOpen(true)}
          className={`${cormorant.className} font-semibold text-base px-8 py-3 mt-6 cursor-pointer transition inline-block`}
          style={{
            color: C.ink,
            border: `1px solid ${C.accent}`,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = 'rgba(184,169,201,0.2)')
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          aria-label={
            bookingList.size > 0
              ? 'Book appointment'
              : 'Select services to book an appointment'
          }
        >
          Book Appointment
        </button>
      </section>

      {/* ── Category Chips ────────────────────────────────────────────────── */}
      <nav
        className="bg-white overflow-x-auto flex gap-2 px-5 py-3"
        style={{ borderBottom: `1px solid ${C.lavender}` }}
        aria-label="Service categories"
      >
        {categories.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="font-jakarta text-sm cursor-pointer whitespace-nowrap px-4 py-2 transition"
              style={{
                borderRadius: '20px',
                background: isActive ? C.accent : C.chipBg,
                color: isActive ? C.white : C.muted,
              }}
              aria-pressed={isActive}
            >
              {cat}
            </button>
          );
        })}
      </nav>

      {/* ── Service Cards ─────────────────────────────────────────────────── */}
      <main
        className="px-4 md:px-8 py-5 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white max-w-screen-lg mx-auto"
        style={{ paddingBottom: bookingList.size > 0 ? '96px' : undefined }}
      >
        {filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <Calendar size={40} color={C.muted} aria-hidden="true" />
            <p className="font-jakarta text-sm" style={{ color: C.muted }}>
              No services in this category yet
            </p>
          </div>
        ) : (
          filtered.map((product) => (
            <ServiceCard
              key={product.id}
              product={product}
              expanded={expandedId === product.id}
              selected={bookingList.has(product.id)}
              currencySuffix={store.currencySuffix}
              onToggleExpand={() => toggleExpand(product.id)}
              onToggleSelect={(e) => toggleSelect(e, product.id)}
            />
          ))
        )}
      </main>

      {/* ── Booking Bar ───────────────────────────────────────────────────── */}
      {bookingList.size > 0 && (
        <div
          className="fixed bottom-0 inset-x-0 px-5 py-4 flex items-center justify-between z-30"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(16px)',
            borderTop: `1px solid ${C.lavender}`,
          }}
        >
          <div className="flex items-center gap-2">
            <Calendar size={24} color={C.accent} aria-hidden="true" />
            <span className="font-jakarta font-bold text-sm" style={{ color: C.ink }}>
              Book Appointment · {bookingList.size} service{bookingList.size !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="font-jakarta font-bold text-sm text-white cursor-pointer px-6 py-3 hover:opacity-90 transition"
            style={{ background: C.accent, borderRadius: '16px' }}
          >
            Book Now →
          </button>
        </div>
      )}

      {/* ── Booking Modal ─────────────────────────────────────────────────── */}
      <BookingModal
        open={modalOpen}
        products={products}
        bookingList={bookingList}
        currencySuffix={store.currencySuffix}
        whatsappNumber={store.whatsappNumber}
        shopName={store.shopName}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
