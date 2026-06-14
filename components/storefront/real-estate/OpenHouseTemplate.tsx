'use client';

import { useState } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import {
  Phone,
  MessageCircle,
  ChevronDown,
  X,
  Bed,
  Bath,
  Building2,
} from 'lucide-react';

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

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedProperty, setSelectedProperty] = useState<PublicProduct | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

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
            Property Listings
          </p>
          <h1 className="font-jakarta font-extrabold text-5xl md:text-6xl text-white leading-none">
            {store.shopName}
          </h1>
          <p className="font-jakarta text-lg text-white/70 mt-4">
            {store.description || 'Find your perfect property'}
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
          {store.description || 'Your trusted property partner'}
        </p>
        {store.openingHours && (
          <p className="font-jakarta text-sm text-white/60 mt-1">{store.openingHours}</p>
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
