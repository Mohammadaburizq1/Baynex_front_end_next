import type { Metadata } from 'next';
import { DM_Sans, Plus_Jakarta_Sans } from 'next/font/google';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'khanGates — Store',
  description: 'Discover and order from your favourite local stores.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${dmSans.variable} ${plusJakarta.variable}`}>
      <body className="font-sans">
        <CustomerAuthProvider>{children}</CustomerAuthProvider>
      </body>
    </html>
  );
}
