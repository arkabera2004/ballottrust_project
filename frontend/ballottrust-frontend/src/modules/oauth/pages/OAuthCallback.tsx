import { useEffect } from 'react';
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import { useAuth } from '../../../context/AuthContext';

import authService from '../../auth/services/auth.service';

import Toast from '../../../utils/toast';

export default function OAuthCallback() {

  const navigate = useNavigate();

  const [params] =
    useSearchParams();

  const { login } =
    useAuth();

  useEffect(() => {

    async function completeOAuthLogin() {

      const accessToken =
        params.get('accessToken');

      const refreshToken =
        params.get('refreshToken');

      if (
        !accessToken ||
        !refreshToken
      ) {

        Toast.error(
          'Google Login Failed',
        );

        navigate('/');

        return;

      }

      try {

        localStorage.setItem(
          'accessToken',
          accessToken,
        );

        localStorage.setItem(
          'refreshToken',
          refreshToken,
        );

        const user =
          await authService.getProfile();

        login(
          accessToken,
          refreshToken,
          user,
        );

        Toast.success(
          'Welcome to BallotTrust',
        );

        switch (user.role) {

          // Both administrative roles land on the same console.
          case 'SUPER_ADMIN':
          case 'ELECTION_COMMISSIONER':

            navigate('/admin');

            break;

          case 'AUDITOR':

            navigate('/audit-logs');

            break;

          case 'CANDIDATE':

            navigate('/candidate');

            break;

          default:

            navigate('/voter');

        }

      } catch (error) {

        console.error(error);

        Toast.error(
          'Google Login Failed',
        );

        navigate('/');

      }

    }

    completeOAuthLogin();

  }, [login, navigate, params]);

  return (

    <div className="min-h-screen flex items-center justify-center">

      <h1 className="text-2xl font-semibold">

        Signing you in...

      </h1>

    </div>

  );

}