import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;

  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'outline';

  size?: 'sm' | 'md' | 'lg';
}

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
        'rounded-xl font-medium transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50',

        {
          'bg-blue-600 text-white hover:bg-blue-700':
            variant === 'primary',

          'bg-slate-700 text-white hover:bg-slate-800':
            variant === 'secondary',

          'bg-green-600 text-white hover:bg-green-700':
            variant === 'success',

          'bg-red-600 text-white hover:bg-red-700':
            variant === 'danger',

          'border border-slate-300 bg-white hover:bg-slate-50':
            variant === 'outline',

          'px-3 py-2 text-sm':
            size === 'sm',

          'px-5 py-3':
            size === 'md',

          'px-7 py-4 text-lg':
            size === 'lg',
        },

        className,
      )}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}