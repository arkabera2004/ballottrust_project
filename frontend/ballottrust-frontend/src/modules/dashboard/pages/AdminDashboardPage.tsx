import DashboardLayout from '../../../components/DashboardLayout';

import {
  DashboardHeader,
  CurrentElectionCard,
  QuickActions,
  DashboardStats,
  PendingCandidates,
  BlockchainStatus,
} from '../components';

import { useDashboard } from '../hooks';
import { DashboardService } from '../services';

export default function AdminDashboardPage() {

  const {
    loading,
    stats,
    currentElection,
    pendingCandidates,
    refresh,
  } = useDashboard();

  async function approveCandidate(
    id: string,
  ) {
    try {

      await DashboardService.approveCandidate(
        id,
      );

      refresh();

    } catch (error) {

      console.error(error);

      alert(
        'Failed to approve candidate',
      );

    }
  }

  async function rejectCandidate(
    id: string,
  ) {
    try {

      await DashboardService.rejectCandidate(
        id,
      );

      refresh();

    } catch (error) {

      console.error(error);

      alert(
        'Failed to reject candidate',
      );

    }
  }

  if (loading) {
    return (
      <DashboardLayout>

        <div className="text-center py-20 text-lg">
          Loading Dashboard...
        </div>

      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      <DashboardHeader />

      <CurrentElectionCard
        election={currentElection}
      />

      <QuickActions />

      <DashboardStats
        stats={stats}
      />

      <div className="grid md:grid-cols-2 gap-6 mt-8">

        <PendingCandidates
          candidates={pendingCandidates}
          onApprove={approveCandidate}
          onReject={rejectCandidate}
        />

        <BlockchainStatus />

      </div>

    </DashboardLayout>
  );
}