'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import {
  Phone,
  MessageCircle,
  ChevronDown,
  X,
  Bed,
  Bath,
  Building2,
  CalendarCheck,
} from 'lucide-react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { getUpcomingSlots, bookAppointment, type ApiAppointmentSlot } from '@/lib/api/appointments';

interface OpenHouseTemplateProps {
  data: StorefrontData;
}

function formatPrice(price: number, currencySuffix: string): string {
  const formatted =
    price >= 1_000_000
      ? `$${(price / 1_000_000).toFixed(1)}M`
      : price >= 1_000
      ? `$${(price / 1_000).toFixed(0)}K`
      : `$${price.toLocaleString()}`;
  return `${formatted} ${currencySuffix}`;
}

function parseBeds(description: string): number | null {
  const match = description.match(/(\d+)\s*bed/i);
  return match ? parseInt(match[1], 10) : null;
}

function parseBaths(description: string): number | null {
  const match = description.match(/(\d+)\s*bath/i);
  return match ? parseInt(match[1], 10) : null;
}

export default function OpenHouseTemplate({ data }: OpenHouseTemplateProps) {
  const { store, products } = data;
  const tc = data.templateContent;
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useCustomerAuth();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedProperty, setSelectedProperty] = useState<PublicProduct | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  // ── Real booking (slots fetched when the modal opens) ─────────────────────
  const [slots, setSlots] = useState<ApiAppointmentSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [bookName, setBookName] = useState('');
  const [bookPhone, setBookPhone] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState('');
  const [booked, setBooked] = useState(false);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.category === activeCategory);

  const heroImage =
    products.find((p) => p.imageUrl)?.imageUrl ??
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80';

  function handleContact(product: PublicProduct) {
    setSelectedProperty(product);
    setContactOpen(true);
    setBooked(false);
    setBookError('');
    setSelectedSlotId('');
    setBookName(user?.name ?? '');
    setBookPhone(user?.phone ?? '');
    setLoadingSlots(true);
    getUpcomingSlots(store.slug)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }

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
      await bookAppointment(store.slug, {
        slotId: selectedSlotId,
        productId: selectedProperty ? String(selectedProperty.id) : undefined,
        customerName: bookName.trim(),
        customerPhone: bookPhone.trim(),
        notes: selectedProperty ? `Viewing request for "${selectedProperty.name}"` : undefined,
      });
      setBooked(true);
    } catch (e) {
      setBookError(e instanceof Error ? e.message : 'Could not book this slot. Please try again.');
    }
    setBooking(false);
  }

  function handleWhatsApp() {
    if (!selectedProperty) return;
    const msg = encodeURIComponent(
      `Hi, I'd like to schedule a viewing for "${selectedProperty.name}" (${formatPrice(selectedProperty.price, store.currencySuffix)}).`
    );
    if (store.whatsappNumber) {
      window.open(`https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}?text=${msg}`, '_blank');
    }
  }

  function handleHeaderContact() {
    if (store.whatsappNumber) {
      window.open(
        `https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}`,
        '_blank'
      );
    } else {
      window.location.href = `tel:${store.whatsappNumber}`;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-jakarta">
      {/* ── Header ── */}
      <header
        className="px-6 md:px-12 h-16 flex items-center justify-between sticky top-0 z-20"
        style={{ background: '#0A192F' }}
      >
        <span className="font-jakarta font-bold text-xl text-white">
          {store.shopName}
        </span>
        <button
          onClick={handleHeaderContact}
          className="border border-white/30 rounded-full px-4 py-2 font-jakarta font-semibold text-xs text-white flex items-center gap-2 cursor-pointer hover:bg-white/10 transition"
        >
          <Phone size={14} />
          Contact Us
        </button>
      </header>

      {/* ── Hero Banner ── */}
      <div className="h-[400px] md:h-[500px] relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt={store.shopName}
          className="absolute inset-0 object-cover w-full h-full"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(10,25,47,0.80)' }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="font-jakarta font-extrabold text-[11px] tracking-widest text-white/70 uppercase mb-3">
            {tc?.heroEyebrow || 'Property Listings'}
          </p>
          <h1 className="font-jakarta font-extrabold text-5xl md:text-6xl text-white leading-none">
            {store.shopName}
          </h1>
          <p className="font-jakarta text-lg text-white/70 mt-4">
            {tc?.heroDescription || store.description || 'Find your perfect property'}
          </p>
          <ChevronDown size={28} className="text-white/50 mt-8 animate-bounce" />
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white border-b sticky top-16 z-10 overflow-x-auto">
        <div className="px-6 py-3 flex gap-1 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="font-jakarta font-semibold text-sm px-4 py-2 cursor-pointer transition whitespace-nowrap"
              style={
                activeCategory === cat
                  ? { color: '#0A192F', borderBottom: '2px solid #0A192F' }
                  : { color: '#718096' }
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Listing Cards ── */}
      <div className="px-4 md:px-8 py-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-screen-xl mx-auto w-full">
        {filtered.length === 0 && (
          <p className="font-jakarta text-center text-[#718096] py-16">
            No listings in this category.
          </p>
        )}
        {filtered.map((product) => {
          const beds = parseBeds(product.description);
          const baths = parseBaths(product.description);
          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
            >
              {/* Card Image */}
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-[240px] object-cover w-full"
                />
              ) : (
                <div
                  className="h-[240px] w-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#0A192F,#1E3A5F)' }}
                >
                  <Building2 size={48} className="text-white/60" />
                </div>
              )}

              {/* Card Body */}
              <div className="p-5">
                <span
                  className="font-jakarta font-bold text-[11px] uppercase tracking-wide rounded-full px-3 py-1 inline-block mb-3"
                  style={{ background: 'rgba(10,25,47,0.1)', color: '#0A192F' }}
                >
                  {product.category}
                </span>
                <h2 className="font-jakarta font-bold text-xl text-[#1A202C]">
                  {product.name}
                </h2>
                <p className="font-jakarta text-sm text-[#718096] mt-1 line-clamp-2">
                  {product.description.slice(0, 80)}
                  {product.description.length > 80 ? '…' : ''}
                </p>

                <p className="font-jakarta font-extrabold text-2xl text-[#0A192F] mt-3">
                  {formatPrice(product.price, store.currencySuffix)}
                </p>

                {/* Spec Row */}
                {(beds !== null || baths !== null) && (
                  <div className="flex gap-4 mt-2">
                    {beds !== null && (
                      <span className="flex items-center gap-1.5 font-jakarta font-semibold text-sm text-[#718096]">
                        <Bed size={16} />
                        {beds} bed
                      </span>
                    )}
                    {baths !== null && (
                      <span className="flex items-center gap-1.5 font-jakarta font-semibold text-sm text-[#718096]">
                        <Bath size={16} />
                        {baths} bath
                      </span>
                    )}
                  </div>
                )}

                <button
                  onClick={() => handleContact(product)}
                  className="w-full mt-4 h-12 rounded-xl text-white font-jakarta font-bold text-sm cursor-pointer hover:opacity-90 transition"
                  style={{ background: '#0A192F' }}
                >
                  Request Viewing
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <footer
        className="px-6 md:px-12 py-12 text-white"
        style={{ background: '#0A192F' }}
      >
        <p className="font-jakarta font-extrabold text-2xl">{store.shopName}</p>
        <p className="font-jakarta text-sm text-white/60 mt-1">
          {tc?.footerAbout || store.description || 'Your trusted property partner'}
        </p>
        {(tc?.openingHours || store.openingHours) && (
          <p className="font-jakarta text-sm text-white/60 mt-1">{tc?.openingHours || store.openingHours}</p>
        )}
      </footer>

      {/* ── Contact Modal ── */}
      {contactOpen && selectedProperty && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setContactOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setContactOpen(false)}
              className="absolute top-4 right-4 text-[#718096] hover:text-[#1A202C] transition cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h3 className="font-jakarta font-bold text-2xl text-[#0A192F] mb-1">
              Schedule a Viewing
            </h3>
            <p className="font-jakarta text-sm text-[#718096] mb-5">
              {selectedProperty.name}
            </p>

            {booked ? (
              <div className="text-center py-2">
                <CalendarCheck size={32} className="mx-auto mb-2" color="#16A34A" />
                <p className="font-jakarta font-bold text-sm text-[#0A192F]">Viewing requested!</p>
                <p className="font-jakarta text-xs text-[#718096] mt-1">We&apos;ll confirm your slot shortly.</p>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {bookError && (
                  <p className="font-jakarta text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{bookError}</p>
                )}
                {loadingSlots ? (
                  <p className="font-jakarta text-xs text-[#718096]">Loading available times…</p>
                ) : slots.length === 0 ? (
                  <p className="font-jakarta text-xs text-[#718096]">No viewing times published yet — reach out on WhatsApp instead.</p>
                ) : (
                  <>
                    <select
                      value={selectedSlotId}
                      onChange={(e) => setSelectedSlotId(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl font-jakarta text-sm text-[#1A202C]"
                      style={{ border: '1px solid #E2E8F0' }}
                      aria-label="Select a viewing time"
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
                      className="w-full h-11 px-3 rounded-xl font-jakarta text-sm text-[#1A202C]"
                      style={{ border: '1px solid #E2E8F0' }}
                    />
                    <input
                      value={bookPhone}
                      onChange={(e) => setBookPhone(e.target.value)}
                      placeholder="Phone"
                      className="w-full h-11 px-3 rounded-xl font-jakarta text-sm text-[#1A202C]"
                      style={{ border: '1px solid #E2E8F0' }}
                    />
                    <button
                      onClick={handleBookSlot}
                      disabled={booking}
                      className="w-full h-12 rounded-xl text-white font-jakarta font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition disabled:opacity-60"
                      style={{ background: '#0A192F' }}
                    >
                      <CalendarCheck size={18} />
                      {booking ? 'Booking…' : isAuthenticated ? 'Book This Viewing' : 'Sign In to Book'}
                    </button>
                  </>
                )}
              </div>
            )}

            <button
              onClick={handleWhatsApp}
              className="w-full h-12 rounded-xl text-white font-jakarta font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition"
              style={{ background: '#25D366' }}
            >
              <MessageCircle size={18} />
              WhatsApp Us
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
