import {
  forwardRef,
  type InputHTMLAttributes,
} from 'react';

import clsx from 'clsx';

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={clsx(
        'w-full rounded-xl border border-slate-300 px-4 py-3 outline-none',
        'focus:border-blue-600 focus:ring-2 focus:ring-blue-200',
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;