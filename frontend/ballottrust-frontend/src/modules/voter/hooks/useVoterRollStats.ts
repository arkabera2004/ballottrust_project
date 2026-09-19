import { useCallback, useEffect, useState } from 'react';

import { VoterService } from '../services';
import ApiError from '../../../utils/api-error';

import type { VoterRollStats } from '../types';

export function useVoterRollStats(electionId?: string) {
  const [loading, setLoading] = useState(Boolean(electionId));
  const [stats, setStats] = useState<VoterRollStats | null>(null);

  const load = useCallback(async () => {
    if (!electionId) {
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      setStats(await VoterService.stats(electionId));
    } catch (err) {
      ApiError.handle(err);

      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { loading, stats, refresh: load };
}
