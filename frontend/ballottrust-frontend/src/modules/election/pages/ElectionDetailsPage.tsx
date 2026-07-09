import { useParams } from 'react-router-dom';

import TableSkeleton from '../../../components/skeleton/TableSkeleton';

import { useElection } from '../hooks';

import ElectionInfoCard from '../components/ElectionInfoCard';
import ElectionTimelineCard from '../components/ElectionTimelineCard';

export default function ElectionDetailsPage() {
  const { id } = useParams();

  const {
    election,
    loading,
  } = useElection(id);

  if (loading) {
    return <TableSkeleton />;
  }

  if (!election) {
    return (
      <div className="text-center">
        Election not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <ElectionInfoCard
        election={election}
      />

      <ElectionTimelineCard
        election={election}
      />

    </div>
  );
}