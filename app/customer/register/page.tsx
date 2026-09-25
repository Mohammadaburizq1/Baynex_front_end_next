'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

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

// Mirrors the backend's password rule: >=10 chars, upper + lower + digit + special char.
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

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

function CustomerRegisterForm() {
  const router = useRouter();
  const { register } = useCustomerAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/customer/account';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Enter your name.');
      triggerShake();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      triggerShake();
      return;
    }
    if (!PASSWORD_RULE.test(password)) {
      setError('Password must be at least 10 characters and include uppercase, lowercase, number, and special character.');
      triggerShake();
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-6 font-jakarta"
      style={{ background: 'linear-gradient(135deg, #0A1628 0%, #132F5C 40%, #1A2844 75%, #0A1628 100%)' }}
    >
      <Background />
      <div className="login-entrance relative z-10 w-full max-w-[420px]">
        <div className={shaking ? 'login-shake' : ''}>
          <div className="glass-card rounded-3xl login-card-shadow relative">
            <div
              className="absolute top-0 left-0 right-0 h-px rounded-t-3xl pointer-events-none"
              style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.08))' }}
            />
            <div className="px-7 py-8">

              <div className="flex flex-col items-center mb-7 opacity-0 animate-fade-in">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="16" y1="11" x2="22" y2="11" />
                  </svg>
                </div>
                <h1 className="text-2xl font-extrabold text-center" style={{ color: '#1E1B4B' }}>
                  Create an account
                </h1>
                <p className="mt-1.5 text-sm text-center leading-[1.45]" style={{ color: '#475569' }}>
                  Optional — view your order history and manage your profile.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3.5 opacity-0 animate-fade-in animate-stagger-1">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>
                    Full name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your name"
                    disabled={loading}
                    autoComplete="name"
                    autoFocus
                    className="w-full px-4 py-3.5 text-sm rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] disabled:opacity-60"
                    style={{ borderColor: '#E2E8F0', background: 'rgba(255,255,255,0.92)', color: '#1E1B4B' }}
                  />
                </div>

                <div className="mb-3.5 opacity-0 animate-fade-in animate-stagger-1">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                    autoComplete="email"
                    className="w-full px-4 py-3.5 text-sm rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] disabled:opacity-60"
                    style={{ borderColor: '#E2E8F0', background: 'rgba(255,255,255,0.92)', color: '#1E1B4B' }}
                  />
                </div>

                <div className="mb-3.5 opacity-0 animate-fade-in animate-stagger-2">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>
                    Phone <span className="font-normal" style={{ color: '#94A3B8' }}>(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+962 79 000 0000"
                    disabled={loading}
                    autoComplete="tel"
                    className="w-full px-4 py-3.5 text-sm rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] disabled:opacity-60"
                    style={{ borderColor: '#E2E8F0', background: 'rgba(255,255,255,0.92)', color: '#1E1B4B' }}
                  />
                </div>

                <div className="mb-2 opacity-0 animate-fade-in animate-stagger-3">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                      autoComplete="new-password"
                      className="w-full pl-4 pr-11 py-3.5 text-sm rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] disabled:opacity-60"
                      style={{ borderColor: '#E2E8F0', background: 'rgba(255,255,255,0.92)', color: '#1E1B4B' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors hover:bg-slate-100 disabled:opacity-60"
                      style={{ color: '#475569' }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <line x1="2" y1="2" x2="22" y2="22" />
                        </svg>
                      ) : (
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs leading-[1.4]" style={{ color: '#94A3B8' }}>
                    At least 10 characters, with uppercase, lowercase, a number, and a special character.
                  </p>
                </div>

                {error && (
                  <p className="mb-3 mt-3 text-sm font-medium opacity-0 animate-fade-in" style={{ color: '#EF4444' }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[52px] rounded-xl text-white text-base font-bold flex items-center justify-center transition-all duration-150 hover:opacity-90 disabled:cursor-not-allowed opacity-0 animate-fade-in animate-stagger-4 hover-glow mt-4"
                  style={{ background: loading ? 'rgba(99,102,241,0.6)' : '#6366F1' }}
                >
                  {loading ? (
                    <span className="w-[22px] h-[22px] rounded-full border-[2.5px] border-white/30 border-t-white animate-spin" />
                  ) : (
                    'Create account'
                  )}
                </button>
              </form>

              <p className="mt-5 text-center text-sm opacity-0 animate-fade-in animate-stagger-5" style={{ color: '#475569' }}>
                Already have an account?{' '}
                <a href={`/customer/login?redirect=${encodeURIComponent(redirectTo)}`} className="font-bold transition-opacity hover:opacity-75" style={{ color: '#6366F1' }}>
                  Sign in
                </a>
              </p>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense fallback={null}>
      <CustomerRegisterForm />
    </Suspense>
  );
}
