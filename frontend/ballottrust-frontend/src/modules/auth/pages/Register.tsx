
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'VOTER',
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

  const register = async () => {
    try {
      await axios.post(
        'http://localhost:3000/auth/register',
        formData
      );

      alert(
        'Registration successful. Waiting for approval.'
      );

      navigate('/');
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
        'Registration Failed'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h1 className="text-3xl font-bold mb-6 text-center">
          BallotTrust Registration
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
          <option value="VOTER">
            Voter
          </option>

          <option value="CANDIDATE">
            Candidate
          </option>
        </select>

        <button
          onClick={register}
          className="bg-blue-600 text-white w-full py-3 rounded-lg hover:bg-blue-700"
        >
          Register
        </button>

      </div>

    </div>
  );
}

