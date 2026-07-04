import type {
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form';

import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';

import type {
  ProfileFormData,
} from '../schemas/profile.schema';

type Props = {
  register: UseFormRegister<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
};

export default function AddressInfo({
  register,
  errors,
}: Props) {

  return (

    <Card>

      <h2 className="text-2xl font-bold mb-8">

        Address Information

      </h2>

      {/* Address */}

      <div>

        <label className="block mb-2 font-semibold">

          Address

        </label>

        <textarea
          rows={4}
          placeholder="Enter your complete address..."
          {...register('address')}
          className="w-full rounded-xl border border-slate-300 p-3 outline-none resize-none focus:ring-2 focus:ring-blue-500 transition"
        />

        {errors.address && (

          <p className="text-red-500 text-sm mt-2">

            {errors.address.message}

          </p>

        )}

      </div>

      {/* City / State */}

      <div className="grid md:grid-cols-2 gap-6 mt-6">

        <Input
          label="City"
          placeholder="Enter city"
          {...register('city')}
          error={errors.city?.message}
        />

        <Input
          label="State"
          placeholder="Enter state"
          {...register('state')}
          error={errors.state?.message}
        />

      </div>

      {/* Country / Postal Code */}

      <div className="grid md:grid-cols-2 gap-6 mt-6">

        <Input
          label="Country"
          placeholder="Enter country"
          {...register('country')}
          error={errors.country?.message}
        />

        <Input
          label="Postal Code"
          placeholder="Enter postal code"
          {...register('postalCode')}
          error={errors.postalCode?.message}
        />

      </div>

    </Card>

  );

}