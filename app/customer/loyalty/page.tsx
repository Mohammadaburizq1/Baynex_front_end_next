'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

export default function CustomerLoyaltyPage() {
  const router = useRouter();
  const { user, loading } = useCustomerAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/customer/login?redirect=/customer/loyalty');
    }
  }, [loading, user, router]);

  const checking = loading || !user;

  if (checking) {
    return (
      <main className="min-h-screen bg-surface-50 flex items-center justify-center font-jakarta">
        <span className="w-8 h-8 rounded-full border-[3px] border-primary-200 border-t-primary-500 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-50 font-jakarta">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <div className="flex items-center gap-3 mb-8">
          <a href="/customer/account" className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </a>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Loyalty points</h1>
            <p className="text-sm text-slate-500 mt-1">Hi {user?.name || 'there'} — here&apos;s your balance.</p>
          </div>
        </div>

        <section
          className="rounded-2xl p-8 mb-6 text-center"
          style={{ background: 'linear-gradient(135deg, #1E1B4B, #4338CA)' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <p className="text-4xl font-extrabold text-white">0</p>
          <p className="text-sm text-white/70 mt-1">points available</p>
        </section>

        <section className="bg-white border border-surface-200 rounded-2xl p-6">
          <h2 className="text-base font-bold text-slate-900 mb-2">Earn points on every order</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Loyalty points are coming soon — this page will show your balance and history once
            the earning and redemption rules go live. Nothing to do here yet.
          </p>
        </section>

      </div>
    </main>
  );
}
