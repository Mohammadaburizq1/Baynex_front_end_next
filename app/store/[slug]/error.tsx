'use client';

import { useEffect } from 'react';

interface StorefrontErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StorefrontError({ error, reset }: StorefrontErrorProps) {
  useEffect(() => {
    console.error('Storefront failed to load', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FBF8F5] flex flex-col items-center justify-center gap-4 px-4 font-sans">
      <h1 className="text-[28px] font-black text-[#0D102B] text-center m-0">
        Store temporarily unavailable
      </h1>
      <p className="text-[#6B6B78] text-center max-w-sm m-0">
        We could not load this store right now. Please try again in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 px-6 py-3 rounded-[12px] bg-[#F5A142] text-white font-extrabold text-sm hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
