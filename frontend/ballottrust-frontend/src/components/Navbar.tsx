import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="h-16 bg-white shadow flex justify-between items-center px-6">

      <h1 className="text-2xl font-bold text-slate-800">
        Election Control Center
      </h1>

      <div className="flex items-center gap-4">

        <span className="text-gray-600">
          {localStorage.getItem('userEmail')}
        </span>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 transition text-white px-5 py-2 rounded-lg"
        >
          Logout
        </button>

      </div>
    </div>
  );
}