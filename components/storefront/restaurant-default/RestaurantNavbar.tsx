'use client';

import { useState } from 'react';
import type { CuisinePreset } from '@/lib/data/cuisine-presets';

interface RestaurantNavbarProps {
  storeName: string;
  preset: CuisinePreset;
  cartCount: number;
  onCart: () => void;
}

const NAV_LINKS = ['Home', 'Menu', 'Reservation', 'Contact', 'About', 'Blog'];

export default function RestaurantNavbar({
  storeName,
  preset,
  cartCount,
  onCart,
}: RestaurantNavbarProps) {
  const [activeLink, setActiveLink] = useState('Home');

  const heading = '#0D102B';
  const body = '#6B6B78';
  const primary = preset.primary;
  const bg = preset.background;

  return (
    <header
      style={{ backgroundColor: bg, borderBottom: `1px solid ${primary}22` }}
      className="sticky top-0 z-50 shadow-sm"
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        {/* Top row: logo + actions */}
        <div className="flex items-center h-[56px]">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              style={{ backgroundColor: `${primary}26`, borderRadius: 10 }}
              className="w-9 h-9 flex items-center justify-center flex-shrink-0"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                <path d="M7 2v20" />
                <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
              </svg>
            </div>
            <div className="leading-none">
              <div
                style={{ color: heading, fontWeight: 900, fontSize: 17 }}
                className="font-sans"
              >
                {storeName}
              </div>
              <div
                style={{ color: body, fontWeight: 600, fontSize: 11 }}
                className="font-sans"
              >
                Foodie
              </div>
            </div>
          </div>

          <div className="flex-1" />

          {/* Action icons */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
              aria-label="Search"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={heading}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.85 }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Cart with badge */}
            <button
              onClick={onCart}
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
              aria-label="Cart"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={heading}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.85 }}
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span
                  style={{ backgroundColor: primary }}
                  className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-white text-[10px] font-extrabold px-1"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Favorites */}
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
              aria-label="Favorites"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={heading}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.85 }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {/* Login CTA */}
            <button
              style={{
                backgroundColor: primary,
                color: '#fff',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 13,
                padding: '0 18px',
                height: 44,
                border: 'none',
                cursor: 'pointer',
                marginLeft: 4,
              }}
              className="font-sans transition-opacity hover:opacity-90"
            >
              Login
            </button>
          </div>
        </div>

        {/* Nav links row */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-0 h-[24px] mb-1 min-w-max sm:justify-center">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => setActiveLink(link)}
                className="flex flex-col items-center justify-center px-2.5 rounded-lg hover:bg-black/5 transition-colors"
                style={{ height: 24 }}
              >
                <span
                  style={{
                    color: `${heading}${activeLink === link ? 'ff' : 'b8'}`,
                    fontWeight: 600,
                    fontSize: 12.5,
                  }}
                  className="font-sans"
                >
                  {link}
                </span>
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    backgroundColor: activeLink === link ? primary : 'transparent',
                    display: 'block',
                    marginTop: 2,
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
