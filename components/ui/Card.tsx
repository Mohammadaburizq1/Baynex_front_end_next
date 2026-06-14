import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const paddingClasses = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

export function Card({ padding = 'md', hover, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-card border border-surface-200 shadow-card',
        hover && 'transition-shadow duration-150 hover:shadow-card-md cursor-pointer',
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-base font-semibold text-slate-900', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-slate-500', className)} {...props}>
      {children}
    </p>
  );
}
