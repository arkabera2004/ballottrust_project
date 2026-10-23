import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import authService from '../services/auth.service';

import { useAuth } from '../../../context/AuthContext';
import Toast from '../../../utils/toast';
import { getErrorMessage } from '../../../utils/api-error';
import { ROUTES } from '../../../constants/routes';

import {
  isAdmin,
  isCandidate,
  isAuditor,
} from '../utils/auth.helper';

export function useLogin() {

  const navigate =
    useNavigate();

  const {
    login: authLogin,
  } = useAuth();

  const [loading, setLoading] =
    useState(false);

  async function login(

    email: string,

    password: string,

  ) {

    try {

      setLoading(true);

      const response =
        await authService.login({

          email,

          password,

        });

      authLogin(

        response.access_token,

        response.refresh_token,

        response.user,

      );

      Toast.success(

        `Welcome back, ${response.user.fullName}!`,

      );

      if (
        isAdmin(response.user.role)
      ) {

        navigate(ROUTES.ADMIN)

      }

      else if (
        isCandidate(response.user.role)
      ) {

        navigate(ROUTES.CANDIDATE);

      }

      else if (
        isAuditor(response.user.role)
      ) {

        navigate(ROUTES.AUDIT_LOGS);

      }

      else {

        navigate(ROUTES.VOTER);

      }

    }

    catch (error: unknown) {

      const message = getErrorMessage(error, 'Login Failed');

      if (
        message ===
        'Please verify your email first.'
      ) {

        sessionStorage.setItem(
          'verificationEmail',
          email,
        );

        Toast.error(message);

        setTimeout(() => {

          navigate(
            ROUTES.VERIFY_EMAIL,
            {
              state: {
                email,
              },
            },
          );

        }, 1000);

        return;

      }

      if (
        message ===
        'Account pending approval'
      ) {

        Toast.error(
          'Your account is awaiting administrator approval.',
        );

        return;

      }

      Toast.error(message);

    }

    finally {

      setLoading(false);

    }

  }

  return {

    login,

    loading,

  };

}