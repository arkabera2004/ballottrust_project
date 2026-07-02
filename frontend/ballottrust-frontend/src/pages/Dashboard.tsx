
import { useEffect, useState } from 'react';
import axios from 'axios';

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatsChart from '../components/StatCard';
import ResultsPieChart from '../components/ResultsPieChart';

export default function Dashboard() {
  const [stats, setStats] = useState<any>({
  elections: 0,
  candidates: 0,
  votes: 0,

  activeElections: 0,
  closedElections: 0,
  draftElections: 0,

  registeredVoters: 0,
  turnout: 0,

  recentElections: [],
});

const [currentElection, setCurrentElection] =
  useState<any>(null);

  const [winner, setWinner] = useState<any>(null);

  const [chartData, setChartData] =
    useState<any[]>([]);

  const [elections, setElections] =
    useState<any[]>([]);

  const [integrity, setIntegrity] =
  useState<any>(null);

  const [selectedElection, setSelectedElection] =
    useState('');

  const loadStats = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3000/dashboard/stats'
      );

      setStats(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadWinner = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3000/dashboard/winner'
      );

      setWinner(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadElections = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3000/elections'
      );

      setElections(response.data);

      if (response.data.length > 0) {
        setSelectedElection(
          response.data[0].id
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadChart = async (
    electionId: string,
  ) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/dashboard/results-chart/${electionId}`
      );

      setChartData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadCurrentElection =
  async () => {
    try {
      const response =
        await axios.get(
          'http://localhost:3000/dashboard/current-election'
        );

      setCurrentElection(
        response.data
      );
    } catch (error) {
      console.error(error);
    }
  };

  const loadIntegrity = async () => {
  try {
    const response = await axios.get(
      'http://localhost:3000/blockchain/verify'
    );

    setIntegrity(response.data);
  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {

  loadStats();
  loadWinner();
  loadIntegrity();
  loadElections();
  loadCurrentElection();

  const interval =
    setInterval(() => {

      loadStats();
      loadWinner();
      loadIntegrity();
      loadElections();
      loadCurrentElection();

    }, 10000);

  return () =>
    clearInterval(interval);

}, []);

  useEffect(() => {
    if (selectedElection) {
      loadChart(selectedElection);
    }
  }, [selectedElection]);

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

            <StatsChart
              elections={stats.elections}
              candidates={stats.candidates}
              votes={stats.votes}
            />

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
                setSelectedElection(e.target.value)
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
                  (election: any) => (
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

