import { useCallback, useEffect, useState } from 'react';

import api from '../api/axios';
import toast from '../utils/toast';

export default function Vote() {
  const [elections, setElections] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);

  const [electionId, setElectionId] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  const loadElections = useCallback(async () => {
    try {
      const response = await api.get(
        '/public/elections'
      );

      setElections(response.data.data.items);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const loadCandidates = useCallback(async () => {
    try {
      const response = await api.get(
        '/public/candidates',
        electionId
          ? { params: { electionId } }
          : undefined,
      );

      setCandidates(response.data.data.items);
    } catch (error) {
      console.error(error);
    }
  }, [electionId]);

  const castVote = async () => {
    if (!electionId) {
      toast.error('Please select an election');
      return;
    }

    if (!candidateId) {
      toast.error('Please select a candidate');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to vote for ${selectedCandidate?.user?.fullName}?`
    );

    if (!confirmed) return;

    try {
      await api.post(
        '/votes',
        {
          candidateId,
          electionId,
        },
      );

      toast.success('Vote Cast Successfully');

      setCandidateId('');
      setSelectedCandidate(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          'Vote Failed'
      );
    }
  };

  useEffect(() => {
    loadElections();
  }, [loadElections]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-2">
          🗳 Cast Your Vote
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Choose your preferred candidate and participate in the election.
        </p>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

          <label className="block font-semibold mb-2">
            Select Election
          </label>

          <select
            className="border border-gray-300 rounded-lg p-3 w-full"
            value={electionId}
            onChange={(e) =>
              setElectionId(e.target.value)
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

        </div>

        <h2 className="text-2xl font-bold mb-4">
          Candidates
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {candidates.map((candidate) => (

            <div
              key={candidate.id}
              onClick={() => {
                setCandidateId(candidate.id);
                setSelectedCandidate(candidate);
              }}
              className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300
              ${
                selectedCandidate?.id === candidate.id
                  ? 'border-4 border-blue-600 bg-blue-50'
                  : 'hover:shadow-2xl'
              }`}
            >

              <div className="flex justify-center mb-4">

                <img
                  src={
                    candidate.photoUrl ||
                    'https://via.placeholder.com/150'
                  }
                  alt={candidate.user?.fullName}
                  className="w-28 h-28 rounded-full object-cover border"
                />

              </div>

              <h3 className="text-xl font-bold text-center">
                {candidate.user?.fullName}
              </h3>

              <p className="text-center text-gray-600 mb-4">
                {candidate.party?.name || 'Independent'}
              </p>

              <div className="space-y-2 text-sm">

                <p>
                  <strong>Position:</strong>{' '}
                  {candidate.position || 'N/A'}
                </p>

                <p>
                  <strong>Slogan:</strong>{' '}
                  {candidate.campaignSlogan ||
                    'No slogan uploaded'}
                </p>

              </div>

              <button
                className={`mt-5 w-full py-2 rounded-lg font-semibold
                ${
                  selectedCandidate?.id === candidate.id
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {selectedCandidate?.id === candidate.id
                  ? '✓ Selected'
                  : 'Select Candidate'}
              </button>

            </div>

          ))}

        </div>

        {selectedCandidate && (

          <div className="bg-green-50 border border-green-300 rounded-xl p-5 mt-8">

            <h3 className="text-xl font-bold text-green-700 mb-2">
              Selected Candidate
            </h3>

            <p>
              <strong>Name:</strong>{' '}
              {selectedCandidate.user?.fullName}
            </p>

            <p>
              <strong>Party:</strong>{' '}
              {selectedCandidate.party?.name ||
                'Independent'}
            </p>

          </div>

        )}

        <div className="mt-8">

          <button
            onClick={castVote}
            disabled={!candidateId || !electionId}
            className="w-full bg-green-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Cast Vote
          </button>

        </div>

      </div>

    </div>
  );
}
