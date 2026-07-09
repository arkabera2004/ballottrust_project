import { useNavigate } from 'react-router-dom';

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

      <button
        onClick={() => navigate('/elections')}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl shadow-md transition duration-300 hover:scale-105"
      >
        + Create Election
      </button>

      <button
        onClick={() =>
          navigate('/candidate-approval')
        }
        className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl shadow-md transition duration-300 hover:scale-105"
      >
        ✓ Approve Candidates
      </button>

      <button
        onClick={() => navigate('/results')}
        className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl shadow-md transition duration-300 hover:scale-105"
      >
        📊 View Results
      </button>

      <button
        onClick={() =>
          navigate('/blockchain')
        }
        className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-xl shadow-md transition duration-300 hover:scale-105"
      >
        ⛓ Blockchain Explorer
      </button>

    </div>
  );
}