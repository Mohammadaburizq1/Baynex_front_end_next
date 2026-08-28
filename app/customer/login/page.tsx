'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomerLoginForm from '@/components/customer/CustomerLoginForm';

// 20 static particles spread via golden-ratio to avoid clustering
const PARTICLES = Array.from({ length: 20 }, (_, i) => {
  const seed = i * 1.618;
  const colors = ['#1E4A7A', '#FBBF24', '#EF4444', '#FDE68A'];
  return {
    left: `${((seed * 17) % 100).toFixed(1)}%`,
    delay: `${((seed * 3.7) % 10).toFixed(2)}s`,
    duration: `${(6 + (i % 5) * 1.5).toFixed(1)}s`,
    size: 2 + (i % 5),
    opacity: 0.15 + (i % 4) * 0.08,
    color: colors[i % 4],
  };
});

function Background() {
  return (
    <>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="login-aurora-1 absolute w-[200%] h-52 -left-1/2" style={{ top: '15%', background: 'linear-gradient(180deg, rgba(30,74,122,0.07) 0%, rgba(30,74,122,0.035) 50%, transparent 100%)', borderRadius: '50% 50% 0 0 / 30px' }} />
        <div className="login-aurora-2 absolute w-[200%] h-52 -left-1/2" style={{ top: '43%', background: 'linear-gradient(180deg, rgba(251,191,36,0.07) 0%, rgba(251,191,36,0.035) 50%, transparent 100%)', borderRadius: '50% 50% 0 0 / 30px' }} />
        <div className="login-aurora-3 absolute w-[200%] h-52 -left-1/2" style={{ top: '71%', background: 'linear-gradient(180deg, rgba(239,68,68,0.07) 0%, rgba(239,68,68,0.035) 50%, transparent 100%)', borderRadius: '50% 50% 0 0 / 30px' }} />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="login-blob-1 absolute w-[48vw] h-[48vw] rounded-full" style={{ left: '28%', top: '38%', background: 'radial-gradient(circle, rgba(30,74,122,0.28) 0%, rgba(30,74,122,0.07) 50%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="login-blob-2 absolute w-[40vw] h-[40vw] rounded-full" style={{ left: '78%', top: '22%', background: 'radial-gradient(circle, rgba(251,191,36,0.20) 0%, rgba(251,191,36,0.05) 50%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="login-blob-3 absolute w-[32vw] h-[32vw] rounded-full" style={{ left: '68%', top: '72%', background: 'radial-gradient(circle, rgba(239,68,68,0.16) 0%, rgba(239,68,68,0.04) 50%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="login-blob-4 absolute w-[24vw] h-[24vw] rounded-full" style={{ left: '32%', top: '62%', background: 'radial-gradient(circle, rgba(253,230,138,0.12) 0%, rgba(253,230,138,0.03) 50%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="login-blob-5 absolute w-[56vw] h-[56vw] rounded-full" style={{ left: '48%', top: '38%', background: 'radial-gradient(circle, rgba(19,47,92,0.35) 0%, rgba(19,47,92,0.09) 50%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>
      <div className="absolute inset-0 login-grid overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="login-shimmer absolute inset-y-0 w-[22vw]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.12) 50%, transparent 100%)' }} />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span key={i} className="absolute rounded-full" style={{ left: p.left, bottom: 0, width: `${p.size}px`, height: `${p.size}px`, backgroundColor: p.color, opacity: p.opacity, animation: `login-particle ${p.duration} linear ${p.delay} infinite` }} />
        ))}
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="orb-1 absolute w-60 h-60 rounded-full" style={{ left: '18%', top: '25%', background: 'radial-gradient(circle, rgba(10,22,40,0.35) 0%, rgba(10,22,40,0.08) 50%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="orb-2 absolute w-72 h-72 rounded-full" style={{ left: '82%', top: '18%', background: 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, rgba(251,191,36,0.06) 50%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="orb-1 absolute w-60 h-60 rounded-full" style={{ left: '72%', top: '78%', background: 'radial-gradient(circle, rgba(239,68,68,0.20) 0%, rgba(239,68,68,0.05) 50%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="orb-3 absolute w-80 h-80 rounded-full" style={{ left: '28%', top: '68%', background: 'radial-gradient(circle, rgba(253,230,138,0.15) 0%, rgba(253,230,138,0.04) 50%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="orb-2 absolute w-56 h-56 rounded-full" style={{ left: '50%', top: '45%', background: 'radial-gradient(circle, rgba(19,47,92,0.30) 0%, rgba(19,47,92,0.08) 50%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>
    </>
  );
}

function CustomerLoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/customer/account';

  return (
    <main
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-6 font-jakarta"
      style={{ background: 'linear-gradient(135deg, #0A1628 0%, #132F5C 40%, #1A2844 75%, #0A1628 100%)' }}
    >
      <Background />
      <div className="login-entrance relative z-10 w-full max-w-[420px]">
        <div className="glass-card rounded-3xl login-card-shadow relative">
          <div
            className="absolute top-0 left-0 right-0 h-px rounded-t-3xl pointer-events-none"
            style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.08))' }}
          />
          <div className="px-7 py-8">
            <CustomerLoginForm
              onSuccess={() => router.push(redirectTo)}
              registerHref={`/customer/register?redirect=${encodeURIComponent(redirectTo)}`}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={null}>
      <CustomerLoginPageInner />
    </Suspense>
  );
}
