import { useState } from 'react';
import { CalendarClock } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import EmptyState from '../../../components/empty-state/EmptyState';

import { useElections } from '../../election/hooks';
import { useMyRegistrations } from '../hooks';

import VoterStatusBadge from '../components/VoterStatusBadge';

import { VoterService } from '../services';
import ApiError from '../../../utils/api-error';
import Toast from '../../../utils/toast';

/** A voter's own registrations, and the elections they can still join. */
export default function MyRegistrationsPage() {
  const { loading, registrations, refresh } = useMyRegistrations();
  const { elections } = useElections();

  const [busyId, setBusyId] = useState<string | null>(null);

  const registeredIds = new Set(registrations.map((r) => r.electionId));

  // Registration is only accepted while an election is published and
  // inside its window; the API is the authority, this just avoids
  // offering an action that is certain to fail.
  const joinable = elections.filter(
    (election) =>
      !registeredIds.has(election.id) && election.status === 'PUBLISHED',
  );

  async function handleRegister(electionId: string) {
    try {
      setBusyId(electionId);

      await VoterService.register(electionId);

      Toast.success('Registered. An officer will review your details.');

      void refresh();
    } catch (err) {
      ApiError.handle(err);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">My registrations</h1>

        <p className="text-sm text-slate-500">
          You must be approved on an election&rsquo;s roll before you can vote
          in it.
        </p>
      </header>

      {registrations.length === 0 ? (
        <EmptyState
          title="No registrations yet"
          description="Register for an open election below to take part."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {registrations.map((registration) => (
            <Card key={registration.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {registration.election.title}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {registration.election.electionCode}
                  </p>
                </div>

                <VoterStatusBadge status={registration.status} />
              </div>

              {registration.rejectionReason && (
                <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {registration.rejectionReason}
                </p>
              )}

              <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                Registered{' '}
                {new Date(registration.registeredAt).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}

      {joinable.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Open for registration
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {joinable.map((election) => (
              <Card key={election.id} className="p-6">
                <h3 className="font-semibold text-slate-900">
                  {election.title}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {election.description ?? 'No description provided.'}
                </p>

                <Button
                  type="button"
                  className="mt-4"
                  disabled={busyId === election.id}
                  onClick={() => void handleRegister(election.id)}
                >
                  {busyId === election.id ? 'Registering…' : 'Register to vote'}
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
