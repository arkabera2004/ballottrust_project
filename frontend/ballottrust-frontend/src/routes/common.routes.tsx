import { Route } from 'react-router-dom';

import ProtectedRoute from '../routes/ProtectedRoute';
import RoleRoute from '../routes/RoleRoute';

import Dashboard from '../pages/Dashboard';
import Candidates from '../pages/Candidates';
import Vote from '../pages/Vote';
import Results from '../pages/Results';
import Blockchain from '../pages/Blockchain';
import AuditLogs from '../pages/AuditLogs';
import Settings from '../pages/Settings';

import Profile from '../modules/profile/pages/Profile';
import ChangePassword from '../modules/change-password/pages/ChangePassword';

export const CommonRoutes = (
  <>
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
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

    <Route
      path="/blockchain"
      element={
        <ProtectedRoute>
          <Blockchain />
        </ProtectedRoute>
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
      element={
        <ProtectedRoute>
          <ChangePassword />
        </ProtectedRoute>
      }
    />

    <Route
      path="/settings"
      element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      }
    />

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
  </>
);