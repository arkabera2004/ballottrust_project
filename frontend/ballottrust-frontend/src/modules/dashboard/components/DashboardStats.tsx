import StatCard from '../../../components/StatCard';

import type {
  DashboardStats as DashboardStatsType,
} from '../types/dashboard.types';

interface Props {
  stats: DashboardStatsType;
}

export default function DashboardStats({
  stats,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      <StatCard
        title="Total Voters"
        value={stats.registeredVoters}
        color="bg-gradient-to-r from-blue-500 to-blue-700"
      />

      <StatCard
        title="Pending Voters"
        value={stats.pendingVoters}
        color="bg-gradient-to-r from-yellow-500 to-orange-500"
      />

      <StatCard
        title="Candidates"
        value={stats.candidates}
        color="bg-gradient-to-r from-purple-500 to-purple-700"
      />

      <StatCard
        title="Active Elections"
        value={stats.activeElections}
        color="bg-gradient-to-r from-green-500 to-green-700"
      />

    </div>
  );
}   