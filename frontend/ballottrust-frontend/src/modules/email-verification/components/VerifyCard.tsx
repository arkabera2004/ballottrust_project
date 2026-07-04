import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

import OTPInput from './OTPInput';
import Countdown from './Countdown';

type Props = {
  email: string;

  otp: string;

  loading: boolean;

  resendLoading: boolean;

  canResend: boolean;

  countdownKey: number;

  onOtpChange: (value: string) => void;

  onVerify: () => void;

  onResend: () => void;

  onCountdownExpire: () => void;
};

export default function VerifyCard({

  email,

  otp,

  loading,

  resendLoading,

  canResend,

  countdownKey,

  onOtpChange,

  onVerify,

  onResend,

  onCountdownExpire,

}: Props) {

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 20,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      transition={{
        duration: 0.4,
      }}

    >

      <Card>

        <div className="text-center">

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">

            <Mail
              size={30}
              className="text-blue-600"
            />

          </div>

          <h2 className="text-3xl font-bold">

            Verify Your Email

          </h2>

          <p className="mt-3 text-slate-500">

            We've sent a verification code to

          </p>

          <p className="mt-1 font-semibold text-blue-600">

            {email}

          </p>

        </div>

        <div className="mt-10">

          <OTPInput

            value={otp}

            onChange={onOtpChange}

          />

        </div>

        <div className="mt-8">

          <Countdown

            restartKey={countdownKey}

            onExpire={onCountdownExpire}

          />

        </div>

        <div className="mt-8">

          <Button

            className="w-full"

            loading={loading}

            disabled={otp.length !== 6}

            onClick={onVerify}

          >

            Verify Email

          </Button>

        </div>

        <div className="mt-5 text-center">

          <button

            type="button"

            disabled={!canResend || resendLoading}

            onClick={onResend}

            className="font-semibold text-blue-600 disabled:text-slate-400"

          >

            {resendLoading

              ? 'Sending...'

              : 'Resend OTP'}

          </button>

        </div>

      </Card>

    </motion.div>

  );

}