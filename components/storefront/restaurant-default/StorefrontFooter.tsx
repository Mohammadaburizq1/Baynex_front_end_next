import type { CuisinePreset } from '@/lib/data/cuisine-presets';

interface StorefrontFooterProps {
  storeName: string;
  openingHours: string;
  whatsappNumber: string | null;
  preset: CuisinePreset;
}

export default function StorefrontFooter({
  storeName,
  openingHours,
  whatsappNumber,
  preset,
}: StorefrontFooterProps) {
  const primary = preset.primary;
  const heading = '#0D102B';
  const body = '#6B6B78';

  return (
    <footer
      id="contact"
      style={{ backgroundColor: heading }}
      className="px-4 sm:px-6 lg:px-8 pt-12 pb-8"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                style={{ backgroundColor: `${primary}26`, borderRadius: 10 }}
                className="w-9 h-9 flex items-center justify-center flex-shrink-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
                </svg>
              </div>
              <div>
                <p style={{ color: '#fff', fontWeight: 900, fontSize: 16, margin: 0 }} className="font-sans">{storeName}</p>
                <p style={{ color: `${body}`, fontSize: 11, margin: 0 }} className="font-sans">Powered by khanGates</p>
              </div>
            </div>
            <p style={{ color: '#9CA3AF', fontSize: 13.5, lineHeight: 1.6, margin: 0 }} className="font-sans">
              Fresh food made with love. Order online or visit us in person.
            </p>
          </div>

          {/* Hours & Contact */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 800, fontSize: 14, marginBottom: 14, marginTop: 0 }} className="font-sans">
              Hours & Contact
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{ color: '#D1D5DB', fontSize: 13 }} className="font-sans">{openingHours}</span>
              </div>
              {whatsappNumber && (
                <div className="flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                  <span style={{ color: '#D1D5DB', fontSize: 13 }} className="font-sans">{whatsappNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 800, fontSize: 14, marginBottom: 14, marginTop: 0 }} className="font-sans">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2.5">
              {/* Only sections this page actually has (no reservations/about pages exist). */}
              {([['Home', '#'], ['Menu', '#menu'], ['Contact', '#contact']] as const).map(([link, href]) => (
                <a
                  key={link}
                  href={href}
                  style={{ color: '#9CA3AF', fontSize: 13, textDecoration: 'none' }}
                  className="font-sans hover:text-white transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid #374151', paddingTop: 24 }} className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p style={{ color: '#6B7280', fontSize: 12.5, margin: 0 }} className="font-sans">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <p style={{ color: '#6B7280', fontSize: 12.5, margin: 0 }} className="font-sans">
            Powered by{' '}
            <span style={{ color: primary, fontWeight: 700 }}>khanGates</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
