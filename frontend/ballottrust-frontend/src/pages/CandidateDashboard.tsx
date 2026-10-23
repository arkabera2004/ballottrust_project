import CandidateStatusCard from '../modules/candidate/components/CandidateStatusCard';
import { useMyCandidates } from '../modules/candidate/hooks';

export default function CandidateDashboard() {
  const {
    candidates,
    loading,
    error,
    refresh,
  } = useMyCandidates();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">

        <div className="mx-auto max-w-6xl">

          <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />

          <div className="mt-6 h-48 animate-pulse rounded-2xl bg-slate-200" />

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">

      <div className="mx-auto max-w-6xl">

        <div className="flex items-center justify-between gap-4">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Candidate Dashboard
            </h1>

            <p className="mt-1 text-slate-500">
              View your candidacies and their current status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refresh()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>

        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">

            <p className="font-semibold text-red-700">
              Unable to load candidacies
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

          </div>
        )}

        {!error && candidates.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

            <h2 className="text-xl font-semibold text-slate-800">
              No Candidacies
            </h2>

            <p className="mt-2 text-slate-500">
              You have not submitted a candidacy yet.
            </p>

          </div>
        )}

        {candidates.length > 0 && (
          <div className="mt-8 space-y-6">

            {candidates.map((candidate) => (
              <CandidateStatusCard
                key={candidate.id}
                candidate={candidate}
                onComplete={refresh}
              />
            ))}

          </div>
        )}

      </div>

    </div>
  );
}