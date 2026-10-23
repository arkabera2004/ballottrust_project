import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import api from '../api/axios';
import toast from '../utils/toast';
import { getErrorMessage } from '../utils/api-error';

import DashboardLayout from '../components/DashboardLayout';

type Candidate = {
  id: string;
  user: { fullName: string; email: string };
  position: string;
  campaignSlogan: string | null;
  status: string;
};

const PENDING_CANDIDATES_QUERY_KEY = ['candidates', 'pending-approval'];

export default function CandidateApproval() {
  const queryClient = useQueryClient();

  const { data: candidates = [] } = useQuery({
    queryKey: PENDING_CANDIDATES_QUERY_KEY,
    queryFn: async () => {
      const response = await api.get<{ data: { data: Candidate[] } }>(
        '/candidates',
        {
          params: {
            status: 'PENDING',
            limit: 50,
          },
        },
      );

      return response.data.data.data;
    },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: PENDING_CANDIDATES_QUERY_KEY });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      // The backend lifecycle only allows PENDING -> VERIFIED -> APPROVED;
      // approving straight from PENDING is rejected with a 400, so this
      // queue's one-click "Approve" has to make both transitions.
      await api.patch(`/candidates/${id}/verify`);
      await api.patch(`/candidates/${id}/approve`);
    },
    onSuccess: () => {
      toast.success('Candidate Approved');
      invalidate();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Approval Failed'));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/candidates/${id}/reject`),
    onSuccess: () => {
      toast.success('Candidate Rejected');
      invalidate();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Rejection Failed'));
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold">
            Candidate Approvals
          </h1>

          <p className="text-gray-500 mt-2">
            Review and approve candidate nominations
          </p>
        </div>

        {candidates.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow">
            No candidates found.
          </div>
        ) : (
          candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex justify-between items-start">

                <div>
                  <h2 className="text-xl font-bold">
                    {candidate.user.fullName}
                  </h2>

                  <p className="text-gray-500">
                    {candidate.user.email}
                  </p>

                  <p>
                    Position:
                    <span className="font-semibold ml-2">
                      {candidate.position}
                    </span>
                  </p>

                  <p className="mt-3 text-gray-700">
                    {candidate.campaignSlogan}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold
                  ${
                    candidate.status === 'APPROVED'
                      ? 'bg-green-100 text-green-700'
                      : candidate.status === 'REJECTED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {candidate.status}
                </span>

              </div>

              {candidate.status === 'PENDING' && (
                <div className="flex gap-4 mt-6">

                  <button
                    onClick={() =>
                      approveMutation.mutate(candidate.id)
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      rejectMutation.mutate(candidate.id)
                    }
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Reject
                  </button>

                </div>
              )}

            </div>
          ))
        )}

      </div>
    </DashboardLayout>
  );
}
