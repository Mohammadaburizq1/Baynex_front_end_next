'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Mirrors the backend's password rule: >=10 chars, upper + lower + digit + special char.
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

function Shell({ children, shaking }: { children: React.ReactNode; shaking: boolean }) {
  return (
    <main
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-6 font-jakarta"
      style={{ background: 'linear-gradient(135deg, #0A1628 0%, #132F5C 40%, #1A2844 75%, #0A1628 100%)' }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="orb-1 absolute w-60 h-60 rounded-full" style={{ left: '18%', top: '25%', background: 'radial-gradient(circle, rgba(10,22,40,0.35) 0%, rgba(10,22,40,0.08) 50%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="orb-2 absolute w-72 h-72 rounded-full" style={{ left: '82%', top: '18%', background: 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, rgba(251,191,36,0.06) 50%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="orb-3 absolute w-80 h-80 rounded-full" style={{ left: '28%', top: '68%', background: 'radial-gradient(circle, rgba(253,230,138,0.15) 0%, rgba(253,230,138,0.04) 50%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>
      <div className="login-entrance relative z-10 w-full max-w-[420px]">
        <div className={shaking ? 'login-shake' : ''}>
          <div className="glass-card rounded-3xl login-card-shadow relative">
            <div
              className="absolute top-0 left-0 right-0 h-px rounded-t-3xl pointer-events-none"
              style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.08))' }}
            />
            <div className="px-7 py-8">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const triggerShake = () => {
    setShaking(false);
    setTimeout(() => {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }, 10);
  };

  if (!token) {
    return (
      <Shell shaking={false}>
        <div className="flex flex-col items-center mb-6 opacity-0 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#EF4444' }}>
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-center" style={{ color: '#1E1B4B' }}>
            Invalid invite link
          </h1>
          <p className="mt-1.5 text-sm text-center leading-[1.45]" style={{ color: '#475569' }}>
            This link is missing its invite token. Ask the store owner to resend your invite.
          </p>
        </div>
      </Shell>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!PASSWORD_RULE.test(password)) {
      setError('Password must be at least 10 characters and include uppercase, lowercase, number, and special character.');
      triggerShake();
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      triggerShake();
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { acceptStaffInvite } = await import('@/lib/api/staff');
      const { tokenStore } = await import('@/lib/api/client');
      const { getMyStores } = await import('@/lib/api/stores');

      const result = await acceptStaffInvite(token, password, fullName || undefined);
      tokenStore.set(result.accessToken, result.refreshToken);

      const stores = await getMyStores();
      const slug = stores[0]?.slug;
      router.push(slug ? `/dashboard/${slug}` : '/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'This invite link is invalid or has expired.');
      triggerShake();
      setLoading(false);
    }
  };

  return (
    <Shell shaking={shaking}>
      <div className="flex flex-col items-center mb-7 opacity-0 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-center" style={{ color: '#1E1B4B' }}>
          Join the team
        </h1>
        <p className="mt-1.5 text-sm text-center leading-[1.45]" style={{ color: '#475569' }}>
          Set your name and password to finish joining as a staff member.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4 opacity-0 animate-fade-in animate-stagger-1">
          <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>
            Your name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Full name"
            disabled={loading}
            autoComplete="name"
            autoFocus
            className="w-full pl-4 pr-4 py-3.5 text-sm rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] disabled:opacity-60"
            style={{ borderColor: '#E2E8F0', background: 'rgba(255,255,255,0.92)', color: '#1E1B4B' }}
          />
        </div>

        <div className="mb-4 opacity-0 animate-fade-in animate-stagger-2">
          <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            autoComplete="new-password"
            className="w-full pl-4 pr-4 py-3.5 text-sm rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] disabled:opacity-60"
            style={{ borderColor: '#E2E8F0', background: 'rgba(255,255,255,0.92)', color: '#1E1B4B' }}
          />
          <p className="mt-1.5 text-xs leading-[1.4]" style={{ color: '#94A3B8' }}>
            At least 10 characters, with uppercase, lowercase, a number, and a special character.
          </p>
        </div>

        <div className="mb-2 opacity-0 animate-fade-in animate-stagger-2">
          <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>
            Confirm password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            autoComplete="new-password"
            className="w-full pl-4 pr-4 py-3.5 text-sm rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] disabled:opacity-60"
            style={{ borderColor: '#E2E8F0', background: 'rgba(255,255,255,0.92)', color: '#1E1B4B' }}
          />
        </div>

        {error && (
          <p className="mb-3 mt-3 text-sm font-medium opacity-0 animate-fade-in" style={{ color: '#EF4444' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[52px] rounded-xl text-white text-base font-bold flex items-center justify-center transition-all duration-150 hover:opacity-90 disabled:cursor-not-allowed opacity-0 animate-fade-in animate-stagger-3 hover-glow mt-3"
          style={{ background: loading ? 'rgba(99,102,241,0.6)' : '#6366F1' }}
        >
          {loading ? (
            <span className="w-[22px] h-[22px] rounded-full border-[2.5px] border-white/30 border-t-white animate-spin" />
          ) : (
            'Join and sign in'
          )}
        </button>
      </form>
    </Shell>
  );
}

export default function AcceptStaffInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInviteForm />
    </Suspense>
  );
}
