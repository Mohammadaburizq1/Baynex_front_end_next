import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-9 rounded-btn border bg-white text-sm text-slate-900 placeholder:text-slate-400',
              'transition-colors duration-150 outline-none',
              'focus:ring-2 focus:ring-primary-400 focus:border-primary-400',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-50',
              error ? 'border-red-400 focus:ring-red-400' : 'border-surface-200',
              prefix ? 'pl-9' : 'pl-3',
              suffix ? 'pr-9' : 'pr-3',
              className,
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-slate-400 flex items-center">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

// ── Textarea ──────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-btn border bg-white text-sm text-slate-900 placeholder:text-slate-400',
            'px-3 py-2 transition-colors duration-150 outline-none resize-none',
            'focus:ring-2 focus:ring-primary-400 focus:border-primary-400',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-red-400' : 'border-surface-200',
            className,
          )}
          rows={3}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

// ── Select ────────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-9 rounded-btn border bg-white text-sm text-slate-900 px-3',
            'transition-colors duration-150 outline-none cursor-pointer',
            'focus:ring-2 focus:ring-primary-400 focus:border-primary-400',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-red-400' : 'border-surface-200',
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';

// ── Toggle / Switch ───────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  /** Accessible name when there is no visible `label` (the switch is otherwise unnamed). */
  'aria-label'?: string;
}

export function Toggle({ checked, onChange, label, disabled, 'aria-label': ariaLabel }: ToggleProps) {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label ? undefined : ariaLabel}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1',
          checked ? 'bg-primary-500' : 'bg-slate-200',
        )}
      >
        <span className={cn(
          'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-1',
        )} />
      </button>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  );
}
