import { CheckCircle2, Clock, ShieldCheck, XCircle } from 'lucide-react';

import Card from '../../../components/ui/Card';

import type { VoterRollStats } from '../types';

const WINDOW_LABELS: Record<VoterRollStats['registrationStatus'], string> = {
  OPEN: 'Registration open',
  NOT_STARTED: 'Registration not yet open',
  ENDED: 'Registration closed',
  NOT_CONFIGURED: 'No registration window configured',
  CLOSED: 'Not accepting registrations',
};

export default function VoterRollStatsCard({
  stats,
}: {
  stats: VoterRollStats;
}) {
  const tiles = [
    {
      label: 'Pending',
      value: stats.byStatus.PENDING,
      icon: Clock,
      tone: 'text-amber-600',
    },
    {
      label: 'Verified',
      value: stats.byStatus.VERIFIED,
      icon: ShieldCheck,
      tone: 'text-cyan-600',
    },
    {
      label: 'On roll',
      value: stats.byStatus.APPROVED,
      icon: CheckCircle2,
      tone: 'text-green-600',
    },
    {
      label: 'Rejected',
      value: stats.byStatus.REJECTED,
      icon: XCircle,
      tone: 'text-red-600',
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {stats.electionTitle}
          </h3>

          <p className="text-sm text-slate-500">
            {WINDOW_LABELS[stats.registrationStatus]}
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900">{stats.eligible}</p>

          <p className="text-xs text-slate-500">
            eligible to vote &middot; {stats.total} registered
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 p-4"
          >
            <Icon className={`h-5 w-5 ${tone}`} aria-hidden="true" />

            <p className="mt-2 text-xl font-semibold text-slate-900">
              {value}
            </p>

            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
