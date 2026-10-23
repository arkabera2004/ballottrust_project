import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import profileService from '../services/profile.service';

import type { ProfileFormData } from '../schemas/profile.schema';

const PROFILE_QUERY_KEY = ['profile', 'me'];

export function useProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => profileService.getMyProfile(),
  });

  // toast.error() is a side effect, not a state sync, so it belongs in an
  // effect reacting to the query's error rather than in the query itself
  // (calling it directly in the render body would re-fire on every render
  // while the error is still set).
  useEffect(() => {
    if (profileQuery.error) {
      console.error(profileQuery.error);
      toast.error('Failed to load profile');
    }
  }, [profileQuery.error]);

  const updateMutation = useMutation({
    mutationFn: (values: ProfileFormData) =>
      profileService.updateMyProfile(values),
    onSuccess: (response) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, response.profile);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Unable to update profile');
    },
  });

  return {
    profile: profileQuery.data ?? null,
    loading: profileQuery.isLoading,
    saving: updateMutation.isPending,
    // mutate(), not mutateAsync(): the original never threw (it caught
    // internally and only toasted), and this is passed straight to
    // react-hook-form's handleSubmit, which would otherwise see an
    // unhandled rejection on failure.
    updateProfile: (values: ProfileFormData) =>
      updateMutation.mutate(values),
    reload: profileQuery.refetch,
  };
}
