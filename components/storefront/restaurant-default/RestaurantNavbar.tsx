'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import type { CuisinePreset } from '@/lib/data/cuisine-presets';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

interface RestaurantNavbarProps {
  storeName: string;
  preset: CuisinePreset;
  cartCount: number;
  onCart: () => void;
}

// Only sections this page actually has; each link scrolls to it.
const NAV_LINKS: [string, string | null][] = [['Home', null], ['Menu', 'menu'], ['Contact', 'contact']];

function scrollToSection(id: string | null) {
  if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function RestaurantNavbar({
  storeName,
  preset,
  cartCount,
  onCart,
}: RestaurantNavbarProps) {
  const [activeLink, setActiveLink] = useState('Home');
  const { user, isAuthenticated } = useCustomerAuth();
  const pathname = usePathname();

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

            {/* Login / account CTA */}
            <a
              href={isAuthenticated ? '/customer/account' : `/customer/login?redirect=${encodeURIComponent(pathname)}`}
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
                display: 'inline-flex',
                alignItems: 'center',
              }}
              className="font-sans transition-opacity hover:opacity-90"
            >
              {isAuthenticated ? (user?.name?.split(' ')[0] || 'Account') : 'Login'}
            </a>
          </div>
        </div>

        {/* Nav links row */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-0 h-[24px] mb-1 min-w-max sm:justify-center">
            {NAV_LINKS.map(([link, target]) => (
              <button
                key={link}
                onClick={() => { setActiveLink(link); scrollToSection(target); }}
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
