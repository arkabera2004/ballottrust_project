import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, Vote } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import EmptyState from '../../../components/empty-state/EmptyState';
import StatusBadge from '../../../components/badges/StatusBadge';

import { PublicService } from '../services';

import type { PublicElection, PublicStatistics } from '../types';

export default function PublicElectionsPage() {
  const [loading, setLoading] = useState(true);
  const [elections, setElections] = useState<PublicElection[]>([]);
  const [stats, setStats] = useState<PublicStatistics | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const [electionPage, statistics] = await Promise.all([
          PublicService.elections({ search: search.trim() || undefined }),
          PublicService.statistics(),
        ]);

        if (cancelled) return;

        setElections(electionPage.items);
        setStats(statistics);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timer = window.setTimeout(() => void load(), 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">Elections</h1>

        <p className="mt-3 text-slate-600">
          Published elections, candidates and results — open to everyone, no
          sign-in required.
        </p>
      </header>

      {stats && (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Elections', value: stats.totalElections, icon: Vote },
            { label: 'Currently open', value: stats.activeElections, icon: CalendarDays },
            { label: 'Candidates', value: stats.totalCandidates, icon: Users },
            { label: 'Votes cast', value: stats.totalVotesCast, icon: Vote },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-6 text-center">
              <Icon
                className="mx-auto h-5 w-5 text-blue-600"
                aria-hidden="true"
              />

              <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>

              <p className="text-xs text-slate-500">{label}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-10">
        <label htmlFor="election-search" className="sr-only">
          Search elections
        </label>

        <input
          id="election-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search elections"
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : elections.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No published elections"
            description="There is nothing to show publicly just yet."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {elections.map((election) => (
            <Link
              key={election.id}
              to={`/elections-public/${election.id}`}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-3xl"
            >
              <Card className="h-full p-6 transition hover:shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-slate-900">
                    {election.title}
                  </h2>

                  <StatusBadge status={election.status} />
                </div>

                <p className="mt-3 line-clamp-3 text-sm text-slate-600">
                  {election.description ?? 'No description provided.'}
                </p>

                <p className="mt-4 text-xs text-slate-500">
                  {new Date(election.startDate).toLocaleDateString()} &ndash;{' '}
                  {new Date(election.endDate).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
