import { useEffect, useState } from 'react';

import { ElectionService } from '../services';
import { getErrorMessage } from '../../../utils/api-error';
import { useElectionRefresh } from '../context/ElectionContext';

import type {
  Election,
  QueryElectionDto,
} from '../types';

export function useElections(
  query?: QueryElectionDto,
) {
  const { refreshKey } =
    useElectionRefresh();

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

  async function load() {
    try {
      setLoading(true);

      const result =
        await ElectionService.getAll(
          query,
        );

      setElections(
        result.data,
      );

      setTotal(
        result.total,
      );

      setTotalPages(
        result.totalPages,
      );

      setError(null);

    } catch (err: unknown) {

      setError(
        getErrorMessage(err, 'Unable to load elections.'),
      );

    } finally {

      setLoading(false);

    }
  }

  // Deliberately keyed on the serialized value of `query`, not `load` or
  // `query` itself: callers often pass a fresh object literal each render,
  // which would otherwise give `load` (and the effect) a new identity -
  // and therefore refetch - every render regardless of whether the query
  // actually changed. `load` always closes over the latest `query` anyway.
  const queryKey = JSON.stringify(query);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, refreshKey]);

  return {

    loading,

    error,

    elections,

    total,

    totalPages,

    refresh: load,

  };
}