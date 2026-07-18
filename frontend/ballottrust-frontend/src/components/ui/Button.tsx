import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'outline';

type ButtonSize =
  | 'sm'
  | 'md'
  | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export default function Button({
  children,
  loading = false,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'rounded-xl font-semibold transition-all duration-200',
        'disabled:opacity-60 disabled:cursor-not-allowed',

        // Sizes
        size === 'sm' && 'px-3 py-2 text-sm',
        size === 'md' && 'px-6 py-3',
        size === 'lg' && 'px-8 py-4 text-lg',

        // Variants
        variant === 'primary' &&
          'bg-blue-600 hover:bg-blue-700 text-white',

        variant === 'secondary' &&
          'bg-slate-200 hover:bg-slate-300 text-slate-900',

        variant === 'success' &&
          'bg-green-600 hover:bg-green-700 text-white',

        variant === 'danger' &&
          'bg-red-600 hover:bg-red-700 text-white',

        variant === 'outline' &&
          'border border-slate-300 hover:bg-slate-100 text-slate-700',

        className,
      )}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}