'use client';

import { useState } from 'react';
import type { AdminUser } from '@/lib/api/admin-auth';

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

type Step = 'credentials' | 'mfa' | 'done';

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

export default function AdminLoginPage() {
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [challengeToken, setChallengeToken] = useState('');
  const [user, setUser] = useState<AdminUser | null>(null);
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

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Enter a valid email address.');
      triggerShake();
      return;
    }
    if (!password) {
      setError('Enter your password.');
      triggerShake();
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { adminLogin } = await import('@/lib/api/admin-auth');
      const result = await adminLogin(trimmedEmail, password);
      if (result.status === 'mfa-required') {
        setChallengeToken(result.challengeToken);
        setStep('mfa');
      } else {
        setUser(result.user);
        setStep('done');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(mfaCode)) {
      setError('Enter the 6-digit code from your authenticator app.');
      triggerShake();
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { adminVerifyMfa } = await import('@/lib/api/admin-auth');
      const verifiedUser = await adminVerifyMfa(challengeToken, mfaCode);
      setUser(verifiedUser);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code.');
      setMfaCode('');
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

              {step === 'credentials' && (
                <>
                  <div className="flex flex-col items-center mb-7 opacity-0 animate-fade-in">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #1E1B4B, #4338CA)' }}>
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4Z" />
                      </svg>
                    </div>
                    <h1 className="text-2xl font-extrabold text-center" style={{ color: '#1E1B4B' }}>
                      Admin sign in
                    </h1>
                    <p className="mt-1.5 text-sm text-center leading-[1.45]" style={{ color: '#475569' }}>
                      Platform administration — restricted access.
                    </p>
                  </div>

                  <form onSubmit={handleCredentialsSubmit} noValidate>
                    <div className="mb-4 opacity-0 animate-fade-in animate-stagger-1">
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="admin@shoplink.app"
                        disabled={loading}
                        autoComplete="username"
                        autoFocus
                        className="w-full px-4 py-3.5 text-sm rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] disabled:opacity-60"
                        style={{ borderColor: '#E2E8F0', background: 'rgba(255,255,255,0.92)', color: '#1E1B4B' }}
                      />
                    </div>

                    <div className="mb-3 opacity-0 animate-fade-in animate-stagger-2">
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
                          autoComplete="current-password"
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
                    </div>

                    <div className="h-6 mb-2 flex items-center justify-end opacity-0 animate-fade-in animate-stagger-3">
                      <a href="/admin/forgot-password" className="text-sm font-medium transition-opacity hover:opacity-75" style={{ color: '#6366F1' }}>
                        Forgot password?
                      </a>
                    </div>

                    {error && (
                      <p className="mb-3 text-sm font-medium opacity-0 animate-fade-in" style={{ color: '#EF4444' }}>
                        {error}
                      </p>
                    )}

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

                  <p className="mt-5 text-center text-sm opacity-0 animate-fade-in animate-stagger-5" style={{ color: '#475569' }}>
                    <a href="/login" className="font-bold transition-opacity hover:opacity-75" style={{ color: '#6366F1' }}>
                      Merchant sign in instead
                    </a>
                  </p>
                </>
              )}

              {step === 'mfa' && (
                <>
                  <div className="flex flex-col items-center mb-7 opacity-0 animate-fade-in">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #1E1B4B, #4338CA)' }}>
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="11" width="14" height="9" rx="2" />
                        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                        <circle cx="12" cy="15.5" r="1.5" />
                      </svg>
                    </div>
                    <h1 className="text-2xl font-extrabold text-center" style={{ color: '#1E1B4B' }}>
                      Two-factor code
                    </h1>
                    <p className="mt-1.5 text-sm text-center leading-[1.45]" style={{ color: '#475569' }}>
                      Enter the 6-digit code from your authenticator app.
                    </p>
                  </div>

                  <form onSubmit={handleMfaSubmit} noValidate>
                    <div className="mb-4 opacity-0 animate-fade-in animate-stagger-1">
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>
                        Authentication code
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={mfaCode}
                        onChange={e => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        disabled={loading}
                        autoFocus
                        className="w-full px-4 py-3.5 text-center text-2xl tracking-[0.5em] font-bold rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] disabled:opacity-60"
                        style={{ borderColor: '#E2E8F0', background: 'rgba(255,255,255,0.92)', color: '#1E1B4B' }}
                      />
                    </div>

                    {error && (
                      <p className="mb-3 text-sm font-medium opacity-0 animate-fade-in" style={{ color: '#EF4444' }}>
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading || mfaCode.length !== 6}
                      className="w-full h-[52px] rounded-xl text-white text-base font-bold flex items-center justify-center transition-all duration-150 hover:opacity-90 disabled:cursor-not-allowed opacity-0 animate-fade-in animate-stagger-2 hover-glow"
                      style={{ background: loading || mfaCode.length !== 6 ? 'rgba(99,102,241,0.6)' : '#6366F1' }}
                    >
                      {loading ? (
                        <span className="w-[22px] h-[22px] rounded-full border-[2.5px] border-white/30 border-t-white animate-spin" />
                      ) : (
                        'Verify'
                      )}
                    </button>
                  </form>

                  <p className="mt-5 text-center text-sm opacity-0 animate-fade-in animate-stagger-3" style={{ color: '#475569' }}>
                    <button
                      type="button"
                      onClick={() => { setStep('credentials'); setError(''); setMfaCode(''); }}
                      className="font-bold transition-opacity hover:opacity-75"
                      style={{ color: '#6366F1' }}
                    >
                      Back to sign in
                    </button>
                  </p>
                </>
              )}

              {step === 'done' && user && (
                <>
                  <div className="flex flex-col items-center mb-6 opacity-0 animate-fade-in">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                    <h1 className="text-2xl font-extrabold text-center" style={{ color: '#1E1B4B' }}>
                      Welcome, {user.name || user.email}
                    </h1>
                    <p className="mt-1.5 text-sm text-center leading-[1.45]" style={{ color: '#475569' }}>
                      Signed in as <span className="font-semibold">{user.role}</span>.
                    </p>
                  </div>
                  <a
                    href="/admin/dashboard"
                    className="w-full h-[52px] rounded-xl text-white text-base font-bold flex items-center justify-center transition-all duration-150 hover:opacity-90 hover-glow"
                    style={{ background: '#6366F1' }}
                  >
                    Continue
                  </a>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
