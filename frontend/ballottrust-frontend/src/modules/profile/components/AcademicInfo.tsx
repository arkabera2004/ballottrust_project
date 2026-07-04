import type {
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form';

import type {
  ProfileFormData,
} from '../schemas/profile.schema';

import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';

type Props = {
  register: UseFormRegister<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
};

export default function AcademicInfo({
  register,
  errors,
}: Props) {
  return (
    <Card>

      <h2 className="text-2xl font-bold mb-8">
        Academic Information
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        <Input
          label="Department"
          {...register('department')}
          error={errors.department?.message}
        />

        <Input
          label="Course"
          {...register('course')}
          error={errors.course?.message}
        />

        <Input
          label="Year"
          type="number"
          {...register('year', {
            valueAsNumber: true,
          })}
          error={errors.year?.message}
        />

        <Input
          label="Semester"
          type="number"
          {...register('semester', {
            valueAsNumber: true,
          })}
          error={errors.semester?.message}
        />

      </div>

      <div className="mt-6">

        <Input
          label="Registration Number"
          {...register('registrationNumber')}
          error={errors.registrationNumber?.message}
        />

      </div>

    </Card>
  );
}