import type {
  InputHTMLAttributes,
} from 'react';

import clsx from 'clsx';

type Props =
  InputHTMLAttributes<HTMLInputElement> & {

    label?: string;

    error?: string;

  };

export default function Input({

  label,

  error,

  className,

  ...props

}: Props) {

  return (

    <div>

      {label && (

        <label className="block mb-2 font-semibold">

          {label}

        </label>

      )}

      <input

        {...props}

        className={clsx(

          'w-full rounded-xl border border-slate-300 p-3',

          'focus:ring-2 focus:ring-blue-500',

          'outline-none',

          error && 'border-red-500',

          className,

        )}

      />

      {error && (

        <p className="text-red-500 text-sm mt-2">

          {error}

        </p>

      )}

    </div>

  );

}