import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  rows?: number;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-md bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:200%_100%] animate-shimmer',
        className,
      )}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-card border border-surface-200 shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-3.5 w-32" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton({ rows = 3 }: SkeletonProps) {
  return (
    <div className="bg-white rounded-card border border-surface-200 shadow-card p-5 space-y-3">
      <Skeleton className="h-5 w-40" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}
