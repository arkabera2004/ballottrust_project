import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import api from '../api/axios';

export default function Results() {
  const [selectedElection, setSelectedElection] =
    useState('');

  const { data: elections = [] } = useQuery({
    queryKey: ['public', 'elections'],
    queryFn: async () => {
      const response = await api.get<{
        data: { items: { id: string; title: string }[] };
      }>('/public/elections');

      return response.data.data.items;
    },
  });

  // Fetched on demand (the "View Results" click), not automatically when
  // selectedElection changes - enabled: false plus a manual refetch() is
  // React Query's way of expressing exactly that.
  const { data: results, refetch: loadResults } = useQuery({
    queryKey: ['public', 'results', selectedElection],
    queryFn: async () => {
      const response = await api.get(
        `/public/results/${selectedElection}`,
      );

      return response.data.data as unknown;
    },
    enabled: false,
  });

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Election Results
      </h1>

      <select
        className="border p-2 w-full mb-4"
        value={selectedElection}
        onChange={(e) =>
          setSelectedElection(e.target.value)
        }
      >
        <option value="">
          Select Election
        </option>

        {elections.map((election) => (
          <option
            key={election.id}
            value={election.id}
          >
            {election.title}
          </option>
        ))}
      </select>

      <button
        onClick={() => loadResults()}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
      >
        View Results
      </button>

      {results != null && (
        <div className="bg-white p-6 rounded shadow">

          <h2 className="text-2xl font-bold mb-4">
            Results
          </h2>

          <pre>
            {JSON.stringify(
              results,
              null,
              2
            )}
          </pre>

        </div>
      )}

    </div>
  );
}
