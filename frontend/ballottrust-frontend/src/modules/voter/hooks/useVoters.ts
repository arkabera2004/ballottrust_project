import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { VoterService } from '../services';
import ApiError from '../../../utils/api-error';

import type { QueryVoterDto } from '../types';

import type { PaginationMeta } from '../../../types/api.types';

const EMPTY_META: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

export function useVoters(query?: QueryVoterDto) {
  // Serialised so the query key changes on value changes rather than on
  // every new object identity from the caller's render.
  const queryKey = JSON.stringify(query ?? {});

  const result = useQuery({
    queryKey: ['voters', queryKey],
    queryFn: () => VoterService.getAll(JSON.parse(queryKey) as QueryVoterDto),
  });

  useEffect(() => {
    if (result.error) {
      ApiError.handle(result.error);
    }
  }, [result.error]);

  return {
    loading: result.isLoading,
    error: result.error ? 'Unable to load the voter roll.' : null,
    voters: result.data?.items ?? [],
    meta: result.data?.meta ?? EMPTY_META,
    refresh: result.refetch,
  };
}
