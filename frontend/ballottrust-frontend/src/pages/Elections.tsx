import { useEffect, useState } from 'react';
import axios from 'axios';

import DashboardLayout from '../components/DashboardLayout';

import {
  PlusCircle,
  Play,
  Square,
  Calendar,
} from 'lucide-react';

export default function Elections() {
  const [elections, setElections] =
    useState<any[]>([]);

  const [title, setTitle] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [startDate, setStartDate] =
    useState('');

  const [endDate, setEndDate] =
    useState('');

  const token =
    localStorage.getItem('token');

  const loadElections = async () => {
    try {
      const response =
        await axios.get(
          'http://localhost:3000/elections'
        );

      setElections(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createElection = async () => {
    try {
      await axios.post(
        'http://localhost:3000/elections',
        {
          title,
          description,
          startDate,
          endDate,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      alert(
        'Election Created Successfully'
      );

      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');

      loadElections();
    } catch (error) {
      console.error(error);

      alert(
        'Failed to create election'
      );
    }
  };

  const activateElection =
    async (id: string) => {
      try {
        await axios.patch(
          `http://localhost:3000/elections/${id}/activate`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        loadElections();
      } catch (error) {
        console.error(error);
      }
    };

  const closeElection =
    async (id: string) => {
      try {
        await axios.patch(
          `http://localhost:3000/elections/${id}/close`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        loadElections();
      } catch (error) {
        console.error(error);
      }
    };

  useEffect(() => {
    loadElections();
  }, []);

  return (
    <DashboardLayout>

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            Election Management
          </h1>

          <p className="text-gray-500 mt-2">
            Create, manage and monitor
            elections
          </p>

        </div>

        <button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-md"
        >
          <PlusCircle size={18} />
          Create Election
        </button>

      </div>

      {/* Create Election Form */}

      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

        <h2 className="text-xl font-bold mb-6">
          Create New Election
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            className="border rounded-xl p-3"
            placeholder="Election Title"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
          />

          <input
            className="border rounded-xl p-3"
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />

          <input
            type="datetime-local"
            className="border rounded-xl p-3"
            value={startDate}
            onChange={(e) =>
              setStartDate(
                e.target.value
              )
            }
          />

          <input
            type="datetime-local"
            className="border rounded-xl p-3"
            value={endDate}
            onChange={(e) =>
              setEndDate(
                e.target.value
              )
            }
          />

        </div>

        <button
          onClick={createElection}
          className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-md"
        >
          Create Election
        </button>

      </div>

      {/* Elections List */}

      <div className="bg-white rounded-2xl shadow-md p-6">

        <h2 className="text-xl font-bold mb-6">
          Existing Elections
        </h2>

        <div className="space-y-5">

          {elections.length === 0 && (

            <div className="text-center text-gray-500 py-10">
              No elections found
            </div>

          )}

          {elections.map(
            (election) => (

              <div
                key={election.id}
                className="border rounded-2xl p-6 hover:shadow-lg transition"
              >

                <div className="flex justify-between items-start">

                  <div>

                    <h3 className="text-xl font-bold">
                      {election.title}
                    </h3>

                    <p className="text-gray-600 mt-2">
                      {
                        election.description
                      }
                    </p>

                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      election.status ===
                      'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : election.status ===
                          'DRAFT'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {election.status}
                  </span>

                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm text-gray-600">

                  <div className="flex items-center gap-2">

                    <Calendar size={16} />

                    Start:
                    {' '}
                    {new Date(
                      election.startDate
                    ).toLocaleString()}

                  </div>

                  <div className="flex items-center gap-2">

                    <Calendar size={16} />

                    End:
                    {' '}
                    {new Date(
                      election.endDate
                    ).toLocaleString()}

                  </div>

                </div>

                <div className="flex gap-3 mt-6">

                  <button
                    onClick={() =>
                      activateElection(
                        election.id
                      )
                    }
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    <Play size={16} />
                    Activate
                  </button>

                  <button
                    onClick={() =>
                      closeElection(
                        election.id
                      )
                    }
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    <Square size={16} />
                    Close
                  </button>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </DashboardLayout>
  );
}