import { useQuery } from '@tanstack/react-query';

import { ElectionService } from '../services';
import { getErrorMessage } from '../../../utils/api-error';

export function useElection(id?: string) {
  const result = useQuery({
    queryKey: ['elections', id],
    queryFn: () => ElectionService.getById(id as string),
    enabled: !!id,
  });

  return {
    loading: result.isLoading,
    error: result.error
      ? getErrorMessage(result.error, 'Unable to fetch election.')
      : null,
    election: result.data ?? null,
    refresh: result.refetch,
  };
}
