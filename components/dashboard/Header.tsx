'use client';

import { Menu, Bell, ChevronDown, LogOut, User, ExternalLink, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { signOut } from '@/lib/auth/session';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { user, store, setSidebarOpen } = useStore();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setUserMenuOpen(false);
    try {
      await signOut();
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-surface-200 h-header flex items-center px-4 md:px-6 gap-3">
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-surface-100 transition-colors cursor-pointer"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        {title && (
          <h1 className="text-lg font-semibold text-slate-900 truncate">{title}</h1>
        )}
        {subtitle && (
          <p className="text-xs text-slate-500 truncate hidden sm:block">{subtitle}</p>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {actions}

        {/* Visit store link */}
        <a
          href={`/store/${store.slug}`}
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-medium text-slate-600 border border-surface-200 hover:bg-surface-50 transition-colors cursor-pointer"
        >
          <ExternalLink size={13} />
          View Store
        </a>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-lg text-slate-500 hover:bg-surface-100 transition-colors cursor-pointer"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(o => !o)}
            aria-label="User menu"
            aria-expanded={userMenuOpen}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-surface-100 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-semibold">
              {user.name.charAt(0)}
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
              {user.name}
            </span>
            <ChevronDown size={14} className={cn('text-slate-400 transition-transform', userMenuOpen && 'rotate-180')} />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
              <div className="absolute right-0 top-full mt-1.5 z-20 w-48 bg-white rounded-xl border border-surface-200 shadow-float py-1 animate-scale-in">
                <div className="px-3 py-2 border-b border-surface-200">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => { setUserMenuOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-700 hover:bg-surface-50 transition-colors cursor-pointer"
                >
                  <User size={15} className="text-slate-400" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {loggingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                  {loggingOut ? 'Logging out…' : 'Log out'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
