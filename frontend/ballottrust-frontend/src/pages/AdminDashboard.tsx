import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    registeredVoters: 0,
    pendingVoters: 0,
    candidates: 0,
    activeElections: 0,
  });

  const [currentElection, setCurrentElection] = useState<any>(null);

  const [pendingCandidates, setPendingCandidates] =
    useState<any[]>([]);

  const approveCandidate = async (
    id: string,
  ) => {
    try {
      const token =
        localStorage.getItem('token');

      await axios.patch(
        `http://localhost:3000/candidates/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      loadDashboard();
    } catch (error) {
      console.error(error);
      alert('Failed to approve candidate');
    }
  };

  const rejectCandidate = async (
    id: string,
  ) => {
    try {
      const token =
        localStorage.getItem('token');

      await axios.patch(
        `http://localhost:3000/candidates/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      loadDashboard();
    } catch (error) {
      console.error(error);
      alert('Failed to reject candidate');
    }
  };

  const loadDashboard = async () => {
    try {
      const statsResponse =
        await axios.get(
          'http://localhost:3000/dashboard/stats',
        );

      setStats(statsResponse.data);

      const electionResponse =
        await axios.get(
          'http://localhost:3000/dashboard/current-election',
        );

      setCurrentElection(
        electionResponse.data,
      );

      const pendingResponse =
        await axios.get(
          'http://localhost:3000/candidates/pending',
        );

      setPendingCandidates(
        pendingResponse.data,
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">
        Election Administration Dashboard
      </h1>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl mb-8 shadow-lg">
        <h2 className="text-2xl font-bold">
          Welcome Back Administrator
        </h2>

        <p className="opacity-90 mt-2">
          Monitor elections, approve candidates,
          manage voters and verify blockchain
          records.
        </p>
      </div>

      {/* Current Election */}

      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">
          Current Election
        </h2>

        {currentElection ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500">
                Election Name
              </p>

              <p className="font-semibold text-lg">
                {currentElection.title}
              </p>
            </div>

            <div>
              <p className="text-gray-500">
                Status
              </p>

              <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-semibold">
                {currentElection.status}
              </span>
            </div>

            <div>
              <p className="text-gray-500">
                Candidates
              </p>

              <p>
                {currentElection.candidates}
              </p>
            </div>

            <div>
              <p className="text-gray-500">
                Votes Cast
              </p>

              <p>
                {currentElection.votes}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">
            No active election found.
          </p>
        )}
      </div>

      {/* Quick Actions */}

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
          onClick={() => navigate('/blockchain')}
          className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-xl shadow-md transition duration-300 hover:scale-105"
        >
          ⛓ Blockchain Explorer
        </button>
      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Voters"
          value={stats.registeredVoters}
          color="bg-gradient-to-r from-blue-500 to-blue-700"
        />

        <StatCard
          title="Pending Voters"
          value={stats.pendingVoters}
          color="bg-gradient-to-r from-yellow-500 to-orange-500"
        />

        <StatCard
          title="Candidates"
          value={stats.candidates}
          color="bg-gradient-to-r from-purple-500 to-purple-700"
        />

        <StatCard
          title="Active Elections"
          value={stats.activeElections}
          color="bg-gradient-to-r from-green-500 to-green-700"
        />
      </div>

      {/* Bottom Widgets */}

      <div className="grid md:grid-cols-2 gap-6 mt-8">

        {/* Pending Candidates */}

        <div className="bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-xl font-bold mb-4">
            Pending Candidate Approvals
          </h2>

          <div className="space-y-3">

            {pendingCandidates.length === 0 ? (

              <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center">

                <p className="text-gray-500">
                  No pending candidates
                </p>

              </div>

            ) : (

              pendingCandidates.map(
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
                          candidate.election
                            ?.title
                        }
                      </p>

                    </div>

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          approveCandidate(
                            candidate.id,
                          )
                        }
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          rejectCandidate(
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

        {/* Blockchain Status */}

        <div className="bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-xl font-bold mb-4">
            Blockchain Status
          </h2>

          <div className="flex items-center gap-3">

            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>

            <p className="text-green-600 font-semibold">
              Connected
            </p>

          </div>

          <p className="text-gray-500 mt-4 text-sm">
            All vote transactions are currently
            being verified and stored on-chain.
          </p>

        </div>

      </div>

    </DashboardLayout>
  );
}