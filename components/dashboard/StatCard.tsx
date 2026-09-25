import { TrendingUp, TrendingDown, ShoppingCart, DollarSign, Users, Package, Star, Clock } from 'lucide-react';
import { cn, formatChange } from '@/lib/utils';
import type { StatCardData } from '@/lib/types';

const ICONS: Record<string, React.ElementType> = {
  revenue:   DollarSign,
  orders:    ShoppingCart,
  customers: Users,
  products:  Package,
  rating:    Star,
  pending:   Clock,
};

const COLOR_CLASSES: Record<StatCardData['color'], { bg: string; icon: string; change: string }> = {
  indigo:  { bg: 'bg-primary-50',  icon: 'text-primary-600',  change: 'text-primary-600'  },
  emerald: { bg: 'bg-emerald-50',  icon: 'text-emerald-600',  change: 'text-emerald-600'  },
  amber:   { bg: 'bg-amber-50',    icon: 'text-amber-600',    change: 'text-amber-600'    },
  rose:    { bg: 'bg-rose-50',     icon: 'text-rose-600',     change: 'text-rose-600'     },
  sky:     { bg: 'bg-sky-50',      icon: 'text-sky-600',      change: 'text-sky-600'      },
  violet:  { bg: 'bg-violet-50',   icon: 'text-violet-600',   change: 'text-violet-600'   },
};

export function StatCard({ title, value, change, changeLabel, icon, color }: StatCardData) {
  const Icon = ICONS[icon] ?? DollarSign;
  const colors = COLOR_CLASSES[color];
  const positive = (change ?? 0) >= 0;

  return (
    <div className="bg-white rounded-card border border-surface-200 shadow-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', colors.bg)}>
          <Icon size={18} className={colors.icon} />
        </div>
      </div>

      <p className="text-2xl font-bold text-slate-900 mb-1.5 tabular-nums">{value}</p>

      <div className="flex items-center gap-1">
        {change !== undefined && (
          <>
            {positive
              ? <TrendingUp size={13} className="text-emerald-500 shrink-0" />
              : <TrendingDown size={13} className="text-red-500 shrink-0" />
            }
            <span className={cn('text-xs font-semibold', positive ? 'text-emerald-600' : 'text-red-600')}>
              {formatChange(change)}
            </span>
          </>
        )}
        <span className="text-xs text-slate-500">{changeLabel}</span>
      </div>
    </div>
  );
}
