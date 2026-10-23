import {
  Search,
  Sun,
  UserCircle,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/useAuth';
import { NotificationBell } from '../../modules/notification';

export default function Topbar() {
  const navigate = useNavigate();

  const { user } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">

      {/* Left */}

      <div>

        <h1 className="text-2xl font-bold">

          Enterprise Dashboard

        </h1>

        <p className="text-gray-500">

          Welcome back,
          {' '}
          {user?.fullName}

        </p>

      </div>

      {/* Center */}

      <div className="hidden lg:flex items-center bg-slate-100 rounded-xl px-4 py-3 w-[400px]">

        <Search
          size={18}
          className="text-gray-500"
        />

        <input
          placeholder="Search..."
          className="bg-transparent ml-3 outline-none w-full"
        />

      </div>

      {/* Right */}

      <div className="flex items-center gap-5">

        <button className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">

          <Sun size={20} />

        </button>

        <NotificationBell />

        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-2 hover:bg-slate-200"
        >

          <UserCircle size={36} />

          <div className="text-left">

            <p className="font-semibold">

              {user?.fullName}

            </p>

            <p className="text-sm text-gray-500">

              {user?.role}

            </p>

          </div>

        </button>

      </div>

    </header>
  );
}