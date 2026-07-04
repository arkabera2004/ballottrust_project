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

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [restartKey, initialSeconds]);

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