import {
  useEffect,
  useState,
} from 'react';

import {
  DashboardService,
} from '../services';

import type {
  DashboardStats,
  CurrentElection,
  PendingCandidate,
} from '../types/dashboard.types';

export function useDashboard() {

  const [loading, setLoading] =
    useState(true);

  const [stats, setStats] =
    useState<DashboardStats>({
      registeredVoters: 0,
      pendingVoters: 0,
      candidates: 0,
      activeElections: 0,
    });

  const [currentElection,
    setCurrentElection] =
    useState<CurrentElection | null>(
      null,
    );

  const [pendingCandidates,
    setPendingCandidates] =
    useState<PendingCandidate[]>([]);

  async function refresh() {

    setLoading(true);

    const [
      stats,
      election,
      pending,
    ] = await Promise.all([

      DashboardService.getStats(),

      DashboardService.getCurrentElection(),

      DashboardService.getPendingCandidates(),

    ]);

    setStats(stats);
    setCurrentElection(election);
    setPendingCandidates(pending);

    setLoading(false);

  }

  useEffect(() => {
    refresh();
  }, []);

  return {

    loading,

    stats,

    currentElection,

    pendingCandidates,

    refresh,

  };

}