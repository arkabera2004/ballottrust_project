import { useState } from 'react';

import api from '../api/axios';
import toast from '../utils/toast';

export default function StaffManagement() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'ELECTION_COMMISSIONER',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const createStaff = async () => {
    try {
      await api.post(
        '/users/create-staff',
        formData,
      );

      toast.success('Staff Created Successfully');

      setFormData({
        fullName: '',
        email: '',
        password: '',
        role: 'ELECTION_COMMISSIONER',
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          'Failed to create staff'
      );
    }
  };

  return (
    <div className="p-8">

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl">

        <h1 className="text-3xl font-bold mb-6">
          Staff Management
        </h1>

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          className="border p-3 rounded w-full mb-4"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-3 rounded w-full mb-4"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="border p-3 rounded w-full mb-4"
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="border p-3 rounded w-full mb-4"
        >
          <option value="ELECTION_COMMISSIONER">
            Election Commissioner
          </option>

          <option value="AUDITOR">
            Auditor
          </option>
        </select>

        <button
          onClick={createStaff}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Create Staff
        </button>

      </div>

    </div>
  );
}
