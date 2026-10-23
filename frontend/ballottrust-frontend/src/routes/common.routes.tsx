import { Route } from 'react-router-dom';

import ProtectedRoute from '../routes/ProtectedRoute';
import RoleRoute from '../routes/RoleRoute';

import {
  Dashboard,
  Candidates,
  Vote,
  Results,
  Blockchain,
  AuditLogs,
  Settings,
  Profile,
  ChangePassword,
} from './lazy-pages';

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