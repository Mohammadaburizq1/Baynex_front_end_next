'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resolveDashboardSlug } from '@/lib/utils/dashboard-path';

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const slug = resolveDashboardSlug();
    if (slug) {
      router.replace(`/dashboard/${encodeURIComponent(slug)}`);
      return;
    }
    router.replace('/onboarding');
  }, [router]);

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-500">Loading your store dashboard…</p>
      </div>
    </div>
  );
}
