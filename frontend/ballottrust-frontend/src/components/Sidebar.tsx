import { NavLink } from 'react-router-dom';

import {
  FaChartBar,
  FaVoteYea,
  FaUserCheck,
  FaUserTie,
  FaClipboardList,
  FaLink,
  FaCog,
} from 'react-icons/fa';

export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen">

      <div className="p-6 text-3xl font-bold border-b border-slate-700">
        🗳 BallotTrust
      </div>

      <nav className="flex flex-col p-4 gap-2">

        <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-700'
              }`
            }
          >
            <FaChartBar />
            Dashboard
          </NavLink>

          <NavLink
            to="/elections"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-700'
              }`
            }
          >
            <FaVoteYea />
            Elections
          </NavLink>

          <NavLink
            to="/candidate-approval"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-700'
              }`
            }
          >
            <FaUserTie />
            Candidate Approval
          </NavLink>

          <NavLink
            to="/voter-approval"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-700'
              }`
            }
          >
            <FaUserCheck />
            Voter Approval
          </NavLink>

          <NavLink
            to="/audit-logs"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-700'
              }`
            }
          >
            <FaClipboardList />
            Audit Logs
          </NavLink>

          <NavLink
            to="/blockchain"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-700'
              }`
            }
          >
            <FaLink />
            Blockchain
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-700'
              }`
            }
          >
            <FaCog />
            Settings
          </NavLink>

      </nav>
    </div>
  );
}