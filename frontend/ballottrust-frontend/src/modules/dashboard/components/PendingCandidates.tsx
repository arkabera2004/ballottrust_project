import type {
  PendingCandidate,
} from '../types/dashboard.types';

interface Props {
  candidates: PendingCandidate[];

  onApprove: (
    id: string,
  ) => void;

  onReject: (
    id: string,
  ) => void;
}

export default function PendingCandidates({
  candidates,
  onApprove,
  onReject,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <h2 className="text-xl font-bold mb-4">
        Pending Candidate Approvals
      </h2>

      <div className="space-y-3">

        {candidates.length === 0 ? (

          <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center">

            <p className="text-gray-500">
              No pending candidates
            </p>

          </div>

        ) : (

          candidates.map(
            (candidate) => (

              <div
                key={candidate.id}
                className="border rounded-xl p-4 flex justify-between items-center"
              >

                <div>

                  <p className="font-semibold">
                    {candidate.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {
                      candidate.election?.title
                    }
                  </p>

                </div>

                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      onApprove(
                        candidate.id,
                      )
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      onReject(
                        candidate.id,
                      )
                    }
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                  >
                    Reject
                  </button>

                </div>

              </div>

            ),
          )

        )}

      </div>

    </div>
  );
}