import { useQuery } from '@tanstack/react-query';

import { ElectionService } from '../services';
import { getErrorMessage } from '../../../utils/api-error';
import { useElectionRefresh } from '../context/useElectionRefresh';

import type { QueryElectionDto } from '../types';

export function useElections(
  query?: QueryElectionDto,
) {
  const { refreshKey } =
    useElectionRefresh();

  // Keyed on the serialized value of `query`, not `query` itself: callers
  // often pass a fresh object literal each render, which would otherwise
  // give the query key a new identity - and therefore refetch - every
  // render regardless of whether the query actually changed. refreshKey is
  // included so other parts of the app (e.g. an election action) can force
  // a refetch here without this hook needing to know why.
  const queryKey = JSON.stringify(query);

  const result = useQuery({
    queryKey: ['elections', queryKey, refreshKey],
    queryFn: () => ElectionService.getAll(query),
  });

  return {
    loading: result.isLoading,
    error: result.error
      ? getErrorMessage(result.error, 'Unable to load elections.')
      : null,
    elections: result.data?.data ?? [],
    total: result.data?.total ?? 0,
    totalPages: result.data?.totalPages ?? 1,
    refresh: result.refetch,
  };
}
