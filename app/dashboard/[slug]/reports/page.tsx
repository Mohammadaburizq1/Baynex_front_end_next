'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
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
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import {
  mockSalesData,
  mockCategoryRevenue,
  mockReportSummary,
} from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';

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

type Period = '7 Days' | '30 Days' | '3 Months' | '1 Year';
const PERIODS: Period[] = ['7 Days', '30 Days', '3 Months', '1 Year'];

const TOP_PRODUCTS = [
  { rank: 1, name: 'Double Smash Burger',  category: 'Burgers',  revenue: 945.00,  orders: 50, avgPrice: 18.90 },
  { rank: 2, name: 'BBQ Chicken Pizza',    category: 'Pizzas',   revenue: 834.90,  orders: 31, avgPrice: 26.90 },
  { rank: 3, name: 'Classic Beef Burger',  category: 'Burgers',  revenue: 742.80,  orders: 58, avgPrice: 12.90 },
  { rank: 4, name: 'Margherita Pizza',     category: 'Pizzas',   revenue: 618.30,  orders: 27, avgPrice: 22.90 },
  { rank: 5, name: 'Chocolate Lava Cake',  category: 'Desserts', revenue: 445.50,  orders: 45, avgPrice: 9.90  },
] as const;

const MEDAL = {
  1: { label: '🥇', bg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  2: { label: '🥈', bg: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
  3: { label: '🥉', bg: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' },
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatAxisDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' });
}

function formatYAxisCurrency(value: number): string {
  if (value >= 1000) return `RM ${(value / 1000).toFixed(1)}k`;
  return `RM ${value}`;
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
              ? `RM ${entry.value.toFixed(2)}`
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
  const [activePeriod, setActivePeriod] = useState<Period>('7 Days');
  const { toast } = useToast();

  const totalCategoryRevenue = mockCategoryRevenue.reduce(
    (sum, c) => sum + c.revenue,
    0,
  );

  return (
    <div className="flex flex-col min-h-full font-jakarta">
      <Header title="Reports" subtitle="Sales performance and analytics" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

        {/* ── Period selector ───────────────────────────────────────────── */}
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

        {/* ── Summary stat cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(mockReportSummary.totalRevenue)}
            change={mockReportSummary.revenueChange}
            changeLabel="vs last period"
            icon="revenue"
            color="indigo"
          />
          <StatCard
            title="Total Orders"
            value={mockReportSummary.totalOrders.toString()}
            change={mockReportSummary.ordersChange}
            changeLabel="vs last period"
            icon="orders"
            color="emerald"
          />
          <StatCard
            title="Avg Order Value"
            value={formatCurrency(mockReportSummary.avgOrderValue)}
            change={mockReportSummary.avgOrderChange}
            changeLabel="vs last period"
            icon="revenue"
            color="amber"
          />
          <StatCard
            title="Total Customers"
            value={mockReportSummary.totalCustomers.toString()}
            change={mockReportSummary.customersChange}
            changeLabel="vs last period"
            icon="customers"
            color="sky"
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
              data={mockSalesData}
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
                tickFormatter={formatYAxisCurrency}
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
                data={mockSalesData}
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

          {/* Revenue by Category */}
          <Card padding="md" className="lg:col-span-5">
            <CardHeader className="mb-3">
              <CardTitle>Revenue by Category</CardTitle>
            </CardHeader>

            <div className="space-y-3.5" aria-label="Revenue by category breakdown">
              {mockCategoryRevenue.map((cat, idx) => {
                const pct = ((cat.revenue / totalCategoryRevenue) * 100).toFixed(1);
                const barColor = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">
                        {cat.category}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(cat.revenue)}
                      </span>
                    </div>

                    <div
                      className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={cat.percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${cat.category}: ${cat.percentage}%`}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5 text-right tabular-nums">
                      {pct}%
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total</span>
              <span className="text-sm font-bold text-slate-900 tabular-nums">
                {formatCurrency(totalCategoryRevenue)}
              </span>
            </div>
          </Card>
        </div>

        {/* ── Top Products table ────────────────────────────────────────── */}
        <Card padding="none">
          <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-slate-100">
            <CardTitle>Top Performing Products</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              icon={<Download size={14} />}
              onClick={() => toast('Export feature coming soon', 'info')}
              aria-label="Export CSV"
            >
              Export CSV
            </Button>
          </div>

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
                    Orders
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3 hidden md:table-cell">
                    Avg Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {TOP_PRODUCTS.map((product) => {
                  const medal = MEDAL[product.rank as keyof typeof MEDAL];
                  return (
                    <tr
                      key={product.rank}
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
                            aria-label={`Rank ${product.rank}`}
                          >
                            {medal.label}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 text-xs font-semibold text-slate-500">
                            {product.rank}
                          </span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-slate-900">{product.name}</span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <Badge variant="default">{product.category}</Badge>
                      </td>

                      {/* Revenue */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {formatCurrency(product.revenue)}
                        </span>
                      </td>

                      {/* Orders */}
                      <td className="px-4 py-3.5 text-right hidden md:table-cell">
                        <span className="text-slate-700 tabular-nums">{product.orders}</span>
                      </td>

                      {/* Avg Price */}
                      <td className="px-5 py-3.5 text-right hidden md:table-cell">
                        <span className="text-slate-500 tabular-nums">
                          {formatCurrency(product.avgPrice)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── Export row ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end pb-2">
          <Button
            variant="secondary"
            icon={<Download size={15} />}
            onClick={() => toast('PDF export coming soon', 'info')}
            aria-label="Download PDF report"
          >
            Download Report
          </Button>
        </div>

      </main>
    </div>
  );
}
