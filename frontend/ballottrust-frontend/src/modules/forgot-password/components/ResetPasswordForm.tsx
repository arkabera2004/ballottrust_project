import { useSearchParams } from 'react-router-dom';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '../schemas';

import { useResetPassword } from '../hooks';

export default function ResetPasswordForm() {

  const [searchParams] =
    useSearchParams();

  const token =
    searchParams.get('token') ?? '';

  const {

    resetPassword,

    loading,

  } = useResetPassword();

  const {

    register,

    handleSubmit,

    formState: {

      errors,

    },

  } = useForm<ResetPasswordFormData>({

    resolver: zodResolver(
      resetPasswordSchema,
    ),

  });

  async function onSubmit(
    data: ResetPasswordFormData,
  ) {

    await resetPassword(

      token,

      data.password,

    );

  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <form

        onSubmit={handleSubmit(onSubmit)}

        className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md"

      >

        <h1 className="text-3xl font-bold text-center mb-2">

          Reset Password

        </h1>

        <p className="text-center text-gray-500 mb-8">

          Enter your new password.

        </p>

        <input

          type="password"

          placeholder="New Password"

          className="border rounded-lg p-3 w-full"

          {...register('password')}

        />

        {errors.password && (

          <p className="text-red-500 text-sm mt-1">

            {errors.password.message}

          </p>

        )}

        <input

          type="password"

          placeholder="Confirm Password"

          className="border rounded-lg p-3 w-full mt-4"

          {...register('confirmPassword')}

        />

        {errors.confirmPassword && (

          <p className="text-red-500 text-sm mt-1">

            {errors.confirmPassword.message}

          </p>

        )}

        <button

          type="submit"

          disabled={loading}

          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-lg mt-6"

        >

          {loading

            ? 'Resetting...'

            : 'Reset Password'}

        </button>

      </form>

    </div>

  );

}