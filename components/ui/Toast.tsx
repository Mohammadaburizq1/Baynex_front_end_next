'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle size={16} />,
  error:   <XCircle size={16} />,
  warning: <AlertCircle size={16} />,
  info:    <Info size={16} />,
};

const styles: Record<ToastType, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
};

const iconStyles: Record<ToastType, string> = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-blue-500',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const success = useCallback((m: string) => toast(m, 'success'), [toast]);
  const error   = useCallback((m: string) => toast(m, 'error'),   [toast]);
  const warning = useCallback((m: string) => toast(m, 'warning'), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-float',
              'animate-slide-up text-sm font-medium',
              styles[t.type],
            )}
          >
            <span className={cn('mt-0.5 shrink-0', iconStyles[t.type])}>{icons[t.type]}</span>
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              aria-label="Dismiss"
              className="shrink-0 mt-0.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
