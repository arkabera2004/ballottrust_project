import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { VoterService } from '../services';
import ApiError from '../../../utils/api-error';

/** Every election the signed-in voter has registered for. */
export function useMyRegistrations() {
  const result = useQuery({
    queryKey: ['voter', 'my-registrations'],
    queryFn: () => VoterService.myRegistrations(),
  });

  useEffect(() => {
    if (result.error) {
      ApiError.handle(result.error);
    }
  }, [result.error]);

  return {
    loading: result.isLoading,
    registrations: result.data?.items ?? [],
    refresh: result.refetch,
  };
}
