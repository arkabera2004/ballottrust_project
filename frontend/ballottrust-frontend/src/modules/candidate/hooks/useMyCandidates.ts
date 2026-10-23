import { useQuery } from '@tanstack/react-query';

import { CandidateService } from '../services';

import { getErrorMessage } from '../../../utils/api-error';

export function useMyCandidates() {
  const result = useQuery({
    queryKey: ['candidates', 'mine'],
    queryFn: () => CandidateService.getMyCandidates(),
  });

  return {
    candidates: result.data ?? [],
    loading: result.isLoading,
    error: result.error
      ? getErrorMessage(result.error, 'Unable to load your candidacies.')
      : null,
    refresh: result.refetch,
  };
}
