import { useCallback, useEffect, useState } from 'react';

import { VoterService } from '../services';
import ApiError from '../../../utils/api-error';

import type {
  QueryVoterDto,
  VoterRegistration,
} from '../types';

import type { PaginationMeta } from '../../../types/api.types';

const EMPTY_META: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

export function useVoters(query?: QueryVoterDto) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voters, setVoters] = useState<VoterRegistration[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);

  // Serialised so the effect re-runs on value changes rather than on
  // every new object identity from the caller's render.
  const queryKey = JSON.stringify(query ?? {});

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const result = await VoterService.getAll(
        JSON.parse(queryKey) as QueryVoterDto,
      );

      setVoters(result.items);
      setMeta(result.meta);
      setError(null);
    } catch (err) {
      ApiError.handle(err);

      setError('Unable to load the voter roll.');
    } finally {
      setLoading(false);
    }
  }, [queryKey]);

  useEffect(() => {
    void load();
  }, [load]);

  return { loading, error, voters, meta, refresh: load };
}
