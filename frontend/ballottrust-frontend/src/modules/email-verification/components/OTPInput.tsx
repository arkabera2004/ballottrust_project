import {
  useRef,
} from 'react';

type Props = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
};

export default function OTPInput({

  length = 6,

  value,

  onChange,

}: Props) {

  // Fully derived from the controlled `value` prop rather than mirrored
  // into its own state + an effect to keep them in sync - the single
  // source of truth is the prop.
  const otp = Array(length)
    .fill('')
    .map((_, i) => value[i] || '');

  const inputs =
    useRef<Array<HTMLInputElement | null>>([]);

  function handleChange(
    index: number,
    input: string,
  ) {

    if (!/^\d?$/.test(input))
      return;

    const updated =
      [...otp];

    updated[index] = input;

    onChange(updated.join(''));

    if (
      input &&
      index < length - 1
    ) {

      inputs.current[index + 1]?.focus();

    }

  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {

    if (
      e.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {

      inputs.current[index - 1]?.focus();

    }

    if (
      e.key === 'ArrowLeft' &&
      index > 0
    ) {

      inputs.current[index - 1]?.focus();

    }

    if (
      e.key === 'ArrowRight' &&
      index < length - 1
    ) {

      inputs.current[index + 1]?.focus();

    }

  }

  function handlePaste(
    e: React.ClipboardEvent<HTMLInputElement>,
  ) {

    e.preventDefault();

    const pasted =
      e.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, length);

    if (!pasted)
      return;

    const updated =
      Array(length)
        .fill('')
        .map((_, i) => pasted[i] || '');

    onChange(updated.join(''));

    const last =
      Math.min(
        pasted.length,
        length,
      ) - 1;

    inputs.current[last]?.focus();

  }

  return (

    <div className="flex justify-center gap-3">

      {otp.map((digit, index) => (

        <input

          key={index}

          ref={(el) => {

            inputs.current[index] = el;

          }}

          value={digit}

          onChange={(e) =>
            handleChange(
              index,
              e.target.value,
            )
          }

          onKeyDown={(e) =>
            handleKeyDown(
              index,
              e,
            )
          }

          onPaste={handlePaste}

          inputMode="numeric"

          maxLength={1}

          className="
            w-14
            h-14
            rounded-xl
            border-2
            border-slate-300
            text-center
            text-2xl
            font-bold
            outline-none
            transition
            focus:border-blue-600
            focus:ring-4
            focus:ring-blue-100
          "

        />

      ))}

    </div>

  );

}