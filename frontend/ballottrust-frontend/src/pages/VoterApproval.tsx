import { useEffect, useState } from 'react';
import axios from 'axios';

import DashboardLayout from '../components/DashboardLayout';

type User = {
  id: string;
  fullName: string;
  email: string;
  department: string | null;
  registrationNumber: string | null;
  status: string;
};

export default function VoterApproval() {
  const [users, setUsers] = useState<User[]>([]);

  const token = localStorage.getItem('token');

  const loadPendingUsers = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3000/users/pending',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const approveUser = async (
    id: string,
  ) => {
    try {
      await axios.patch(
        `http://localhost:3000/users/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Voter Approved');

      loadPendingUsers();
    } catch {
      alert('Approval Failed');
    }
  };

  const rejectUser = async (
    id: string,
  ) => {
    try {
      await axios.patch(
        `http://localhost:3000/users/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Voter Rejected');

      loadPendingUsers();
    } catch {
      alert('Rejection Failed');
    }
  };

  useEffect(() => {
    loadPendingUsers();
  }, []);

  return (
    <DashboardLayout>

      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold">
            Voter Approval Portal
          </h1>

          <p className="text-gray-500 mt-2">
            Review voter registrations and approve eligible voters.
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-2xl p-6 shadow-lg">

          <h2 className="text-2xl font-bold">
            Pending Voter Verification
          </h2>

          <p className="mt-2 opacity-90">
            Verify student information before allowing voting access.
          </p>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-blue-600 text-white p-6 rounded-2xl shadow">
            <p>Pending Voters</p>
            <h2 className="text-4xl font-bold mt-2">
              {users.length}
            </h2>
          </div>

          <div className="bg-green-600 text-white p-6 rounded-2xl shadow">
            <p>Approved Today</p>
            <h2 className="text-4xl font-bold mt-2">
              0
            </h2>
          </div>

          <div className="bg-red-600 text-white p-6 rounded-2xl shadow">
            <p>Rejected Today</p>
            <h2 className="text-4xl font-bold mt-2">
              0
            </h2>
          </div>

        </div>

        {users.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6">
            No pending voters found.
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl shadow-md p-6"
            >
              <div className="flex justify-between">

                <div>

                  <h2 className="text-xl font-bold">
                    {user.fullName}
                  </h2>

                  <p className="text-gray-500">
                    {user.email}
                  </p>

                  <div className="mt-3 space-y-1">

                    <p>
                      Department:
                      <span className="font-semibold ml-2">
                        {user.department || 'N/A'}
                      </span>
                    </p>

                    <p>
                      Registration Number:
                      <span className="font-semibold ml-2">
                        {user.registrationNumber || 'N/A'}
                      </span>
                    </p>

                  </div>

                </div>

                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full h-fit">
                  PENDING
                </span>

              </div>

              <div className="flex gap-4 mt-6">

                <button
                  onClick={() =>
                    approveUser(user.id)
                  }
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    rejectUser(user.id)
                  }
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
                >
                  Reject
                </button>

              </div>

            </div>
          ))
        )}

      </div>

    </DashboardLayout>
  );
}