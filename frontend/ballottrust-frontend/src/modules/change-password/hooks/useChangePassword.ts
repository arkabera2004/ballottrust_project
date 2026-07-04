import { useState } from 'react';
import { toast } from 'react-hot-toast';

import changePasswordService from '../services/changePassword.service';

import type { ChangePasswordFormData } from '../schemas/changePassword.schema';

export function useChangePassword() {

  const [loading, setLoading] =
    useState(false);

  async function changePassword(
    values: ChangePasswordFormData,
  ) {

    try {

      setLoading(true);

      const response =
        await changePasswordService.changePassword({

          currentPassword:
            values.currentPassword,

          newPassword:
            values.newPassword,

        });

      toast.success(
        response.message,
      );

      return true;

    }

    catch (error: any) {

      console.error(error);

      toast.error(

        error?.response?.data?.message ||

        'Unable to change password',

      );

      return false;

    }

    finally {

      setLoading(false);

    }

  }

  return {

    loading,

    changePassword,

  };

}