import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import authService from '../services/auth.service';
import Toast from '../../../utils/toast';

export function useRegister() {

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  async function register(
    fullName: string,
    email: string,
    password: string,
    role: 'VOTER' | 'CANDIDATE',
  ) {

    try {

      setLoading(true);

      await authService.register({
        fullName,
        email,
        password,
        role,
      });

      sessionStorage.setItem('verificationEmail', email);

      Toast.success('Registration successful');

      navigate(
        '/verify-email',
        {
          state: {
            email,
          },
          replace: true,
        },
      );

    }

    catch (error: any) {

      const message =
        error?.response?.data?.message ||
        'Registration Failed';

      Toast.error(message);

    }

    finally {

      setLoading(false);

    }

  }

  return {

    register,

    loading,

  };

}