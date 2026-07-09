import { useEffect, useState } from 'react';

import { ElectionService } from '../services';

import type {
  Election,
  QueryElectionDto,
} from '../types';

export function useElections(
  query?: QueryElectionDto,
) {
  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [elections, setElections] =
    useState<Election[]>([]);

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  useEffect(() => {
    load();
  }, [JSON.stringify(query)]);

  async function load() {
    try {
      setLoading(true);

      const result =
        await ElectionService.getAll(
          query,
        );

      setElections(result.data);

      setTotal(result.total);

      setTotalPages(
        result.totalPages,
      );

      setError(null);

    } catch (err: any) {

      setError(
        err.message ??
          'Unable to load elections.',
      );

    } finally {

      setLoading(false);

    }
  }

  return {

    loading,

    error,

    elections,

    total,

    totalPages,

    refresh: load,

  };
}