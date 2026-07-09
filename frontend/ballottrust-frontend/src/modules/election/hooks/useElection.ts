import { useEffect, useState } from 'react';

import { ElectionService } from '../services';

import type { Election } from '../types';

export function useElection(id?: string) {
  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [election, setElection] =
    useState<Election | null>(null);

  useEffect(() => {
    if (id) {
      load();
    }
  }, [id]);

  async function load() {
    if (!id) return;

    try {
      setLoading(true);

      const result =
        await ElectionService.getById(id);

      setElection(result);

      setError(null);

    } catch (err: any) {

      setError(
        err.message ??
          'Unable to fetch election.',
      );

    } finally {

      setLoading(false);

    }
  }

  return {
    loading,
    error,
    election,
    refresh: load,
  };
}