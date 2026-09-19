import { useState } from 'react';
import { Download, Upload } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import EmptyState from '../../../components/empty-state/EmptyState';

import { useElections } from '../../election/hooks';
import {
  useVoterActions,
  useVoterRollStats,
  useVoters,
} from '../hooks';

import VoterStatusBadge from '../components/VoterStatusBadge';
import VoterRollStatsCard from '../components/VoterRollStatsCard';
import VoterImportDialog from '../components/VoterImportDialog';

import { VoterService } from '../services';
import { VoterRegistrationStatus } from '../types';
import ApiError from '../../../utils/api-error';

import type { QueryVoterDto } from '../types';

const STATUS_FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: VoterRegistrationStatus.PENDING },
  { label: 'Verified', value: VoterRegistrationStatus.VERIFIED },
  { label: 'On roll', value: VoterRegistrationStatus.APPROVED },
  { label: 'Rejected', value: VoterRegistrationStatus.REJECTED },
] as const;

export default function VoterRollPage() {
  const { elections } = useElections();

  const [electionId, setElectionId] = useState<string>('');
  const [status, setStatus] = useState<QueryVoterDto['status']>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [importOpen, setImportOpen] = useState(false);

  const query: QueryVoterDto = {
    electionId: electionId || undefined,
    status,
    search: search.trim() || undefined,
    page,
    limit: 10,
  };

  const { loading, voters, meta, refresh } = useVoters(query);
  const { stats, refresh: refreshStats } = useVoterRollStats(
    electionId || undefined,
  );

  const refreshAll = () => {
    void refresh();
    void refreshStats();
  };

  const actions = useVoterActions(refreshAll);

  async function handleExport() {
    try {
      const csv = await VoterService.exportCsv(query);

      // Client-side download so the request still carries the auth
      // header — a plain link to the endpoint would not.
      const url = URL.createObjectURL(
        new Blob([csv], { type: 'text/csv;charset=utf-8' }),
      );

      const link = document.createElement('a');

      link.href = url;
      link.download = 'voter-roll.csv';
      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      ApiError.handle(err);
    }
  }

  async function handleReject(id: string) {
    const reason = window.prompt(
      'Why is this registration being rejected? The voter is told.',
    );

    if (!reason?.trim()) {
      return;
    }

    await actions.reject(id, reason.trim());
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Voter roll</h1>

          <p className="text-sm text-slate-500">
            Verify registrations and admit voters to an election.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleExport()}
          >
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Export CSV
          </Button>

          <Button
            type="button"
            onClick={() => setImportOpen(true)}
            disabled={!electionId}
            title={
              electionId
                ? undefined
                : 'Choose an election before importing a roll'
            }
          >
            <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
            Import CSV
          </Button>
        </div>
      </header>

      {stats && <VoterRollStatsCard stats={stats} />}

      <Card className="p-6">
        <div className="flex flex-wrap gap-4">
          <label className="flex-1 min-w-[220px]">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Election
            </span>

            <select
              value={electionId}
              onChange={(event) => {
                setElectionId(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All elections</option>

              {elections.map((election) => (
                <option key={election.id} value={election.id}>
                  {election.title}
                </option>
              ))}
            </select>
          </label>

          <label className="flex-1 min-w-[220px]">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Search
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Name, email or registration number"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => {
                setStatus(filter.value);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                status === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <Spinner />
          </div>
        ) : voters.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No registrations"
              description="Nothing matches these filters yet."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Voter</th>
                  <th className="px-6 py-3">Election</th>
                  <th className="px-6 py-3">Source</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {voters.map((registration) => {
                  const busy = actions.pendingId === registration.id;

                  return (
                    <tr
                      key={registration.id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {registration.user.fullName}
                        </p>

                        <p className="text-xs text-slate-500">
                          {registration.user.email}
                          {registration.user.registrationNumber
                            ? ` · ${registration.user.registrationNumber}`
                            : ''}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {registration.election.title}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {registration.source}
                      </td>

                      <td className="px-6 py-4">
                        <VoterStatusBadge status={registration.status} />

                        {registration.rejectionReason && (
                          <p className="mt-1 text-xs text-red-600">
                            {registration.rejectionReason}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {registration.status ===
                            VoterRegistrationStatus.PENDING && (
                            <Button
                              type="button"
                              size="sm"
                              disabled={busy}
                              onClick={() =>
                                void actions.verify(registration.id)
                              }
                            >
                              Verify
                            </Button>
                          )}

                          {registration.status ===
                            VoterRegistrationStatus.VERIFIED && (
                            <Button
                              type="button"
                              size="sm"
                              variant="success"
                              disabled={busy}
                              onClick={() =>
                                void actions.approve(registration.id)
                              }
                            >
                              Approve
                            </Button>
                          )}

                          {(registration.status ===
                            VoterRegistrationStatus.PENDING ||
                            registration.status ===
                              VoterRegistrationStatus.VERIFIED) && (
                            <Button
                              type="button"
                              size="sm"
                              variant="danger"
                              disabled={busy}
                              onClick={() => void handleReject(registration.id)}
                            >
                              Reject
                            </Button>
                          )}

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => void actions.remove(registration.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <p className="text-sm text-slate-500">
              Page {meta.page} of {meta.totalPages} &middot; {meta.total}{' '}
              registrations
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={meta.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {importOpen && electionId && (
        <VoterImportDialog
          electionId={electionId}
          onClose={() => setImportOpen(false)}
          onImported={refreshAll}
        />
      )}
    </div>
  );
}
