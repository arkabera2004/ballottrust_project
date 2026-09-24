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

  const [error, setError] =
    useState<string | null>(null);

  async function refresh() {

    setLoading(true);
    setError(null);

    // Previously an unguarded Promise.all with setLoading(false) after it:
    // any one rejection skipped the reset and the page sat on
    // "Loading Dashboard..." forever. The reset now happens in finally, and
    // the failure is surfaced instead of only reaching the console.
    try {

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

    }

    catch {

      setError('Could not load the dashboard.');

    }

    finally {

      setLoading(false);

    }

  }

  useEffect(() => {
    refresh();
  }, []);

  return {

    loading,

    error,

    stats,

    currentElection,

    pendingCandidates,

    refresh,

  };

}