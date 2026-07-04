import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import Login from './modules/auth/pages/Login';
import Register from './modules/auth/pages/Register';
import Dashboard from './pages/Dashboard';
import Elections from './pages/Elections';
import Candidates from './pages/Candidates';
import Vote from './pages/Vote';
import Results from './pages/Results';

import AdminDashboard from './pages/AdminDashboard';
import VoterDashboard from './pages/VoterDashboard';
import CandidateDashboard from './pages/CandidateDashboard';

import CandidateApproval from './pages/CandidateApproval';
import CandidateNomination from './pages/CandidateNomination';
import VoterApproval from './pages/VoterApproval';
import StaffManagement from './pages/StaffManagement';

import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';

import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import Blockchain from './pages/Blockchain';
import Profile from './modules/profile/pages/Profile';
import ChangePassword from './modules/change-password/pages/ChangePassword';
import VerifyEmail from './modules/email-verification/pages/VerifyEmail';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}

        <Route
          path="/"
          element={<Login />}
        />
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Existing Protected Routes */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/elections"
          element={
            <ProtectedRoute>
              <Elections />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidates"
          element={
            <ProtectedRoute>
              <Candidates />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vote"
          element={
            <ProtectedRoute>
              <Vote />
            </ProtectedRoute>
          }
        />

        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}

        <Route
          path="/admin"
          element={
            <RoleRoute
              allowedRoles={[
                'SUPER_ADMIN',
                'ELECTION_COMMISSIONER',
              ]}
            >
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
  path="/verify-email"
  element={<VerifyEmail />}
/>

        <Route
          path="/candidate-approval"
          element={
            <RoleRoute
              allowedRoles={[
                'SUPER_ADMIN',
                'ELECTION_COMMISSIONER',
              ]}
            >
              <CandidateApproval />
            </RoleRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={<ChangePassword />}
        />

        <Route
          path="/voter-approval"
          element={
            <RoleRoute
              allowedRoles={[
                'SUPER_ADMIN',
                'ELECTION_COMMISSIONER',
              ]}
            >
              <VoterApproval />
            </RoleRoute>
          }
        />

        {/* Candidate Routes */}

        <Route
          path="/candidate"
          element={
            <RoleRoute
              allowedRoles={[
                'CANDIDATE',
              ]}
            >
              <CandidateDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/candidate-nomination"
          element={
            <RoleRoute
              allowedRoles={[
  'CANDIDATE',
  'SUPER_ADMIN',
  'ELECTION_COMMISSIONER',
]}
            >
              <CandidateNomination />
            </RoleRoute>
          }
        />

        {/* Voter Routes */}

        <Route
          path="/voter"
          element={
            <RoleRoute
              allowedRoles={[
                'VOTER',
              ]}
            >
              <VoterDashboard />
            </RoleRoute>
          }
        />

        {/* Auditor Routes */}

        <Route
          path="/audit-logs"
          element={
            <RoleRoute
              allowedRoles={[
                'AUDITOR',
                'SUPER_ADMIN',
              ]}
            >
              <AuditLogs />
            </RoleRoute>
          }
        />

        {/* Common Settings */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
        path="/blockchain"
        element={
          <ProtectedRoute>
            <Blockchain />
          </ProtectedRoute>
        }
      />

      <Route
  path="/staff-management"
  element={
    <RoleRoute
      allowedRoles={[
        'SUPER_ADMIN',
      ]}
    >
      <StaffManagement />
    </RoleRoute>
  }
/>

      </Routes>
    </BrowserRouter>
  );
}


export default App;