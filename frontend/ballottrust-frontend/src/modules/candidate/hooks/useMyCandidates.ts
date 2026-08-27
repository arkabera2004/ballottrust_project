import { useCallback, useEffect, useState } from 'react';

import { CandidateService } from '../services';

import type { Candidate } from '../types';

export function useMyCandidates() {
  const [candidates, setCandidates] =
    useState<Candidate[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadCandidates = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const result =
          await CandidateService.getMyCandidates();

        setCandidates(result);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ??
            err?.message ??
            'Unable to load your candidacies.',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  return {
    candidates,
    loading,
    error,
    refresh: loadCandidates,
  };
}