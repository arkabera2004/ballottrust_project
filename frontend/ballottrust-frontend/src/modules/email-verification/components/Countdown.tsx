import { useEffect, useState } from 'react';

type Props = {
  initialSeconds?: number;
  onExpire?: () => void;
  restartKey?: number;
};

export default function Countdown({
  initialSeconds = 60,
  onExpire,
  restartKey,
}: Props) {

  const [seconds, setSeconds] =
    useState(initialSeconds);

  // Resets the countdown when restartKey/initialSeconds change, following
  // React's "adjusting state during render" pattern instead of an effect
  // (https://react.dev/learn/you-might-not-need-an-effect) — tracking the
  // key we last reset for in state lets this branch run during render,
  // rather than needing a render-then-effect round trip.
  const [resetFor, setResetFor] = useState({
    restartKey,
    initialSeconds,
  });

  if (
    resetFor.restartKey !== restartKey ||
    resetFor.initialSeconds !== initialSeconds
  ) {
    setResetFor({ restartKey, initialSeconds });
    setSeconds(initialSeconds);
  }

  useEffect(() => {

    if (seconds <= 0) {

      onExpire?.();

      return;

    }

    const timer = setTimeout(() => {

      setSeconds((prev) => prev - 1);

    }, 1000);

    return () => clearTimeout(timer);

  }, [seconds, onExpire]);

  return (

    <div className="text-center">

      {seconds > 0 ? (

        <p className="text-sm text-slate-500">

          Resend OTP in{' '}

          <span className="font-semibold text-blue-600">

            {seconds}s

          </span>

        </p>

      ) : (

        <p className="text-sm text-green-600 font-semibold">

          You can now resend the OTP.

        </p>

      )}

    </div>

  );

}