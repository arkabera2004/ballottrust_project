import Card from '../../../components/cards/Card';
import StatusBadge from '../../../components/badges/StatusBadge';

import type { Election } from '../types';

interface Props {
  election: Election;
}

export default function ElectionInfoCard({
  election,
}: Props) {
  return (
    <Card>

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold">
            {election.title}
          </h2>

          <p className="mt-1 text-slate-500">
            {election.electionCode}
          </p>

        </div>

        <StatusBadge
          status={election.status}
        />

      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">

        <div>
          <p className="text-sm text-slate-500">
            Election Type
          </p>

          <p className="font-semibold">
            {election.electionType}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Candidate Limit
          </p>

          <p className="font-semibold">
            {election.candidateLimit}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Maximum Votes
          </p>

          <p className="font-semibold">
            {election.maximumVotes}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Result Visibility
          </p>

          <p className="font-semibold">
            {election.resultVisibility}
          </p>
        </div>

      </div>

    </Card>
  );
}