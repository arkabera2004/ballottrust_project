import type {
  CurrentElection,
} from '../types/dashboard.types';

interface Props {
  election: CurrentElection | null;
}

export default function CurrentElectionCard({
  election,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">
        Current Election
      </h2>

      {election ? (
        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <p className="text-gray-500">
              Election Name
            </p>

            <p className="font-semibold text-lg">
              {election.title}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Status
            </p>

            <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-semibold">
              {election.status}
            </span>
          </div>

          <div>
            <p className="text-gray-500">
              Candidates
            </p>

            <p>{election.candidates}</p>
          </div>

          <div>
            <p className="text-gray-500">
              Votes Cast
            </p>

            <p>{election.votes}</p>
          </div>

        </div>
      ) : (
        <p className="text-gray-500">
          No active election found.
        </p>
      )}
    </div>
  );
}