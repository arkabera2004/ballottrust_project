import { useQuery } from '@tanstack/react-query';

import {
  DashboardService,
} from '../services';

import type {
  DashboardStats,
} from '../types/dashboard.types';

const EMPTY_STATS: DashboardStats = {
  registeredVoters: 0,
  pendingVoters: 0,
  candidates: 0,
  activeElections: 0,
};

export function useDashboard() {
  const result = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () =>
      Promise.all([
        DashboardService.getStats(),
        DashboardService.getCurrentElection(),
        DashboardService.getPendingCandidates(),
      ]),
  });

  const [stats, currentElection, pendingCandidates] = result.data ?? [
    EMPTY_STATS,
    null,
    [],
  ];

  return {
    loading: result.isLoading,
    error: result.error ? 'Could not load the dashboard.' : null,
    stats,
    currentElection,
    pendingCandidates,
    refresh: result.refetch,
  };
}
