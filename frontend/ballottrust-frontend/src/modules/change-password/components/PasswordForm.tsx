import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';

import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '../schemas/changePassword.schema';

type Props = {

  loading: boolean;

  onSubmit: (
    values: ChangePasswordFormData,
  ) => void;

};

export default function PasswordForm({

  loading,

  onSubmit,

}: Props) {

  const {

    register,

    handleSubmit,

    formState: {

      errors,

    },

    reset,

  } = useForm<ChangePasswordFormData>({

    resolver:
      zodResolver(
        changePasswordSchema,
      ),

  });

  async function submit(
    values: ChangePasswordFormData,
  ) {

    await onSubmit(values);

    reset();

  }

  return (

    <Card>

      <form
        onSubmit={handleSubmit(submit)}
        className="space-y-6"
      >

        <Input
          label="Current Password"
          type="password"
          {...register(
            'currentPassword',
          )}
          error={
            errors.currentPassword?.message
          }
        />

        <Input
          label="New Password"
          type="password"
          {...register(
            'newPassword',
          )}
          error={
            errors.newPassword?.message
          }
        />

        <Input
          label="Confirm Password"
          type="password"
          {...register(
            'confirmPassword',
          )}
          error={
            errors.confirmPassword?.message
          }
        />

        <Button
          loading={loading}
          type="submit"
        >

          Change Password

        </Button>

      </form>

    </Card>

  );

}