'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
}

export default function CustomerAccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useCustomerAuth();

  const [cards, setCards] = useState<SavedCard[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardError, setCardError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/customer/login?redirect=/customer/account');
    }
  }, [loading, user, router]);

  const checking = loading || !user;

  const handleLogout = async () => {
    await logout();
    router.push('/customer/login');
  };

  const detectBrand = (digits: string): string => {
    if (digits.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(digits)) return 'Mastercard';
    if (/^3[47]/.test(digits)) return 'Amex';
    return 'Card';
  };

  const formatCardNumber = (value: string) =>
    value.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 12 || digits.length > 19) {
      setCardError('Enter a valid card number.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      setCardError('Enter expiry as MM/YY.');
      return;
    }
    if (!/^\d{3,4}$/.test(cardCvv)) {
      setCardError('Enter a valid CVV.');
      return;
    }
    // UI placeholder only — no payment processor wired up yet. The raw number never
    // leaves this component and is never sent anywhere; only brand/last4/expiry are
    // kept. Once a real processor is chosen, this becomes a client-side tokenization
    // call (e.g. Stripe Elements / SetupIntent) and the backend only ever sees a token.
    setCards(prev => [...prev, { id: crypto.randomUUID(), brand: detectBrand(digits), last4: digits.slice(-4), expiry: cardExpiry }]);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardError('');
    setShowAddCard(false);
  };

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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">My account</h1>
            <p className="text-sm text-slate-500 mt-1">Profile, payment methods, and orders.</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>

        {/* Profile */}
        <section className="bg-white border border-surface-200 rounded-2xl p-6 mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Profile</h2>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
              {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-900">{user?.name || 'No name set'}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{user?.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{user?.email || '—'}</dd>
            </div>
          </dl>
        </section>

        {/* Payment methods */}
        <section className="bg-white border border-surface-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Payment methods</h2>
            {!showAddCard && (
              <button
                type="button"
                onClick={() => setShowAddCard(true)}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
              >
                + Add card
              </button>
            )}
          </div>

          {cards.length === 0 && !showAddCard && (
            <p className="text-sm text-slate-500 py-2">No payment methods saved yet.</p>
          )}

          {cards.length > 0 && (
            <ul className="space-y-2 mb-2">
              {cards.map(card => (
                <li key={card.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-surface-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-6 rounded bg-slate-900 flex items-center justify-center text-[9px] font-bold text-white tracking-wide">
                      {card.brand.slice(0, 4).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-900">•••• {card.last4}</span>
                    <span className="text-xs text-slate-400">Exp {card.expiry}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCards(prev => prev.filter(c => c.id !== card.id))}
                    className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showAddCard && (
            <form onSubmit={handleAddCard} className="mt-2 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Card number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="4242 4242 4242 4242"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Expiry</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">CVV</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              {cardError && <p className="text-xs font-medium text-red-500">{cardError}</p>}
              <p className="text-xs text-slate-400 leading-relaxed">
                Preview only — no payment processor is connected yet, so nothing is actually charged or stored.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 transition-colors cursor-pointer"
                >
                  Save card
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddCard(false); setCardError(''); }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-surface-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        <a
          href="/customer/loyalty"
          className="flex items-center justify-between bg-white border border-surface-200 rounded-2xl p-6 hover:border-primary-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Loyalty points</p>
              <p className="text-xs text-slate-500">View your balance</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>

      </div>
    </main>
  );
}
