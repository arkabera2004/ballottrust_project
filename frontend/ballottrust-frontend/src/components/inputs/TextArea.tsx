import {
  forwardRef,
  type TextareaHTMLAttributes,
} from 'react';

import clsx from 'clsx';

const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea(
  { className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={clsx(
        'w-full rounded-xl border border-slate-300 p-4 outline-none',
        'focus:border-blue-600 focus:ring-2 focus:ring-blue-200',
        className,
      )}
      {...props}
    />
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;