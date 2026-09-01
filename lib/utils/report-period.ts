// Shared by the Reports and Insights pages so both agree on exactly what "7 Days" etc. mean —
// and so period-over-period comparisons (Insights) use a genuinely equal-length prior window,
// not an approximation.

export type Period = '7 Days' | '30 Days' | '3 Months' | '1 Year';
export const PERIODS: Period[] = ['7 Days', '30 Days', '3 Months', '1 Year'];

export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function periodToRange(period: Period): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  switch (period) {
    case '7 Days':   from.setDate(from.getDate() - 6); break;
    case '30 Days':  from.setDate(from.getDate() - 29); break;
    case '3 Months': from.setMonth(from.getMonth() - 3); break;
    case '1 Year':   from.setFullYear(from.getFullYear() - 1); break;
  }
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

// The window immediately preceding periodToRange(period), with exactly the same number of days
// — computed from actual elapsed days rather than re-applying the same calendar-based step, so
// "3 Months" (which isn't exactly 90 days every time) still compares like-for-like.
export function previousPeriodRange(period: Period): { from: string; to: string } {
  const { from, to } = periodToRange(period);
  const fromDate = new Date(from + 'T00:00:00Z');
  const toDate = new Date(to + 'T00:00:00Z');
  const dayCount = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;

  const prevTo = new Date(fromDate);
  prevTo.setUTCDate(prevTo.getUTCDate() - 1);
  const prevFrom = new Date(prevTo);
  prevFrom.setUTCDate(prevFrom.getUTCDate() - (dayCount - 1));

  return { from: toIsoDate(prevFrom), to: toIsoDate(prevTo) };
}
