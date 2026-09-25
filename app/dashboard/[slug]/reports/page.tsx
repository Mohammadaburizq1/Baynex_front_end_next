'use client';

import { useState, useEffect, useMemo } from 'react';
import { Download, BarChart2, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import { Header } from '@/components/dashboard/Header';
import { SectionAccessGate } from '@/components/dashboard/SectionAccessGate';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/contexts/StoreContext';
import { formatMoney } from '@/lib/utils';
import { type Period, PERIODS, periodToRange, toIsoDate } from '@/lib/utils/report-period';
import type { ApiDailyStoreSales, ApiTopProduct } from '@/lib/api/analytics';

// ── Constants ─────────────────────────────────────────────────────────────────

const CHART_COLORS = {
  indigo:  '#6366F1',
  emerald: '#10B981',
  amber:   '#F59E0B',
  rose:    '#F43F5E',
  sky:     '#0EA5E9',
} as const;

const CATEGORY_COLORS = [
  CHART_COLORS.indigo,
  CHART_COLORS.emerald,
  CHART_COLORS.amber,
  CHART_COLORS.rose,
  CHART_COLORS.sky,
];

const TOP_PRODUCTS_LIMIT = 10;

const MEDAL = {
  1: { label: '🥇', bg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  2: { label: '🥈', bg: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
  3: { label: '🥉', bg: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' },
} as const;

// ── Date range helpers ───────────────────────────────────────────────────────

// daily-store-sales only returns a row for a day that actually had sales — a day with zero
// orders has no row at all. Fill every date in the range with 0s so the chart shows the full
// period (including real gaps) instead of a misleadingly compressed line connecting only the
// days that happened to have activity.
function buildDailySeries(from: string, to: string, rows: ApiDailyStoreSales[]) {
  const byDate = new Map(rows.map(r => [r.saleDate, r]));
  const series: { date: string; revenue: number; orders: number }[] = [];
  const cursor = new Date(from + 'T00:00:00Z');
  const end = new Date(to + 'T00:00:00Z');
  while (cursor <= end) {
    const dateStr = toIsoDate(cursor);
    const row = byDate.get(dateStr);
    series.push({ date: dateStr, revenue: row?.totalRevenue ?? 0, orders: row?.orderCount ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return series;
}

function formatAxisDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' });
}

// Unlabeled on purpose, like formatMoney(x, null) elsewhere on this page: these totals can span
// orders placed in different currencies (or pre-M1-02 orders with no recorded currency), so no
// single currency label — least of all the store's current one — would be truthful.
function formatYAxisAmount(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function CustomRevenueTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2.5 text-xs font-medium">
      <p className="text-slate-500 mb-1.5">{label && formatAxisDate(label)}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
          <span className="text-slate-600 capitalize">{entry.name}:</span>
          <span className="text-slate-900 tabular-nums">
            {entry.name === 'revenue'
              ? formatMoney(entry.value, null)
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomBarTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2.5 text-xs font-medium">
      <p className="text-slate-500 mb-1">{label && formatAxisDate(label)}</p>
      <p className="text-slate-900 tabular-nums">{payload[0].value} orders</p>
    </div>
  );
}

// ── Page Component ────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { store, storeNotSynced } = useStore();
  const { toast } = useToast();
  const [activePeriod, setActivePeriod] = useState<Period>('7 Days');
  const [dailySales, setDailySales] = useState<ApiDailyStoreSales[]>([]);
  const [topProducts, setTopProducts] = useState<ApiTopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  // A failed load is shown as an error, never as "no sales" — zero is only ever a real answer.
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [exporting, setExporting] = useState(false);

  const { from, to } = useMemo(() => periodToRange(activePeriod), [activePeriod]);
  // A local- id is a placeholder until StoreContext resolves the backend store; if that fails
  // (storeNotSynced) there is no server-side store, and so nothing real to report on.
  const isLocalStore = store.id.startsWith('local-');
  const resolvingStore = isLocalStore && !storeNotSynced;

  useEffect(() => {
    let cancelled = false;
    async function fetchAnalytics() {
      setDailySales([]);
      setTopProducts([]);
      setLoadError(null);
      if (isLocalStore) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { getDailyStoreSales, getTopProducts } = await import('@/lib/api/analytics');
        const [sales, products] = await Promise.all([
          getDailyStoreSales(store.id, from, to),
          getTopProducts(store.id, from, to, TOP_PRODUCTS_LIMIT),
        ]);
        if (!cancelled) {
          setDailySales(sales);
          setTopProducts(products);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Something went wrong.');
        }
      }
      if (!cancelled) setLoading(false);
    }
    fetchAnalytics();
    return () => { cancelled = true; };
  }, [store.id, isLocalStore, from, to, reloadKey]);

  // The file is generated by the backend for exactly this store and date range; nothing is
  // reported as done unless a real file came back.
  async function handleExportCsv() {
    setExporting(true);
    try {
      const { downloadOrdersCsv } = await import('@/lib/api/analytics');
      const { blob, filename } = await downloadOrdersCsv(store.id, from, to);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (err) {
      toast(`CSV export failed: ${err instanceof Error ? err.message : 'please try again.'}`, 'error');
    } finally {
      setExporting(false);
    }
  }

  const chartData = useMemo(() => buildDailySeries(from, to, dailySales), [from, to, dailySales]);

  const totalRevenue = dailySales.reduce((sum, r) => sum + r.totalRevenue, 0);
  const totalOrders = dailySales.reduce((sum, r) => sum + r.orderCount, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const hasSales = totalOrders > 0;

  // Derived from the same Top Products response rather than a second near-identical query —
  // grouped by category, with uncategorized/deleted-product line items honestly labeled.
  const categoryRevenue = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const p of topProducts) {
      const key = p.categoryName ?? 'Uncategorized';
      byCategory.set(key, (byCategory.get(key) ?? 0) + p.revenue);
    }
    return [...byCategory.entries()]
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [topProducts]);
  const totalCategoryRevenue = categoryRevenue.reduce((sum, c) => sum + c.revenue, 0);

  return (
    <SectionAccessGate section="REPORTS" pageTitle="Reports">
    <div className="flex flex-col min-h-full font-jakarta">
      <Header title="Reports" subtitle="Sales performance and analytics" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

        {/* ── Period selector + export ──────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1.5">
        <div
          className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl w-fit shadow-sm"
          role="tablist"
          aria-label="Report period"
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
        {/* Every figure and the CSV use UTC calendar days (daily_store_sales' convention). */}
        <p className="text-xs text-slate-500 px-1">
          {from} to {to} (UTC) · cancelled orders excluded
        </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<Download size={14} />}
          onClick={handleExportCsv}
          loading={exporting}
          disabled={exporting || loading || loadError !== null || isLocalStore || !hasSales}
          title={hasSales ? undefined : 'No orders to export in this period'}
          aria-label={`Export orders from ${from} to ${to} as CSV`}
        >
          {exporting ? 'Exporting…' : 'Export orders CSV'}
        </Button>
        </div>

        {loading || resolvingStore ? (
          <div className="flex items-center justify-center py-16" role="status" aria-label="Loading reports">
            <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
          </div>
        ) : isLocalStore ? (
          <Card padding="none">
            <EmptyState
              icon={<AlertTriangle size={28} />}
              title="Reports aren't available for this store"
              description="This store hasn't been saved to your account yet, so there are no orders to report on."
            />
          </Card>
        ) : loadError !== null ? (
          <Card padding="none">
            <EmptyState
              icon={<AlertTriangle size={28} />}
              title="Couldn't load reports"
              description={`${loadError} No figures are shown rather than showing possibly wrong ones.`}
              action={{ label: 'Try again', onClick: () => setReloadKey(k => k + 1) }}
            />
          </Card>
        ) : !hasSales ? (
          <Card padding="none">
            <EmptyState
              icon={<BarChart2 size={28} />}
              title="No sales in this period"
              description={`No orders (other than cancelled ones) were placed between ${from} and ${to}. Try a longer period, or check back once orders come in.`}
            />
          </Card>
        ) : (
        <>
        {/* ── Summary stat cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatMoney(totalRevenue, null)}
            changeLabel={`last ${activePeriod.toLowerCase()}`}
            icon="revenue"
            color="indigo"
          />
          <StatCard
            title="Total Orders"
            value={totalOrders.toString()}
            changeLabel={`last ${activePeriod.toLowerCase()}`}
            icon="orders"
            color="emerald"
          />
          <StatCard
            title="Avg Order Value"
            value={formatMoney(avgOrderValue, null)}
            changeLabel={`last ${activePeriod.toLowerCase()}`}
            icon="revenue"
            color="amber"
          />
        </div>

        {/* ── Revenue Trend chart ───────────────────────────────────────── */}
        <Card padding="md">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <Badge variant="primary">{activePeriod}</Badge>
          </CardHeader>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={CHART_COLORS.indigo} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={CHART_COLORS.indigo} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={CHART_COLORS.emerald} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={CHART_COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                dy={6}
              />

              {/* Left Y-axis: revenue */}
              <YAxis
                yAxisId="revenue"
                orientation="left"
                tickFormatter={formatYAxisAmount}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={64}
              />

              {/* Right Y-axis: orders */}
              <YAxis
                yAxisId="orders"
                orientation="right"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={32}
              />

              <Tooltip content={<CustomRevenueTooltip />} />

              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              />

              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke={CHART_COLORS.indigo}
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 4, fill: CHART_COLORS.indigo }}
              />

              <Area
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                stroke={CHART_COLORS.emerald}
                strokeWidth={2}
                strokeDasharray="5 3"
                fill="url(#ordersGradient)"
                dot={false}
                activeDot={{ r: 4, fill: CHART_COLORS.emerald }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Orders per Day + Revenue by Category ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Orders per Day */}
          <Card padding="md" className="lg:col-span-7">
            <CardHeader>
              <CardTitle>Orders per Day</CardTitle>
              <Badge variant="default">{activePeriod}</Badge>
            </CardHeader>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

                <XAxis
                  dataKey="date"
                  tickFormatter={formatAxisDate}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  dy={6}
                />

                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                  allowDecimals={false}
                />

                <Tooltip content={<CustomBarTooltip />} />

                <Bar
                  dataKey="orders"
                  fill={CHART_COLORS.indigo}
                  radius={[4, 4, 0, 0]}
                  aria-label="Orders per day bar"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue by Category — derived from the Top Products response */}
          <Card padding="md" className="lg:col-span-5">
            <CardHeader className="mb-3">
              <CardTitle>Revenue by Category</CardTitle>
              <Badge variant="default">Top {TOP_PRODUCTS_LIMIT} products</Badge>
            </CardHeader>

            {categoryRevenue.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">No category data for this period.</p>
            ) : (
              <>
                <div className="space-y-3.5" aria-label="Revenue by category breakdown">
                  {categoryRevenue.map((cat, idx) => {
                    const pct = totalCategoryRevenue > 0 ? ((cat.revenue / totalCategoryRevenue) * 100) : 0;
                    const barColor = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                    return (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">
                            {cat.category}
                          </span>
                          <span className="text-sm font-semibold text-slate-900 tabular-nums">
                            {formatMoney(cat.revenue, null)}
                          </span>
                        </div>

                        <div
                          className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuenow={Math.round(pct)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${cat.category}: ${pct.toFixed(1)}%`}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: barColor,
                            }}
                          />
                        </div>

                        <p className="text-xs text-slate-400 mt-0.5 text-right tabular-nums">
                          {pct.toFixed(1)}%
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Total (top {TOP_PRODUCTS_LIMIT} products)</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {formatMoney(totalCategoryRevenue, null)}
                  </span>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* ── Top Products table ────────────────────────────────────────── */}
        <Card padding="none">
          <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-slate-100">
            <CardTitle>Top Performing Products</CardTitle>
          </div>

          {topProducts.length === 0 ? (
            <EmptyState
              icon={<BarChart2 size={28} />}
              title="No product sales in this period"
              description="Products will show up here once they've been ordered."
            />
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Top performing products">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3 w-12">
                    #
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">
                    Product Name
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">
                    Revenue
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                    Units Sold
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3 hidden md:table-cell">
                    Avg Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, idx) => {
                  const rank = idx + 1;
                  const medal = MEDAL[rank as keyof typeof MEDAL];
                  const avgPrice = product.unitsSold > 0 ? product.revenue / product.unitsSold : 0;
                  return (
                    <tr
                      key={product.productId ?? `${product.name}-${idx}`}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      {/* Rank */}
                      <td className="px-5 py-3.5">
                        {medal ? (
                          <span
                            className={[
                              'inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm',
                              medal.bg,
                            ].join(' ')}
                            aria-label={`Rank ${rank}`}
                          >
                            {medal.label}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 text-xs font-semibold text-slate-500">
                            {rank}
                          </span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-slate-900">{product.name}</span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <Badge variant="default">{product.categoryName ?? 'Uncategorized'}</Badge>
                      </td>

                      {/* Revenue */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {formatMoney(product.revenue, null)}
                        </span>
                      </td>

                      {/* Units Sold */}
                      <td className="px-4 py-3.5 text-right hidden md:table-cell">
                        <span className="text-slate-700 tabular-nums">{product.unitsSold}</span>
                      </td>

                      {/* Avg Price */}
                      <td className="px-5 py-3.5 text-right hidden md:table-cell">
                        <span className="text-slate-500 tabular-nums">
                          {formatMoney(avgPrice, null)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </Card>
        </>
        )}

      </main>
    </div>
    </SectionAccessGate>
  );
}
