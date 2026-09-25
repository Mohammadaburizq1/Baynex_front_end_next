'use client';

import { useState } from 'react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

interface CustomerLoginFormProps {
  /** Called after a successful sign-in. Caller decides what happens next
   *  (redirect, close a modal, resume a pending action, etc). */
  onSuccess: () => void;
  /** Where the "Create an account" link should send the customer, with this
   *  form's redirect intent preserved. */
  registerHref?: string;
  showHeading?: boolean;
}

export default function CustomerLoginForm({
  onSuccess,
  registerHref = '/customer/register',
  showHeading = true,
}: CustomerLoginFormProps) {
  const { login } = useCustomerAuth();

  const [email, setEmail] = useState('');
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
      await login(trimmedEmail, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={shaking ? 'login-shake' : ''}>
      {showHeading && (
        <div className="flex flex-col items-center mb-7">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-center" style={{ color: '#1E1B4B' }}>
            Sign in
          </h1>
          <p className="mt-1.5 text-sm text-center leading-[1.45]" style={{ color: '#475569' }}>
            You don&apos;t need an account to shop — sign in only if you want to view your profile or order history.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
            autoComplete="username"
            autoFocus
            className="w-full px-4 py-3.5 text-sm rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] disabled:opacity-60"
            style={{ borderColor: '#E2E8F0', background: 'rgba(255,255,255,0.92)', color: '#1E1B4B' }}
          />
        </div>

        <div className="mb-3">
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
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors hover:bg-slate-100 disabled:opacity-60 cursor-pointer"
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

        <div className="h-6 mb-2 flex items-center justify-end">
          <a href="/customer/forgot-password" className="text-sm font-medium transition-opacity hover:opacity-75" style={{ color: '#6366F1' }}>
            Forgot password?
          </a>
        </div>

        {error && (
          <p className="mb-3 text-sm font-medium" style={{ color: '#EF4444' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[52px] rounded-xl text-white text-base font-bold flex items-center justify-center transition-all duration-150 hover:opacity-90 disabled:cursor-not-allowed cursor-pointer"
          style={{ background: loading ? 'rgba(99,102,241,0.6)' : '#6366F1' }}
        >
          {loading ? (
            <span className="w-[22px] h-[22px] rounded-full border-[2.5px] border-white/30 border-t-white animate-spin" />
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-sm" style={{ color: '#475569' }}>
        New here?{' '}
        <a href={registerHref} className="font-bold transition-opacity hover:opacity-75" style={{ color: '#6366F1' }}>
          Create an account
        </a>
      </p>
    </div>
  );
}
