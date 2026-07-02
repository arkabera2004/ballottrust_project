import { useState } from 'react';
import axios from 'axios';

export default function Blockchain() {
  const [result, setResult] = useState<any>(null);

  const verifyBlockchain = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3000/blockchain/verify'
      );

      setResult(response.data);
    } catch {
      alert('Verification Failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-3xl font-bold mb-6">
        Blockchain Verification
      </h1>

      <button
        onClick={verifyBlockchain}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
      >
        Verify Blockchain
      </button>

      {result && (
        <div className="bg-white p-6 rounded shadow">

          <h2 className="text-2xl font-bold mb-4">
            Verification Result
          </h2>

          <div className="mb-3">
            Status:
            <span
              className={
                result.valid
                  ? 'text-green-600 font-bold ml-2'
                  : 'text-red-600 font-bold ml-2'
              }
            >
              {result.valid
                ? 'VALID'
                : 'INVALID'}
            </span>
          </div>

          <div className="mb-3">
            Message:
            <b> {result.message}</b>
          </div>

          <div>
            Total Votes:
            <b> {result.totalVotes ?? 0}</b>
          </div>

        </div>
      )}

    </div>
  );
}

