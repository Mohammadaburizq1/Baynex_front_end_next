'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = identifier.trim();
    if (!trimmedId) {
      setError('Enter your email or phone number.');
      triggerShake();
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      triggerShake();
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { login } = await import('@/lib/api/auth');
      await login(trimmedId, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
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
      {/* Layer 2 — Aurora waves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="login-aurora-1 absolute w-[200%] h-52 -left-1/2"
          style={{
            top: '15%',
            background: 'linear-gradient(180deg, rgba(30,74,122,0.07) 0%, rgba(30,74,122,0.035) 50%, transparent 100%)',
            borderRadius: '50% 50% 0 0 / 30px',
          }}
        />
        <div
          className="login-aurora-2 absolute w-[200%] h-52 -left-1/2"
          style={{
            top: '43%',
            background: 'linear-gradient(180deg, rgba(251,191,36,0.07) 0%, rgba(251,191,36,0.035) 50%, transparent 100%)',
            borderRadius: '50% 50% 0 0 / 30px',
          }}
        />
        <div
          className="login-aurora-3 absolute w-[200%] h-52 -left-1/2"
          style={{
            top: '71%',
            background: 'linear-gradient(180deg, rgba(239,68,68,0.07) 0%, rgba(239,68,68,0.035) 50%, transparent 100%)',
            borderRadius: '50% 50% 0 0 / 30px',
          }}
        />
      </div>

      {/* Layer 3 — Mesh blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="login-blob-1 absolute w-[48vw] h-[48vw] rounded-full" style={{ left: '28%', top: '38%', background: 'radial-gradient(circle, rgba(30,74,122,0.28) 0%, rgba(30,74,122,0.07) 50%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="login-blob-2 absolute w-[40vw] h-[40vw] rounded-full" style={{ left: '78%', top: '22%', background: 'radial-gradient(circle, rgba(251,191,36,0.20) 0%, rgba(251,191,36,0.05) 50%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="login-blob-3 absolute w-[32vw] h-[32vw] rounded-full" style={{ left: '68%', top: '72%', background: 'radial-gradient(circle, rgba(239,68,68,0.16) 0%, rgba(239,68,68,0.04) 50%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="login-blob-4 absolute w-[24vw] h-[24vw] rounded-full" style={{ left: '32%', top: '62%', background: 'radial-gradient(circle, rgba(253,230,138,0.12) 0%, rgba(253,230,138,0.03) 50%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="login-blob-5 absolute w-[56vw] h-[56vw] rounded-full" style={{ left: '48%', top: '38%', background: 'radial-gradient(circle, rgba(19,47,92,0.35) 0%, rgba(19,47,92,0.09) 50%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      {/* Layer 4 — Grid + shimmer */}
      <div className="absolute inset-0 login-grid overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="login-shimmer absolute inset-y-0 w-[22vw]"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.12) 50%, transparent 100%)' }}
        />
      </div>

      {/* Layer 5 — Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: p.left,
              bottom: 0,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.opacity,
              animation: `login-particle ${p.duration} linear ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Layer 6 — Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="orb-1 absolute w-60 h-60 rounded-full" style={{ left: '18%', top: '25%', background: 'radial-gradient(circle, rgba(10,22,40,0.35) 0%, rgba(10,22,40,0.08) 50%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="orb-2 absolute w-72 h-72 rounded-full" style={{ left: '82%', top: '18%', background: 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, rgba(251,191,36,0.06) 50%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="orb-1 absolute w-60 h-60 rounded-full" style={{ left: '72%', top: '78%', background: 'radial-gradient(circle, rgba(239,68,68,0.20) 0%, rgba(239,68,68,0.05) 50%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="orb-3 absolute w-80 h-80 rounded-full" style={{ left: '28%', top: '68%', background: 'radial-gradient(circle, rgba(253,230,138,0.15) 0%, rgba(253,230,138,0.04) 50%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="orb-2 absolute w-56 h-56 rounded-full" style={{ left: '50%', top: '45%', background: 'radial-gradient(circle, rgba(19,47,92,0.30) 0%, rgba(19,47,92,0.08) 50%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* Glass card — entrance wrapper */}
      <div className="login-entrance relative z-10 w-full max-w-[420px]">
        {/* Shake wrapper */}
        <div className={shaking ? 'login-shake' : ''}>
          <div className="glass-card rounded-3xl login-card-shadow relative">

            {/* Top-edge highlight */}
            <div
              className="absolute top-0 left-0 right-0 h-px rounded-t-3xl pointer-events-none"
              style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.08))' }}
            />

            <div className="px-7 py-8">

              {/* Header */}
              <div className="flex flex-col items-center mb-7 opacity-0 animate-fade-in">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}
                >
                  {/* Shopping bag icon */}
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
                <h1 className="text-2xl font-extrabold text-center" style={{ color: '#1E1B4B' }}>
                  Welcome back
                </h1>
                <p className="mt-1.5 text-sm text-center leading-[1.45]" style={{ color: '#475569' }}>
                  Sign in to continue
                </p>
              </div>

              <form onSubmit={handleLogin} noValidate>

                {/* Email or Phone field */}
                <div className="mb-4 opacity-0 animate-fade-in animate-stagger-1">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>
                    Email or Phone
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }}>
                      {identifier.includes('@') ? (
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      ) : (
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.13 6.13l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      )}
                    </span>
                    <input
                      type="text"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="you@example.com or +60 12-345 6789"
                      disabled={loading}
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-3.5 text-sm rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] disabled:opacity-60"
                      style={{ borderColor: '#E2E8F0', background: 'rgba(255,255,255,0.92)', color: '#1E1B4B' }}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="mb-2 opacity-0 animate-fade-in animate-stagger-2">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }}>
                      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                      className="w-full pl-10 pr-11 py-3.5 text-sm rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] disabled:opacity-60"
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
                </div>

                {/* Remember me + Forgot password */}
                <div className="flex items-center justify-between h-10 mb-3 opacity-0 animate-fade-in animate-stagger-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      disabled={loading}
                      className="w-4 h-4 rounded border-slate-300 disabled:opacity-60 accent-[#6366F1]"
                    />
                    <span className="text-sm font-medium" style={{ color: '#475569' }}>Remember me</span>
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-sm font-medium transition-opacity hover:opacity-75"
                    style={{ color: '#6366F1' }}
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Error */}
                {error && (
                  <p className="mb-3 text-sm font-medium opacity-0 animate-fade-in" style={{ color: '#EF4444' }}>
                    {error}
                  </p>
                )}

                {/* Sign in button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[52px] rounded-xl text-white text-base font-bold flex items-center justify-center transition-all duration-150 hover:opacity-90 disabled:cursor-not-allowed opacity-0 animate-fade-in animate-stagger-4 hover-glow"
                  style={{ background: loading ? 'rgba(99,102,241,0.6)' : '#6366F1' }}
                >
                  {loading ? (
                    <span className="w-[22px] h-[22px] rounded-full border-[2.5px] border-white/30 border-t-white animate-spin" />
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Register link */}
              <p className="mt-5 text-center text-sm opacity-0 animate-fade-in animate-stagger-5" style={{ color: '#475569' }}>
                New to ShopLink?{' '}
                <a
                  href="/onboarding"
                  className="font-bold transition-opacity hover:opacity-75"
                  style={{ color: '#6366F1' }}
                >
                  Create account
                </a>
              </p>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
