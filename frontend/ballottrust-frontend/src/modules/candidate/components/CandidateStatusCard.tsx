import StatusBadge from '../../../components/badges/StatusBadge';

import type { Candidate } from '../types';

import CandidateActions from './actions/CandidateActions';

interface CandidateStatusCardProps {
  candidate: Candidate;
  onComplete?: () => void;
}

export default function CandidateStatusCard({
  candidate,
  onComplete,
}: CandidateStatusCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-sm text-slate-500">
            Election
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            {candidate.election?.title ??
              'Election'}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {candidate.election?.electionCode ??
              ''}
          </p>
        </div>

        <StatusBadge
          status={candidate.status}
        />

      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">

        <div>
          <p className="text-sm text-slate-500">
            Position
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {candidate.position}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Candidate Type
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {candidate.candidateType === 'PARTY'
              ? 'Party'
              : 'Independent'}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Candidate Number
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {candidate.candidateNumber ??
              'Not assigned'}
          </p>
        </div>

      </div>

      {candidate.party && (
        <div className="mt-5 border-t border-slate-100 pt-5">

          <p className="text-sm text-slate-500">
            Party
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {candidate.party.name}
          </p>

        </div>
      )}

      {candidate.rejectionReason && (
        <div className="mt-5 rounded-lg bg-red-50 p-4">

          <p className="text-sm font-semibold text-red-700">
            Rejection Reason
          </p>

          <p className="mt-1 text-sm text-red-600">
            {candidate.rejectionReason}
          </p>

        </div>
      )}

      {candidate.withdrawalReason && (
        <div className="mt-5 rounded-lg bg-slate-50 p-4">

          <p className="text-sm font-semibold text-slate-700">
            Withdrawal Reason
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {candidate.withdrawalReason}
          </p>

        </div>
      )}

      {candidate.disqualificationReason && (
        <div className="mt-5 rounded-lg bg-red-50 p-4">

          <p className="text-sm font-semibold text-red-700">
            Disqualification Reason
          </p>

          <p className="mt-1 text-sm text-red-600">
            {candidate.disqualificationReason}
          </p>

        </div>
      )}

      <CandidateActions
        candidate={candidate}
        onComplete={onComplete}
      />

    </div>
  );
}