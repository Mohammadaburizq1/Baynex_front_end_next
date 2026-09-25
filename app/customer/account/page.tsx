'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { updateCustomerProfile } from '@/lib/api/customer-auth';
import CustomerOrderHistory from '@/components/customer/CustomerOrderHistory';

export default function CustomerAccountPage() {
  const router = useRouter();
  const { user, loading, profileError, logout, refresh } = useCustomerAuth();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user && !profileError) { router.replace('/customer/login?redirect=/customer/account'); return; }
    if (user) {
      setName(user.name);
    }
  }, [loading, user, profileError, router]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (!name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError(''); setMessage('');
    try {
      await updateCustomerProfile(name.trim());
      if (await refresh()) setMessage('Profile updated.');
    }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not update your profile.'); }
    finally { setSaving(false); }
  };

  if (loading) return <main className="min-h-screen bg-surface-50 flex items-center justify-center"><p role="status" className="text-sm text-slate-500">Loading profile…</p></main>;

  if (profileError) return <main className="min-h-screen bg-surface-50 flex items-center justify-center"><div className="space-y-3 text-center">
    <p role="alert" className="text-sm text-red-600">{profileError}</p>
    <button type="button" onClick={() => { void refresh(); }} className="text-sm font-semibold text-primary-600">Try again</button>
    <button type="button" onClick={async () => { await logout(); router.push('/customer/login'); }} className="block mx-auto text-sm text-slate-500">Sign out</button>
  </div></main>;

  if (!user) return null;

  return (
    <main className="min-h-screen bg-surface-50 font-jakarta"><div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8"><div><h1 className="text-2xl font-extrabold text-slate-900">My account</h1><p className="text-sm text-slate-500 mt-1">Your profile and order history.</p></div><button type="button" onClick={async () => { await logout(); router.push('/customer/login'); }} className="text-sm font-semibold text-slate-500 hover:text-slate-700">Sign out</button></div>
      <section className="bg-white border border-surface-200 rounded-2xl p-6 mb-6"><h2 className="text-base font-bold text-slate-900 mb-4">Profile</h2><form onSubmit={saveProfile} className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">Name<input value={name} onChange={e => { setName(e.target.value); setMessage(''); }} disabled={saving} className="mt-1 w-full px-3.5 py-2.5 text-sm rounded-lg border border-surface-200" maxLength={160} /></label>
        <div className="grid grid-cols-2 gap-4 text-sm"><div><span className="text-slate-500">Email</span><p className="font-medium text-slate-900 mt-1">{user.email || 'Not set'}</p></div><div><span className="text-slate-500">Phone</span><p className="font-medium text-slate-900 mt-1">{user.phone || 'Not set'}</p></div></div>
        <p className="text-xs text-slate-500">Email and phone are read-only because they are used for account identity and verification.</p><button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary-500 disabled:opacity-50">{saving ? 'Saving…' : 'Save profile'}</button>
        {message && <p role="status" className="text-sm text-emerald-600">{message}</p>}{error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </form></section>
      <CustomerOrderHistory key={user.id} />
    </div></main>
  );
}
