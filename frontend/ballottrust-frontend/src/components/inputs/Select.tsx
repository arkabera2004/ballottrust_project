import {
  type SelectHTMLAttributes,
} from 'react';

import clsx from 'clsx';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <select
      className={clsx(
        'w-full rounded-xl border border-slate-300 px-4 py-3 outline-none',
        'focus:border-blue-600 focus:ring-2 focus:ring-blue-200',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}