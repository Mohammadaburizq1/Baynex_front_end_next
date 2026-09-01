'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Lightbulb, TrendingUp, TrendingDown, Trophy, CalendarDays,
  Users, AlertTriangle, CheckCircle2, Sparkles,
} from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStore } from '@/contexts/StoreContext';
import { formatCurrency, formatDate, BUSINESS_TYPES_WITH_STOCK, LOW_STOCK_THRESHOLD } from '@/lib/utils';
import { type Period, PERIODS, periodToRange, previousPeriodRange } from '@/lib/utils/report-period';
import type { ApiDailyStoreSales, ApiTopProduct } from '@/lib/api/analytics';
import type { ApiCustomerSummary } from '@/lib/api/customers';
import type { ApiProduct } from '@/lib/api/products';

// ── Insight computation ──────────────────────────────────────────────────────
// Every insight here is a plain-language read of data that already exists elsewhere in the
// dashboard (Reports, Customers, Inventory) — nothing is invented or estimated. An insight is
// simply omitted when there isn't enough real data to say something true about it.

type InsightTone = 'positive' | 'negative' | 'neutral' | 'warning';

interface Insight {
  key: string;
  icon: React.ElementType;
  tone: InsightTone;
  headline: string;
  detail?: string;
}

const TONE_STYLES: Record<InsightTone, { bg: string; icon: string }> = {
  positive: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
  negative: { bg: 'bg-rose-50',    icon: 'text-rose-600' },
  neutral:  { bg: 'bg-indigo-50',  icon: 'text-indigo-600' },
  warning:  { bg: 'bg-amber-50',   icon: 'text-amber-600' },
};

function pctChange(current: number, previous: number): number {
  return previous > 0 ? ((current - previous) / previous) * 100 : 0;
}

