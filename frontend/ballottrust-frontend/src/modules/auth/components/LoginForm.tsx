import { Link } from 'react-router-dom';

import { ENV } from '../../../config/env';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useLogin } from '../hooks/useLogin';

import {
  loginSchema,
  type LoginFormData,
} from '../schemas/login.schema';

export default function LoginForm() {

  const {

    login,

    loading,

  } = useLogin();

  const {

    register,

    handleSubmit,

    formState: {

      errors,

    },

  } = useForm<LoginFormData>({

    resolver: zodResolver(
      loginSchema,
    ),

    defaultValues: {

      email: '',

      password: '',

    },

  });

  async function onSubmit(
    data: LoginFormData,
  ) {

    await login(

      data.email,

      data.password,

    );

  }

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

      </div>

      {/* Right Side */}

      <div className="flex-1 flex justify-center items-center bg-slate-100 dark:bg-slate-950">

        <form

          onSubmit={handleSubmit(
            onSubmit,
          )}

          className="bg-white dark:bg-slate-900 shadow-2xl rounded-2xl p-10 w-full max-w-md"

        >

          <h2 className="text-3xl font-bold text-center mb-2 dark:text-white">

            Welcome Back

          </h2>

          <p className="text-center text-gray-500 mb-8">

            Sign in to continue

          </p>

          <input

            type="email"

            autoComplete="email"

            placeholder="Email"

            className="w-full border p-3 rounded-lg"

            {...register('email')}

          />

          {errors.email && (

            <p className="text-red-500 text-sm mt-1 mb-4">

              {errors.email.message}

            </p>

          )}

          <input

            type="password"

            autoComplete="current-password"

            placeholder="Password"

            className="w-full border p-3 rounded-lg mt-4"

            {...register('password')}

          />

          {errors.password && (

            <p className="text-red-500 text-sm mt-1 mb-4">

              {errors.password.message}

            </p>

          )}

          <div className="flex justify-end mt-3 mb-6">

            <Link

              to="/forgot-password"

              className="text-sm text-blue-600 hover:underline"

            >

              Forgot Password?

            </Link>

          </div>

          <button

            type="submit"

            disabled={loading}

            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition disabled:opacity-60"

          >

            {loading

              ? 'Signing In...'

              : 'Login'}

          </button>

          <button
                type="button"
                onClick={() => {
                    window.location.href =
                        `${ENV.API_URL}/auth/google`;
                }}
                className="w-full mt-4 border p-3 rounded-lg font-medium hover:bg-gray-100 transition"
            >
                Continue with Google
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

        </form>

      </div>

    </div>

  );

}