import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Card from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import EmptyState from '../../../components/empty-state/EmptyState';
import StatusBadge from '../../../components/badges/StatusBadge';

import { ENV } from '../../../config/env';
import { PublicService } from '../services';

import type {
  PublicCandidate,
  PublicElectionDetail,
  PublicResults,
} from '../types';

export default function PublicElectionDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [election, setElection] = useState<PublicElectionDetail | null>(null);
  const [candidates, setCandidates] = useState<PublicCandidate[]>([]);
  const [results, setResults] = useState<PublicResults | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const detail = await PublicService.election(id!);

        if (cancelled) return;

        setElection(detail);

        const candidatePage = await PublicService.candidates({
          electionId: detail.id,
          limit: 50,
        });

        if (cancelled) return;

        setCandidates(candidatePage.items);

        // Only fetch results when the election's visibility policy says
        // they are public; otherwise the request is a guaranteed 403.
        if (detail.resultsAvailable) {
          const tally = await PublicService.results(detail.id);

          if (!cancelled) setResults(tally);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!election) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState
          title="Election not found"
          description="This election is not published, or the link is wrong."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900">
            {election.title}
          </h1>

          <StatusBadge status={election.status} />
        </div>

        <p className="mt-2 text-sm text-slate-500">
          {election.electionCode} &middot;{' '}
          {new Date(election.startDate).toLocaleDateString()} &ndash;{' '}
          {new Date(election.endDate).toLocaleDateString()}
        </p>

        {election.description && (
          <p className="mt-4 text-slate-700">{election.description}</p>
        )}
      </header>

      {results && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Results</h2>

          <p className="mt-1 text-sm text-slate-500">
            {results.totalVotes} votes cast
            {results.isTie && results.winners.length > 1
              ? ` · tied between ${results.winners
                  .map((w) => w.name)
                  .join(' and ')}`
              : ''}
          </p>

          <Card className="mt-4 p-6">
            <ul className="space-y-4">
              {results.results.map((row) => (
                <li key={row.candidateId}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-medium text-slate-900">
                      {row.name}
                      {row.party ? ` (${row.party.name})` : ''}
                    </span>

                    <span className="text-sm text-slate-600">
                      {row.votes} &middot; {row.percentage}%
                    </span>
                  </div>

                  <div
                    className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100"
                    role="img"
                    aria-label={`${row.name}: ${row.percentage}% of votes`}
                  >
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${row.percentage}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">Candidates</h2>

        {candidates.length === 0 ? (
          <p className="mt-4 text-slate-500">
            No candidates have been approved for this election yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {candidates.map((candidate) => (
              <Link
                key={candidate.id}
                to={`/candidates-public/${candidate.id}`}
                className="block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Card className="h-full p-6 transition hover:shadow-xl">
                  <div className="flex items-center gap-4">
                    {candidate.photoUrl ?? candidate.user.avatarUrl ? (
                      <img
                        src={`${ENV.ASSET_URL}${
                          candidate.photoUrl ?? candidate.user.avatarUrl
                        }`}
                        alt=""
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-500"
                        aria-hidden="true"
                      >
                        {candidate.user.fullName.charAt(0)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {candidate.user.fullName}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {candidate.party?.name ?? 'Independent'}
                        {candidate.candidateNumber
                          ? ` · No. ${candidate.candidateNumber}`
                          : ''}
                      </p>
                    </div>
                  </div>

                  {candidate.campaignSlogan && (
                    <p className="mt-4 line-clamp-2 text-sm italic text-slate-600">
                      &ldquo;{candidate.campaignSlogan}&rdquo;
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
