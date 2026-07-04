import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import profileService from '../services/profile.service';

import type { Profile } from '../types/profile';
import type { ProfileFormData } from '../schemas/profile.schema';

export function useProfile() {

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  async function loadProfile() {

    try {

      setLoading(true);

      const data =
        await profileService.getMyProfile();

      setProfile(data);

    }

    catch (error) {

      console.error(error);

      toast.error(
        'Failed to load profile',
      );

    }

    finally {

      setLoading(false);

    }

  }

  async function updateProfile(
    values: ProfileFormData,
  ) {

    try {

      setSaving(true);

      const response =
        await profileService.updateMyProfile(
          values,
        );

      setProfile(response.profile);

      toast.success(
        'Profile updated successfully',
      );

    }

    catch (error) {

      console.error(error);

      toast.error(
        'Unable to update profile',
      );

    }

    finally {

      setSaving(false);

    }

  }

  useEffect(() => {

    loadProfile();

  }, []);

  return {

    profile,

    loading,

    saving,

    updateProfile,

    reload: loadProfile,

  };

}