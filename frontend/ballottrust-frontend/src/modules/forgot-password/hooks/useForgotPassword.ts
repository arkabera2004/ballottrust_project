import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { passwordService } from '../services';

import Toast from '../../../utils/toast';

import { ROUTES } from '../../../constants/routes';

export function useForgotPassword() {

  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(false);

  async function forgotPassword(
    email: string,
  ) {

    try {

      setLoading(true);

      const response =
        await passwordService.forgotPassword({

          email,

        });

      Toast.success(
        response.message,
      );

      navigate(
        ROUTES.LOGIN,
      );

    }

    catch (error: any) {

      Toast.error(

        error?.response?.data?.message ||

        'Unable to send reset link.',

      );

    }

    finally {

      setLoading(false);

    }

  }

  return {

    forgotPassword,

    loading,

  };

}