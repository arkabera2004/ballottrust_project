import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';

import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '../schemas';

import { useForgotPassword } from '../hooks';

import { ROUTES } from '../../../constants/routes';

export default function ForgotPasswordForm() {

  const {

    forgotPassword,

    loading,

  } = useForgotPassword();

  const {

    register,

    handleSubmit,

    formState: {

      errors,

    },

  } = useForm<ForgotPasswordFormData>({

    resolver: zodResolver(
      forgotPasswordSchema,
    ),

    defaultValues: {

      email: '',

    },

  });

  async function onSubmit(
    data: ForgotPasswordFormData,
  ) {

    await forgotPassword(
      data.email,
    );

  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <form

        onSubmit={handleSubmit(onSubmit)}

        className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md"

      >

        <h1 className="text-3xl font-bold text-center mb-2">

          Forgot Password

        </h1>

        <p className="text-center text-gray-500 mb-8">

          Enter your registered email to receive a password reset link.

        </p>

        <input

          type="email"

          placeholder="Email Address"

          className="border rounded-lg p-3 w-full"

          {...register('email')}

        />

        {errors.email && (

          <p className="text-red-500 text-sm mt-1">

            {errors.email.message}

          </p>

        )}

        <button

          type="submit"

          disabled={loading}

          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-lg mt-6"

        >

          {loading

            ? 'Sending...'

            : 'Send Reset Link'}

        </button>

        <div className="text-center mt-6">

          <Link

            to={ROUTES.LOGIN}

            className="text-blue-600 font-semibold"

          >

            Back to Login

          </Link>

        </div>

      </form>

    </div>

  );

}