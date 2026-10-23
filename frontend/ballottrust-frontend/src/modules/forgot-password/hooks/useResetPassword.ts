import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { passwordService } from '../services';

import Toast from '../../../utils/toast';
import { getErrorMessage } from '../../../utils/api-error';

import { ROUTES } from '../../../constants/routes';

export function useResetPassword() {

  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(false);

  async function resetPassword(

    token: string,

    password: string,

  ) {

    try {

      setLoading(true);

      const response =
        await passwordService.resetPassword({

          token,

          password,

        });

      Toast.success(
        response.message,
      );

      navigate(
        ROUTES.LOGIN,
      );

    }

    catch (error: unknown) {

      Toast.error(

        getErrorMessage(error, 'Unable to reset password.'),

      );

    }

    finally {

      setLoading(false);

    }

  }

  return {

    resetPassword,

    loading,

  };

}