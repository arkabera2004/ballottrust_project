import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import DashboardLayout from '../../../components/layout/DashboardLayout';

import VerifyCard from '../components/VerifyCard';
import { useVerifyEmail } from '../hooks/useVerifyEmail';

export default function VerifyEmail() {

  const navigate = useNavigate();

  const location = useLocation();

  const email =
    location.state?.email ??
    sessionStorage.getItem(
      'verificationEmail',
    ) ??
    '';

  const [otp, setOtp] =
    useState('');

  const [canResend, setCanResend] =
    useState(false);

  const [countdownKey, setCountdownKey] =
    useState(0);

  const {

    verifyEmail,

    resendOtp,

    loading,

    resending,

  } = useVerifyEmail();

  useEffect(() => {

    if (!email) {

      navigate('/register');

      return;

    }

    sessionStorage.setItem(
      'verificationEmail',
      email,
    );

  }, [email, navigate]);

  async function handleVerify() {

    const success =
      await verifyEmail(
        email,
        otp,
      );

    if (success) {

      sessionStorage.removeItem(
        'verificationEmail',
      );

      setTimeout(() => {

        navigate('/login');

      }, 1500);

    }

  }

  async function handleResend() {

    await resendOtp(email);

    setCanResend(false);

    setCountdownKey(
      (prev) => prev + 1,
    );

  }

  return (

    <DashboardLayout>

      <div className="flex items-center justify-center min-h-[80vh]">

        <div className="w-full max-w-lg">

          <VerifyCard

            email={email}

            otp={otp}

            loading={loading}

            resendLoading={resending}

            canResend={canResend}

            countdownKey={countdownKey}

            onOtpChange={setOtp}

            onVerify={handleVerify}

            onResend={handleResend}

            onCountdownExpire={() =>
              setCanResend(true)
            }

          />

        </div>

      </div>

    </DashboardLayout>

  );

}