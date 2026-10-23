import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { VoterService } from '../services';
import ApiError from '../../../utils/api-error';

export function useVoterRollStats(electionId?: string) {
  const result = useQuery({
    queryKey: ['voter', 'roll-stats', electionId],
    queryFn: () => VoterService.stats(electionId as string),
    enabled: !!electionId,
  });

  useEffect(() => {
    if (result.error) {
      ApiError.handle(result.error);
    }
  }, [result.error]);

  return {
    loading: result.isLoading,
    stats: result.data ?? null,
    refresh: result.refetch,
  };
}
