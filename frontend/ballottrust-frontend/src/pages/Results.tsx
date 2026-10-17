import { useEffect, useState } from 'react';

import api from '../api/axios';

export default function Results() {
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] =
    useState('');

  const [results, setResults] = useState<any>(null);

  const loadElections = async () => {
    const response = await api.get(
      '/public/elections',
    );

    setElections(response.data.data.items);
  };

  const loadResults = async () => {
    if (!selectedElection) return;

    const response = await api.get(
      `/public/results/${selectedElection}`
    );

    setResults(response.data.data);
  };

  useEffect(() => {
    loadElections();
  }, []);

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
        onClick={loadResults}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
      >
        View Results
      </button>

      {results && (
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
