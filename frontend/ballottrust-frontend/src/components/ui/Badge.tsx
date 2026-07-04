import type { ReactNode } from 'react';

import clsx from 'clsx';

type Props = {

  children: ReactNode;

  color?:

    | 'blue'

    | 'green'

    | 'red'

    | 'yellow';

};

export default function Badge({

  children,

  color = 'blue',

}: Props) {

  return (

    <span

      className={clsx(

        'px-4 py-2 rounded-full text-sm font-semibold',

        color === 'blue' &&
          'bg-blue-100 text-blue-700',

        color === 'green' &&
          'bg-green-100 text-green-700',

        color === 'red' &&
          'bg-red-100 text-red-700',

        color === 'yellow' &&
          'bg-yellow-100 text-yellow-700',

      )}

    >

      {children}

    </span>

  );

}