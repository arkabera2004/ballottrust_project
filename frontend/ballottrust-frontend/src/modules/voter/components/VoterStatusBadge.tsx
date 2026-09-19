import clsx from 'clsx';

import type { VoterRegistrationStatus } from '../types';

const STYLES: Record<VoterRegistrationStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  VERIFIED: 'bg-cyan-100 text-cyan-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const LABELS: Record<VoterRegistrationStatus, string> = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  APPROVED: 'On roll',
  REJECTED: 'Rejected',
};

export default function VoterStatusBadge({
  status,
}: {
  status: VoterRegistrationStatus;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        STYLES[status] ?? 'bg-slate-100 text-slate-700',
      )}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
