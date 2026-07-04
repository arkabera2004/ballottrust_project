import type { ReactNode } from 'react';
import clsx from 'clsx';

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Card({
  children,
  className,
}: Props) {

  return (

    <div
      className={clsx(
        'bg-white rounded-3xl shadow-lg border border-slate-200 p-8',
        className,
      )}
    >

      {children}

    </div>

  );

}