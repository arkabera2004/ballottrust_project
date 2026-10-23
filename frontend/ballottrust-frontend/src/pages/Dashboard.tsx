
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import api from '../api/axios';
import {
  summarizeIntegrity,
} from '../utils/blockchain-integrity';

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ResultsPieChart from '../components/ResultsPieChart';
import StatCard from '../components/StatCard';

interface DashboardStats {
  elections: number;
  candidates: number;
  votes: number;

  activeElections: number;
  closedElections: number;
  draftElections: number;

  registeredVoters: number;
  turnout: number;

  recentElections: {
    id: string;
    title: string;
    status: string;
    startDate: string;
  }[];
}

interface CurrentElection {
  title: string;
  status: string;
  candidates: number;
  votes: number;
}

interface WinnerInfo {
  winner?: { candidateName: string; votes: number };
  election: string;
}

const EMPTY_STATS: DashboardStats = {
  elections: 0,
  candidates: 0,
  votes: 0,

  activeElections: 0,
  closedElections: 0,
  draftElections: 0,

  registeredVoters: 0,
  turnout: 0,

  recentElections: [],
};

export default function Dashboard() {
  // The user's explicit choice, if they have made one. When they haven't,
  // the default (the first election in the list) is derived directly
  // below rather than synced into this state via an effect.
  const [chosenElection, setChosenElection] = useState('');

  const overviewQuery = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const [statsRes, winnerRes, integrityRes, electionsRes, currentRes] =
        await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/winner'),
          api.get('/blockchain/verify'),
          api.get('/elections'),
          api.get('/dashboard/current-election'),
        ]);

      return {
        stats: statsRes.data.data as DashboardStats,
        winner: winnerRes.data.data as WinnerInfo | null,
        integrity: summarizeIntegrity(integrityRes.data.data),
        elections: (electionsRes.data.data.data ?? []) as {
          id: string;
          title: string;
        }[],
        currentElection: currentRes.data.data as CurrentElection | null,
      };
    },
    // Matches the previous 10s polling interval.
    refetchInterval: 10_000,
  });

  const stats = overviewQuery.data?.stats ?? EMPTY_STATS;
  const winner = overviewQuery.data?.winner ?? null;
  const integrity = overviewQuery.data?.integrity ?? summarizeIntegrity(null);
  const elections = overviewQuery.data?.elections ?? [];
  const currentElection = overviewQuery.data?.currentElection ?? null;

  const selectedElection = chosenElection || elections[0]?.id || '';

  const chartQuery = useQuery({
    queryKey: ['dashboard', 'results-chart', selectedElection],
    queryFn: async () => {
      const response = await api.get(
        `/dashboard/results-chart/${selectedElection}`,
      );

      return response.data.data as { name: string; votes: number }[];
    },
    enabled: !!selectedElection,
  });

  const chartData = chartQuery.data ?? [];

  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-gray-100 dark:bg-slate-950 min-h-screen">

        <Navbar />

        <div className="p-8">

          {/* Top Statistics */}


            {/* Top Statistics */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6 mb-8">

              <div className="bg-white dark:bg-slate-900 dark:text-white p-6 rounded-xl shadow">
                <h2 className="text-gray-500">
                  Elections
                </h2>

                <p className="text-3xl font-bold">
                  {stats.elections}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 dark:text-white p-6 rounded-xl shadow">
                <h2 className="text-gray-500">
                  Candidates
                </h2>

                <p className="text-3xl font-bold">
                  {stats.candidates}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 dark:text-white p-6 rounded-xl shadow">
                <h2 className="text-gray-500">
                  Votes
                </h2>

                <p className="text-3xl font-bold">
                  {stats.votes}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 dark:text-white p-6 rounded-xl shadow">
                <h2 className="text-gray-500">
                  Registered Voters
                </h2>

                <p className="text-3xl font-bold">
                  {stats.registeredVoters}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 dark:text-white p-6 rounded-xl shadow">
                <h2 className="text-gray-500">
                  Voter Turnout
                </h2>

                <p className="text-3xl font-bold text-blue-600">
                  {stats.turnout}%
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 dark:text-white p-6 rounded-xl shadow">

                <h2 className="text-gray-500">
                  System Integrity
                </h2>

                <p className="text-green-600 text-2xl font-bold mt-2">
                  <p
                      className={`text-2xl font-bold mt-2 ${
                        integrity?.valid
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {integrity?.valid
                        ? 'SECURE'
                        : 'WARNING'}
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                      {integrity?.message}
                    </p>
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  All votes verified successfully
                </p>

              </div>

            </div>



          {/* Election Status */}

          <div className="grid grid-cols-3 gap-6 mb-8">

            <div className="bg-green-100 p-6 rounded-xl shadow">
              <h2 className="text-green-700 font-semibold">
                Active Elections
              </h2>

              <p className="text-3xl font-bold">
                {stats.activeElections}
              </p>
            </div>

            <div className="bg-yellow-100 p-6 rounded-xl shadow">
              <h2 className="text-yellow-700 font-semibold">
                Draft Elections
              </h2>

              <p className="text-3xl font-bold">
                {stats.draftElections}
              </p>
            </div>

            <div className="bg-red-100 p-6 rounded-xl shadow">
              <h2 className="text-red-700 font-semibold">
                Closed Elections
              </h2>

              <p className="text-3xl font-bold">
                {stats.closedElections}
              </p>
            </div>

          </div>

          {/* Analytics */}

          <div className="bg-white dark:bg-slate-900 dark:text-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold mb-4">
              System Analytics
            </h2>

            <div className="grid grid-cols-3 gap-6">
              <StatCard
                title="Elections"
                value={stats.elections}
                color="bg-blue-600"
              />

              <StatCard
                title="Candidates"
                value={stats.candidates}
                color="bg-green-600"
              />

              <StatCard
                title="Votes"
                value={stats.votes}
                color="bg-purple-600"
              />
            </div>

          </div>

          <div className="bg-white dark:bg-slate-900 dark:text-white rounded-xl shadow p-6 mt-8">

          <h2 className="text-2xl font-bold mb-4">
            Current Election
          </h2>

          {currentElection ? (
            <div className="grid grid-cols-4 gap-6">

              <div>
                <p className="text-gray-500">
                  Title
                </p>

                <p className="font-bold">
                  {currentElection.title}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Status
                </p>

                <p className="font-bold text-green-500">
                  {currentElection.status}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Candidates
                </p>

                <p className="font-bold">
                  {currentElection.candidates}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Votes Cast
                </p>

                <p className="font-bold">
                  {currentElection.votes}
                </p>
              </div>

            </div>
          ) : (
            <p>
              No active election found
            </p>
          )}

        </div>

          {/* Winner Card */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

  {/* Winner Card */}

          <div className="bg-white dark:bg-slate-900 dark:text-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold mb-4">
              🏆 Leading Candidate
            </h2>

            {winner ? (
              <>
                <p className="text-4xl font-bold text-yellow-500">
                  {winner.winner?.candidateName}
                </p>

                <p className="text-lg mt-4">
                  Votes:
                  <span className="font-bold ml-2">
                    {winner.winner?.votes}
                  </span>
                </p>

                <p className="text-gray-500 dark:text-gray-300 mt-4">
                  {winner.election}
                </p>
              </>
            ) : (
              <p>No winner data available</p>
            )}

          </div>

          {/* Pie Chart */}

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 dark:text-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold mb-4">
              Vote Distribution
            </h2>

            <select
              className="border p-2 rounded mb-4 text-black"
              value={selectedElection}
              onChange={(e) =>
                setChosenElection(e.target.value)
              }
            >
              {elections.map((election) => (
                <option
                  key={election.id}
                  value={election.id}
                >
                  {election.title}
                </option>
              ))}
            </select>

            <ResultsPieChart
              data={chartData}
            />

          </div>

        </div>

          {/* Recent Elections */}

          <div className="bg-white dark:bg-slate-900 dark:text-white rounded-xl shadow p-6 mt-8">

            <h2 className="text-2xl font-bold mb-4">
              Recent Elections
            </h2>

            <table className="w-full">

              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">
                    Title
                  </th>

                  <th className="text-left py-2">
                    Status
                  </th>

                  <th className="text-left py-2">
                    Start Date
                  </th>
                </tr>
              </thead>

              <tbody>

                {stats.recentElections?.map(
                  (election) => (
                    <tr
                      key={election.id}
                      className="border-b"
                    >
                      <td className="py-3">
                        {election.title}
                      </td>

                      <td className="py-3">
                        {election.status}
                      </td>

                      <td className="py-3">
                        {new Date(
                          election.startDate
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}
