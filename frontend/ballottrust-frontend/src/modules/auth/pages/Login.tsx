import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import authService from '../services/auth.service';
import { useAuth } from '../../../context/AuthContext';
import Toast from '../../../utils/toast';

export default function Login() {

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const navigate =
    useNavigate();

  const {
    login: authLogin,
  } = useAuth();

  const login = async () => {

    try {

      setLoading(true);

      const response =
        await authService.login({
          email,
          password,
        });

      console.log(
        'LOGIN RESPONSE:',
        response,
      );

      authLogin(
        response.access_token,
        response.refresh_token,
        response.user,
      );

      console.log(
        'USER:',
        response.user,
      );

      Toast.success('Login Successful');

      if (
        response.user.role ===
          'SUPER_ADMIN' ||
        response.user.role ===
          'ELECTION_COMMISSIONER'
      ) {

        navigate('/admin');

      } else if (
        response.user.role ===
        'CANDIDATE'
      ) {

        navigate('/candidate');

      } else if (
        response.user.role ===
        'AUDITOR'
      ) {

        navigate('/audit-logs');

      } else {

        navigate('/voter');

      }

    } catch (error) {

      console.error(error);

      Toast.error('Invalid Email or Password');

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="min-h-screen flex">

      {/* Left Side */}

      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-16 flex-col justify-center">

        <h1 className="text-5xl font-bold mb-6">
          BallotTrust
        </h1>

        <h2 className="text-3xl font-semibold mb-4">
          Secure Digital Elections
        </h2>

        <p className="text-lg text-gray-300 mb-8">
          Transparent • Secure • Verifiable • Scalable
        </p>

        <div className="space-y-4">

          <div className="bg-white/10 p-4 rounded-lg">
            ✓ Role Based Access
          </div>

          <div className="bg-white/10 p-4 rounded-lg">
            ✓ Blockchain Verified Voting
          </div>

          <div className="bg-white/10 p-4 rounded-lg">
            ✓ Election Commission Ready
          </div>

          <div className="bg-white/10 p-4 rounded-lg">
            ✓ Candidate Verification Portal
          </div>

        </div>

      </div>

      {/* Right Side */}

      <div className="flex-1 flex justify-center items-center bg-slate-100 dark:bg-slate-950">

        <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-2xl p-10 w-full max-w-md">

          <h2 className="text-3xl font-bold text-center mb-2 dark:text-white">
            Welcome Back
          </h2>

          <p className="text-center text-gray-500 mb-8">
            Sign in to continue
          </p>

          <input
            type="email"
            placeholder="Email Address"
            className="w-full border p-3 rounded-lg mb-4"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value,
              )
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded-lg mb-6"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value,
              )
            }
          />

          <button
            onClick={login}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition"
          >
            {loading
              ? 'Signing In...'
              : 'Login'}
          </button>

          <button
            className="w-full mt-4 border p-3 rounded-lg font-medium"
          >
            Continue with Google
            (Coming Soon)
          </button>

          <div className="text-center mt-6">

            <p className="text-gray-500">
              New voter?
            </p>

            <Link
              to="/register"
              className="text-blue-600 font-semibold"
            >
              Register Here
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}