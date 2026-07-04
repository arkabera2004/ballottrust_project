import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
};

export default function Button({
  children,
  loading = false,
  variant = 'primary',
  className,
  disabled,
  ...props
}: ButtonProps) {

  return (

    <button
      disabled={disabled || loading}
      className={clsx(
        'px-6 py-3 rounded-xl font-semibold transition-all duration-200',
        'disabled:opacity-60 disabled:cursor-not-allowed',

        variant === 'primary' &&
          'bg-blue-600 hover:bg-blue-700 text-white',

        variant === 'secondary' &&
          'bg-slate-200 hover:bg-slate-300 text-slate-900',

        variant === 'danger' &&
          'bg-red-600 hover:bg-red-700 text-white',

        className,
      )}
      {...props}
    >

      {loading ? 'Loading...' : children}

    </button>

  );

}