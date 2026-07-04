import {
  Home,
  User,
  Vote,
  Users,
  Shield,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

import { Link, useLocation } from 'react-router-dom';

const menu = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: Home,
  },

  {
    title: 'Profile',
    path: '/profile',
    icon: User,
  },

  {
    title: 'Elections',
    path: '/elections',
    icon: Vote,
  },

  {
    title: 'Candidates',
    path: '/candidates',
    icon: Users,
  },

  {
    title: 'Audit Logs',
    path: '/audit-logs',
    icon: Shield,
  },

  {
    title: 'Blockchain',
    path: '/blockchain',
    icon: ClipboardList,
  },

  {
    title: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
  },

  {
    title: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-72 h-screen bg-slate-950 text-white flex flex-col">

      <div className="p-8 border-b border-slate-800">

        <h1 className="text-3xl font-bold text-blue-500">

          BallotTrust

        </h1>

        <p className="text-slate-400 mt-2">

          Enterprise Election Platform

        </p>

      </div>

      <nav className="flex-1 p-6">

        <div className="space-y-2">

          {menu.map((item) => {

            const Icon = item.icon;

            const active =
              location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl transition

                ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }
                `}
              >
                <Icon size={22} />

                {item.title}
              </Link>
            );
          })}
        </div>

      </nav>

      <div className="p-6 border-t border-slate-800">

        <button
          className="w-full bg-red-600 hover:bg-red-700 rounded-xl py-3 flex items-center justify-center gap-2"
        >
          <LogOut size={18} />

          Logout

        </button>

      </div>

    </aside>
  );
}