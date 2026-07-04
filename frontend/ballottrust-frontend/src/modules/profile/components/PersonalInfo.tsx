import type {
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form';

import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';

import type { Profile } from '../types/profile';
import type { ProfileFormData } from '../schemas/profile.schema';

type Props = {
  register: UseFormRegister<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  profile: Profile | null;
};

export default function PersonalInfo({
  register,
  errors,
  profile,
}: Props) {

  return (

    <Card>

      <h2 className="text-2xl font-bold mb-8">

        Personal Information

      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        <Input
          label="Full Name"
          placeholder="Enter your full name"
          {...register('fullName')}
          error={errors.fullName?.message}
        />

        <Input
          label="Phone Number"
          placeholder="Enter phone number"
          {...register('phoneNumber')}
          error={errors.phoneNumber?.message}
        />

      </div>

      <div className="mt-6">

        <label className="block mb-2 font-semibold">

          Bio

        </label>

        <textarea
          rows={5}
          placeholder="Tell us something about yourself..."
          {...register('bio')}
          className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
        />

        {errors.bio && (

          <p className="text-red-500 text-sm mt-2">

            {errors.bio.message}

          </p>

        )}

      </div>

      <div className="mt-6">

        <Input
          label="Email Address"
          value={profile?.email ?? ''}
          disabled
        />

      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-6">

        <Input
          label="Role"
          value={profile?.role ?? ''}
          disabled
        />

        <Input
          label="Account Status"
          value={profile?.status ?? ''}
          disabled
        />

      </div>

    </Card>

  );

}