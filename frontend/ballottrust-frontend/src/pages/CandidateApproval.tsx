import { useEffect, useState } from 'react';

import api from '../api/axios';
import toast from '../utils/toast';

import DashboardLayout from '../components/DashboardLayout';

type Candidate = {
  id: string;
  user: { fullName: string; email: string };
  position: string;
  campaignSlogan: string | null;
  status: string;
};

export default function CandidateApproval() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const loadCandidates = async () => {
    try {
      const response = await api.get(
        '/candidates',
        {
          params: {
            status: 'PENDING',
            limit: 50,
          },
        },
      );

      setCandidates(response.data.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const approveCandidate = async (
    id: string,
  ) => {
    try {
      // The backend lifecycle only allows PENDING -> VERIFIED -> APPROVED;
      // approving straight from PENDING is rejected with a 400, so this
      // queue's one-click "Approve" has to make both transitions.
      await api.patch(
        `/candidates/${id}/verify`,
      );

      await api.patch(
        `/candidates/${id}/approve`,
      );

      toast.success('Candidate Approved');

      loadCandidates();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          'Approval Failed'
      );
    }
  };

  const rejectCandidate = async (
    id: string,
  ) => {
    try {
      await api.patch(
        `/candidates/${id}/reject`,
      );

      toast.success('Candidate Rejected');

      loadCandidates();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          'Rejection Failed'
      );
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

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
                      approveCandidate(candidate.id)
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      rejectCandidate(candidate.id)
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
