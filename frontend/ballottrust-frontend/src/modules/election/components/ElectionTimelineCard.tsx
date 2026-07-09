import Card from '../../../components/cards/Card';
import Timeline from '../../../components/timeline/Timeline';

import type { Election } from '../types';

interface Props {
  election: Election;
}

export default function ElectionTimelineCard({
  election,
}: Props) {
  return (
    <Card>

      <h2 className="mb-6 text-xl font-bold">
        Election Timeline
      </h2>

      <Timeline
        items={[
          {
            title: 'Draft',
            completed: true,
          },
          {
            title: 'Approved',
            completed:
              election.status !== 'DRAFT',
          },
          {
            title: 'Published',
            completed: [
              'PUBLISHED',
              'ACTIVE',
              'VOTING_CLOSED',
              'RESULT_PUBLISHED',
              'ARCHIVED',
            ].includes(election.status),
          },
          {
            title: 'Voting Closed',
            completed: [
              'VOTING_CLOSED',
              'RESULT_PUBLISHED',
              'ARCHIVED',
            ].includes(election.status),
          },
          {
            title: 'Archived',
            completed:
              election.status ===
              'ARCHIVED',
          },
        ]}
      />

    </Card>
  );
}