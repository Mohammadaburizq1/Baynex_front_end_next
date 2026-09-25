'use client';
import { formatMoney } from '@/lib/utils';

import { useState, useMemo, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { Phone, MessageCircle, Star, X, CalendarCheck } from 'lucide-react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { getUpcomingSlots, bookAppointment, type ApiAppointmentSlot } from '@/lib/api/appointments';

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
  onBook,
}: {
  product: PublicProduct;
  currencySuffix: string;
  onBook: (product: PublicProduct) => void;
}) {
  const hasDiscount =
    product.discountPrice !== null && product.discountPrice < product.price;
  const displayPrice = product.discountPrice ?? product.price;

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
          {formatMoney(displayPrice, currencySuffix)}
        </span>
        {hasDiscount && (
          <span
            className="font-jakarta font-bold text-sm line-through ml-2"
            style={{ color: C.muted }}
          >
            {formatMoney(product.price, currencySuffix)}
          </span>
        )}
      </div>

      {/* Book Now */}
      <button
        onClick={() => onBook(product)}
        disabled={!product.available || product.stock <= 0}
        className="w-full mt-3 h-11 rounded-xl font-jakarta font-bold text-sm text-white cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: C.teal }}
        aria-label={`Book ${product.name}`}
      >
        {!product.available || product.stock <= 0 ? 'Unavailable' : 'Book Now'}
      </button>
    </article>
  );
}

// ─── Booking Modal ────────────────────────────────────────────────────────────

function BookingModal({
  product,
  storeSlug,
  whatsappNumber,
  onClose,
}: {
  product: PublicProduct;
  storeSlug: string;
  whatsappNumber: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useCustomerAuth();

  const [slots, setSlots] = useState<ApiAppointmentSlot[]>([]);
  // A failed load is not the same as "no times published".
  const [slotsError, setSlotsError] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [bookName, setBookName] = useState(user?.name ?? '');
  const [bookPhone, setBookPhone] = useState(user?.phone ?? '');
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState('');
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getUpcomingSlots(storeSlug)
      .then((s) => { if (!cancelled) setSlots(s); })
      .catch(() => { if (!cancelled) { setSlots([]); setSlotsError(true); } })
      .finally(() => { if (!cancelled) setLoadingSlots(false); });
    return () => { cancelled = true; };
  }, [storeSlug]);

  async function handleBookSlot() {
    if (!isAuthenticated) {
      router.push(`/customer/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!selectedSlotId) {
      setBookError('Please select a time.');
      return;
    }
    if (!bookName.trim() || !bookPhone.trim()) {
      setBookError('Name and phone are required.');
      return;
    }
    setBooking(true);
    setBookError('');
    try {
      await bookAppointment(storeSlug, {
        slotId: selectedSlotId,
        productId: String(product.id),
        customerName: bookName.trim(),
        customerPhone: bookPhone.trim(),
        notes: `Booking for: ${product.name}`,
      });
      setBooked(true);
    } catch (e) {
      setBookError(e instanceof Error ? e.message : 'Could not book this slot. Please try again.');
    }
    setBooking(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-sm w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer hover:opacity-70 transition"
          style={{ color: C.muted }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h3 className="font-jakarta font-bold text-xl mb-1" style={{ color: C.ink }}>
          Book Appointment
        </h3>
        <p className="font-jakarta text-sm mb-5" style={{ color: C.muted }}>{product.name}</p>

        {booked ? (
          <div className="text-center py-2">
            <CalendarCheck size={32} className="mx-auto mb-2" color={C.teal} />
            <p className="font-jakarta font-bold text-sm" style={{ color: C.ink }}>Booking booked!</p>
            <p className="font-jakarta text-xs mt-1" style={{ color: C.muted }}>Your slot is confirmed.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {bookError && (
              <p className="font-jakarta text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{bookError}</p>
            )}
            {loadingSlots ? (
              <p className="font-jakarta text-xs" style={{ color: C.muted }}>Loading available times…</p>
            ) : slots.length === 0 ? (
              <p className="font-jakarta text-xs" style={{ color: C.muted }}>{slotsError
                ? "Couldn't load available times right now. Please try again later."
                : `No times published yet${whatsappNumber ? ' — reach out on WhatsApp instead' : ''}.`}</p>
            ) : (
              <>
                <select
                  value={selectedSlotId}
                  onChange={(e) => setSelectedSlotId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl font-jakarta text-sm"
                  style={{ border: `1px solid ${C.border}`, color: C.ink }}
                  aria-label="Select an appointment time"
                >
                  <option value="">Select a time…</option>
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {new Date(slot.startsAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </option>
                  ))}
                </select>
                <input
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  placeholder="Your name"
                  className="w-full h-11 px-3 rounded-xl font-jakarta text-sm"
                  style={{ border: `1px solid ${C.border}`, color: C.ink }}
                />
                <input
                  value={bookPhone}
                  onChange={(e) => setBookPhone(e.target.value)}
                  placeholder="Phone"
                  className="w-full h-11 px-3 rounded-xl font-jakarta text-sm"
                  style={{ border: `1px solid ${C.border}`, color: C.ink }}
                />
                <button
                  onClick={handleBookSlot}
                  disabled={booking}
                  className="w-full h-12 rounded-xl font-jakarta font-bold text-sm flex items-center justify-center gap-2 text-white cursor-pointer hover:opacity-90 transition disabled:opacity-60"
                  style={{ background: C.tealDark }}
                >
                  <CalendarCheck size={18} />
                  {booking ? 'Booking…' : isAuthenticated ? 'Book This Appointment' : 'Sign In to Book'}
                </button>
              </>
            )}
          </div>
        )}

        {whatsappNumber && (
          <button
            onClick={() => openWhatsApp(whatsappNumber, `Hi, I'd like to book: ${product.name}`)}
            className="w-full h-12 rounded-xl text-white font-jakarta font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition"
            style={{ background: '#25D366' }}
          >
            <MessageCircle size={18} />
            WhatsApp Us
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ServicesHubTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [bookingProduct, setBookingProduct] = useState<PublicProduct | null>(null);

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
          {tc?.heroEyebrow || 'PROFESSIONAL SERVICES'}
        </p>
        <h1 className="font-jakarta font-extrabold text-[40px] md:text-[52px] text-white leading-tight">
          {store.shopName}
        </h1>
        <p className="font-jakarta text-base text-white/70 mt-3 max-w-lg mx-auto">
          {tc?.heroDescription || store.description || `Expert services tailored to your needs`}
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
              onBook={setBookingProduct}
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
        {(tc?.openingHours || store.openingHours) && (
          <p className="font-jakarta text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {tc?.openingHours || store.openingHours}
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

      {/* ── Booking Modal ─────────────────────────────────────────────────── */}
      {bookingProduct && (
        <BookingModal
          product={bookingProduct}
          storeSlug={store.slug}
          whatsappNumber={store.whatsappNumber}
          onClose={() => setBookingProduct(null)}
        />
      )}
    </div>
  );
}
