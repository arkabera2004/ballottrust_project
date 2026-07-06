import { Link } from 'react-router-dom';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useRegister } from '../hooks/useRegister';

import {
  registerSchema,
  type RegisterFormData,
} from '../schemas/register.schema';

export default function RegisterForm() {

  const {

    register: registerUser,

    loading,

  } = useRegister();

  const {

    register,

    handleSubmit,

    formState: {

      errors,

    },

  } = useForm<RegisterFormData>({

    resolver: zodResolver(

      registerSchema,

    ),

    defaultValues: {

      fullName: '',

      email: '',

      password: '',

      role: 'VOTER',

    },

  });

  async function onSubmit(
    data: RegisterFormData,
  ) {

    await registerUser(

      data.fullName,

      data.email,

      data.password,

      data.role,

    );

  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <form

        onSubmit={handleSubmit(onSubmit)}

        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"

      >

        <h1 className="text-3xl font-bold mb-6 text-center">

          BallotTrust Registration

        </h1>

        <input

          placeholder="Full Name"

          className="border p-3 rounded w-full"

          {...register('fullName')}

        />

        {errors.fullName && (

          <p className="text-red-500 text-sm mt-1 mb-4">

            {errors.fullName.message}

          </p>

        )}

        <input

          type="email"

          autoComplete="email"

          placeholder="Email"

          className="border p-3 rounded w-full"

          {...register('email')}

        />

        {errors.email && (

          <p className="text-red-500 text-sm mt-1 mb-4">

            {errors.email.message}

          </p>

        )}

        <input

          type="password"

          autoComplete="new-password"

          placeholder="Password"

          className="border p-3 rounded w-full"

          {...register('password')}

        />

        {errors.password && (

          <p className="text-red-500 text-sm mt-1 mb-4">

            {errors.password.message}

          </p>

        )}

        <select

          className="border p-3 rounded w-full mt-2"

          {...register('role')}

        >

          <option value="VOTER">

            Voter

          </option>

          <option value="CANDIDATE">

            Candidate

          </option>

        </select>

        <button

          type="submit"

          disabled={loading}

          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-lg mt-6 disabled:opacity-60"

        >

          {loading

            ? 'Creating Account...'

            : 'Register'}

        </button>

        <div className="text-center mt-6">

          <p className="text-gray-500">

            Already have an account?

          </p>

          <Link

            to="/"

            className="text-blue-600 font-semibold"

          >

            Login Here

          </Link>

        </div>

      </form>

    </div>

  );

}