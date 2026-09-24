import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import candidateService from '../modules/candidate/services/candidate.service';
import type { Candidate } from '../modules/candidate/types/candidate.types';
import Toast from '../utils/toast';

/**
 * Administrative candidate roster.
 *
 * This page previously called axios directly against a hardcoded
 * http://localhost:3000/candidates, read the token from a 'token' key that
 * the app never writes, and submitted a create form to an endpoint that does
 * not exist — nomination is POST /candidates/nominate and requires
 * candidateType, position and nominationStatement, none of which the form
 * collected. None of it could succeed against the current API.
 *
 * It now reads through the shared api client, which applies the /api/v1 base
 * URL, attaches the access token and refreshes it on 401. Creating a
 * candidate links to the existing nomination flow rather than duplicating it
 * with a form that cannot satisfy the DTO.
 */
export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const page = await candidateService.list({ page: 1, limit: 50 });

        if (cancelled) {
          return;
        }

        setCandidates(page.data);
        setTotal(page.total);
        setError(null);
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }

        // Surface what the server actually said. The previous version
        // discarded the error and showed a fixed "Failed to create
        // candidate" alert, which hid permission failures entirely — this
        // list is restricted to SUPER_ADMIN and ELECTION_COMMISSIONER.
        const message = extractMessage(err);

        setError(message);
        Toast.error(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="p-6 text-sm text-gray-500">Loading candidates…</p>;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Candidates{' '}
          <span className="text-sm font-normal text-gray-500">({total})</span>
        </h1>

        <Link
          to="/candidate-nomination"
          className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
        >
          Submit a nomination
        </Link>
      </div>

      {candidates.length === 0 ? (
        <p className="text-sm text-gray-500">No candidates yet.</p>
      ) : (
        <ul className="divide-y rounded border">
          {candidates.map((candidate) => (
            <li key={candidate.id} className="flex justify-between gap-4 p-3">
              <div>
                <p className="font-medium">{candidate.position}</p>

                <p className="text-sm text-gray-500">
                  {candidate.candidateType}
                </p>
              </div>

              <span className="self-center text-sm text-gray-600">
                {candidate.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function extractMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object'
  ) {
    const response = (error as { response?: { data?: { message?: unknown } } })
      .response;

    const message = response?.data?.message;

    if (typeof message === 'string') {
      return message;
    }

    if (Array.isArray(message) && typeof message[0] === 'string') {
      return message[0];
    }
  }

  return 'Could not load candidates.';
}