function buildInsights(params: {
  currency: string;
  period: Period;
  currentSales: ApiDailyStoreSales[];
  previousSales: ApiDailyStoreSales[];
  topProducts: ApiTopProduct[];
  customers: ApiCustomerSummary[];
  trackedProducts: ApiProduct[] | null; // null = this vertical doesn't track stock at all
}): Insight[] {
  const { currency, period, currentSales, previousSales, topProducts, customers, trackedProducts } = params;
  const insights: Insight[] = [];

  const currentRevenue = currentSales.reduce((s, r) => s + r.totalRevenue, 0);
  const previousRevenue = previousSales.reduce((s, r) => s + r.totalRevenue, 0);
  const currentOrders = currentSales.reduce((s, r) => s + r.orderCount, 0);
  const previousOrders = previousSales.reduce((s, r) => s + r.orderCount, 0);

  // Revenue trend
  if (previousRevenue > 0) {
    const change = pctChange(currentRevenue, previousRevenue);
    insights.push({
      key: 'revenue-trend',
      icon: change >= 0 ? TrendingUp : TrendingDown,
      tone: change >= 0 ? 'positive' : 'negative',
      headline: `Revenue is ${change >= 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)}% vs the previous ${period.toLowerCase()}`,
      detail: `${formatCurrency(currentRevenue, currency)} this period, vs ${formatCurrency(previousRevenue, currency)} before`,
    });
  } else if (currentRevenue > 0) {
    insights.push({
      key: 'revenue-trend',
      icon: Sparkles,
      tone: 'positive',
      headline: `${formatCurrency(currentRevenue, currency)} in revenue this period`,
      detail: `No sales in the previous ${period.toLowerCase()} to compare against`,
    });
  }

  // Orders trend
  if (previousOrders > 0) {
    const change = pctChange(currentOrders, previousOrders);
    insights.push({
      key: 'orders-trend',
      icon: change >= 0 ? TrendingUp : TrendingDown,
      tone: change >= 0 ? 'positive' : 'negative',
      headline: `Orders are ${change >= 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)}% vs the previous ${period.toLowerCase()}`,
      detail: `${currentOrders} order${currentOrders === 1 ? '' : 's'} this period, vs ${previousOrders} before`,
    });
  }

  // Busiest day (within the current period)
  if (currentSales.length > 0) {
    const busiest = [...currentSales].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
    insights.push({
      key: 'busiest-day',
      icon: CalendarDays,
      tone: 'neutral',
      headline: `Your busiest day was ${formatDate(busiest.saleDate)}`,
      detail: `${formatCurrency(busiest.totalRevenue, currency)} from ${busiest.orderCount} order${busiest.orderCount === 1 ? '' : 's'}`,
    });
  }

  // Best-selling product this period
  if (topProducts.length > 0) {
    const top = topProducts[0];
    insights.push({
      key: 'top-product',
      icon: Trophy,
      tone: 'positive',
      headline: `${top.name} was your best-seller this period`,
      detail: `${top.unitsSold} unit${top.unitsSold === 1 ? '' : 's'} sold, ${formatCurrency(top.revenue, currency)} in revenue`,
    });
  }

  // Repeat customers — all-time (customer summaries aren't period-scoped), labeled honestly as such
  if (customers.length > 0) {
    const repeatCount = customers.filter(c => c.orderCount > 1).length;
    const pct = (repeatCount / customers.length) * 100;
    insights.push({
      key: 'repeat-customers',
      icon: Users,
      tone: repeatCount > 0 ? 'positive' : 'neutral',
      headline: repeatCount > 0
        ? `${repeatCount} of ${customers.length} customers (${pct.toFixed(0)}%) have ordered more than once`
        : `All ${customers.length} of your customers so far have ordered exactly once`,
      detail: 'All time, not limited to the selected period',
    });
  }

  // Stock health — only for verticals that track stock at all, all-time snapshot
  if (trackedProducts !== null) {
    const outOfStock = trackedProducts.filter(p => p.stock !== null && p.stock <= 0).length;
    const lowStock = trackedProducts.filter(p => p.stock !== null && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length;
    if (outOfStock > 0) {
      insights.push({
        key: 'stock-out',
        icon: AlertTriangle,
        tone: 'negative',
        headline: `${outOfStock} product${outOfStock === 1 ? ' is' : 's are'} out of stock`,
        detail: 'Check Inventory to restock',
      });
    }
    if (lowStock > 0) {
      insights.push({
        key: 'stock-low',
        icon: AlertTriangle,
        tone: 'warning',
        headline: `${lowStock} product${lowStock === 1 ? ' is' : 's are'} running low (≤${LOW_STOCK_THRESHOLD} left)`,
        detail: 'Check Inventory before you run out',
      });
    }
    if (outOfStock === 0 && lowStock === 0 && trackedProducts.length > 0) {
      insights.push({
        key: 'stock-healthy',
        icon: CheckCircle2,
        tone: 'positive',
        headline: 'All your products are well-stocked',
        detail: undefined,
      });
    }
  }

  return insights;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const { store, businessType } = useStore();
  const [activePeriod, setActivePeriod] = useState<Period>('7 Days');
  const [currentSales, setCurrentSales] = useState<ApiDailyStoreSales[]>([]);
  const [previousSales, setPreviousSales] = useState<ApiDailyStoreSales[]>([]);
  const [topProducts, setTopProducts] = useState<ApiTopProduct[]>([]);
  const [customers, setCustomers] = useState<ApiCustomerSummary[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const tracksStock = BUSINESS_TYPES_WITH_STOCK[businessType] ?? false;
  const { from, to } = useMemo(() => periodToRange(activePeriod), [activePeriod]);
  const prevRange = useMemo(() => previousPeriodRange(activePeriod), [activePeriod]);

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      if (store.id.startsWith('local-')) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [{ getDailyStoreSales, getTopProducts }, { getCustomerSummaries }, { getProducts }] = await Promise.all([
          import('@/lib/api/analytics'),
          import('@/lib/api/customers'),
          import('@/lib/api/products'),
        ]);
        const [current, previous, products_, custs, prods] = await Promise.all([
          getDailyStoreSales(store.id, from, to),
          getDailyStoreSales(store.id, prevRange.from, prevRange.to),
          getTopProducts(store.id, from, to, 10),
          getCustomerSummaries(store.id),
          tracksStock ? getProducts(store.id) : Promise.resolve<ApiProduct[]>([]),
        ]);
        if (cancelled) return;
        setCurrentSales(current);
        setPreviousSales(previous);
        setTopProducts(products_);
        setCustomers(custs);
        setProducts(prods);
      } catch {
        if (!cancelled) {
          setCurrentSales([]);
          setPreviousSales([]);
          setTopProducts([]);
          setCustomers([]);
          setProducts([]);
        }
      }
      if (!cancelled) setLoading(false);
    }
    fetchAll();
    return () => { cancelled = true; };
  }, [store.id, from, to, prevRange.from, prevRange.to, tracksStock]);

  const insights = useMemo(
    () => buildInsights({
      currency: store.currency,
      period: activePeriod,
      currentSales,
      previousSales,
      topProducts,
      customers,
      trackedProducts: tracksStock ? products : null,
    }),
    [store.currency, activePeriod, currentSales, previousSales, topProducts, customers, products, tracksStock],
  );

  return (
    <div className="flex flex-col min-h-full font-jakarta">
      <Header title="Insights" subtitle="Plain-language observations from your real data" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

        {/* ── Period selector — same ranges as Reports, so the two stay consistent ── */}
        <div
          className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl w-fit shadow-sm"
          role="tablist"
          aria-label="Insights period"
        >
          {PERIODS.map((period) => {
            const isActive = activePeriod === period;
            return (
              <button
                key={period}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActivePeriod(period)}
                className={[
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1',
                  'cursor-pointer select-none',
                  isActive
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50',
                ].join(' ')}
              >
                {period}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
          </div>
        ) : insights.length === 0 ? (
          <Card padding="none">
            <EmptyState
              icon={<Lightbulb size={28} />}
              title="Not enough data yet"
              description="Once you have some real orders, Insights will start surfacing plain-language observations about how your store is doing."
            />
          </Card>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {insights.map(insight => {
              const Icon = insight.icon;
              const style = TONE_STYLES[insight.tone];
              return (
                <Card key={insight.key} padding="md">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                      <Icon size={18} className={style.icon} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{insight.headline}</p>
                      {insight.detail && (
                        <p className="text-xs text-slate-500 mt-0.5">{insight.detail}</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
