'use client';

import { useEffect, useState } from 'react';
import { loadLocalStorefront } from '@/lib/utils/local-storefront';
import type { StorefrontData } from '@/lib/types/store';
import { StorefrontRenderer } from '@/components/storefront/StorefrontRenderer';
import StoreNotFound from '@/app/store/[slug]/not-found';

interface LocalStorefrontLoaderProps {
  slug: string;
}

export function LocalStorefrontLoader({ slug }: LocalStorefrontLoaderProps) {
  const [data, setData] = useState<StorefrontData | null | undefined>(undefined);

  useEffect(() => {
    setData(loadLocalStorefront(slug));
  }, [slug]);

  if (data === undefined) {
    return (
      <div className="min-h-screen bg-[#FBF8F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#9B7060] border-t-transparent animate-spin" />
          <p className="text-sm text-[#9B7060] font-medium">Loading store…</p>
        </div>
      </div>
    );
  }

  if (!data) return <StoreNotFound />;

  return <StorefrontRenderer data={data} />;
}
