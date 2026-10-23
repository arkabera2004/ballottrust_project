import { useState } from 'react';
import { toast } from 'react-hot-toast';

import { emailVerificationService } from '../../auth/services';

import { getErrorMessage } from '../../../utils/api-error';

export function useVerifyEmail() {

  const [loading, setLoading] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  async function verifyEmail(
    email: string,
    otp: string,
  ) {

    try {

      setLoading(true);

      const response =
        await emailVerificationService.verifyEmail({

          email,

          otp,

        });

      toast.success(
        response.message,
      );

      return true;

    }

    catch (error: unknown) {

      console.error(error);

      toast.error(

        getErrorMessage(error, 'Verification failed'),

      );

      return false;

    }

    finally {

      setLoading(false);

    }

  }

  async function resendOtp(
    email: string,
  ) {

    try {

      setResending(true);

      const response =
        await emailVerificationService.resendOtp({

          email,

        });

      toast.success(
        response.message,
      );

    }

    catch (error: unknown) {

      console.error(error);

      toast.error(

        getErrorMessage(error, 'Unable to resend OTP'),

      );

    }

    finally {

      setResending(false);

    }

  }

  return {

    verifyEmail,

    resendOtp,

    loading,

    resending,

  };

}