
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Candidates() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [elections, setElections] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [electionId, setElectionId] = useState('');

  const token = localStorage.getItem('token');

  const loadCandidates = async () => {
    const response = await axios.get(
      'http://localhost:3000/candidates'
    );

    setCandidates(response.data);
  };

  const loadElections = async () => {
    const response = await axios.get(
      'http://localhost:3000/elections'
    );

    setElections(response.data);
  };

  const createCandidate = async () => {
    try {
      await axios.post(
        'http://localhost:3000/candidates',
        {
          name,
          manifesto,
          electionId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Candidate Created');

      setName('');
      setManifesto('');
      setElectionId('');

      loadCandidates();
    } catch (error) {
      alert('Failed to create candidate');
    }
  };

  useEffect(() => {
    loadCandidates();
    loadElections();
  }, []);

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Candidates
      </h1>

      <div className="bg-white p-6 rounded shadow mb-8">

        <h2 className="text-xl font-bold mb-4">
          Create Candidate
        </h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Candidate Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <textarea
          className="border p-2 w-full mb-3"
          placeholder="Manifesto"
          value={manifesto}
          onChange={(e) =>
            setManifesto(e.target.value)
          }
        />

        <select
          className="border p-2 w-full mb-3"
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

        <button
          onClick={createCandidate}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Create Candidate
        </button>

      </div>

      {candidates.map((candidate) => (
        <div
          key={candidate.id}
          className="bg-white p-4 rounded shadow mb-4"
        >
          <h2 className="text-xl font-bold">
            {candidate.name}
          </h2>

          <p>{candidate.manifesto}</p>

          <p>
            Election:
            <b>
              {' '}
              {candidate.election?.title}
            </b>
          </p>
        </div>
      ))}

    </div>
  );
}

