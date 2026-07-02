
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CandidateNomination() {
  const [elections, setElections] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    registrationNumber: '',
    department: '',
    position: '',
    bio: '',
    manifesto: '',
    agenda: '',
    achievements: '',
    photoUrl: '',
    documentUrl: '',
    electionId: '',
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3000/elections'
      );

      setElections(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitNomination = async () => {
    try {
      await axios.post(
        'http://localhost:3000/candidates',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        'Nomination Submitted Successfully'
      );

      setFormData({
        name: '',
        email: '',
        registrationNumber: '',
        department: '',
        position: '',
        bio: '',
        manifesto: '',
        agenda: '',
        achievements: '',
        photoUrl: '',
        documentUrl: '',
        electionId: '',
      });
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          'Submission Failed'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">

        <h1 className="text-3xl font-bold mb-2">
          Candidate Nomination
        </h1>

        <p className="text-gray-600 mb-6">
          Submit your nomination for the election.
        </p>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            type="text"
            name="name"
            placeholder="Candidate Name"
            value={formData.name}
            onChange={handleChange}
            className="border p-3 rounded"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border p-3 rounded"
          />

          <input
            type="text"
            name="registrationNumber"
            placeholder="Registration Number"
            value={formData.registrationNumber}
            onChange={handleChange}
            className="border p-3 rounded"
          />

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            className="border p-3 rounded"
          />

          <input
            type="text"
            name="position"
            placeholder="Position Contested"
            value={formData.position}
            onChange={handleChange}
            className="border p-3 rounded"
          />

          <select
            name="electionId"
            value={formData.electionId}
            onChange={handleChange}
            className="border p-3 rounded"
          >
            <option value="">
              Select Election
            </option>

            {elections.map((election) => (
              <option
                key={election.id}
                value={election.id}
              >
                {election.title}
              </option>
            ))}
          </select>

        </div>

        <textarea
          name="bio"
          placeholder="Biography"
          value={formData.bio}
          onChange={handleChange}
          className="border p-3 rounded w-full mt-4"
          rows={4}
        />

        <textarea
          name="manifesto"
          placeholder="Manifesto"
          value={formData.manifesto}
          onChange={handleChange}
          className="border p-3 rounded w-full mt-4"
          rows={5}
        />

        <textarea
          name="agenda"
          placeholder="Agenda"
          value={formData.agenda}
          onChange={handleChange}
          className="border p-3 rounded w-full mt-4"
          rows={4}
        />

        <textarea
          name="achievements"
          placeholder="Achievements"
          value={formData.achievements}
          onChange={handleChange}
          className="border p-3 rounded w-full mt-4"
          rows={4}
        />

        <input
          type="text"
          name="photoUrl"
          placeholder="Photo URL"
          value={formData.photoUrl}
          onChange={handleChange}
          className="border p-3 rounded w-full mt-4"
        />

        <input
          type="text"
          name="documentUrl"
          placeholder="Document URL"
          value={formData.documentUrl}
          onChange={handleChange}
          className="border p-3 rounded w-full mt-4"
        />

        <button
          onClick={submitNomination}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Submit Nomination
        </button>

      </div>

    </div>
  );
}

