import { Route } from 'react-router-dom';

import RoleRoute from '../routes/RoleRoute';

import {
  AdminDashboardPage,
  CandidateApproval,
  VoterRollPage,
  StaffManagement,
} from './lazy-pages';

export const AdminRoutes = (
  <>
    <Route
      path="/admin"
      element={
        <RoleRoute
          allowedRoles={[
            'SUPER_ADMIN',
            'ELECTION_COMMISSIONER',
          ]}
        >
          <AdminDashboardPage />
        </RoleRoute>
      }
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
      path="/voter-approval"
      element={
        <RoleRoute
          allowedRoles={[
            'SUPER_ADMIN',
            'ELECTION_COMMISSIONER',
            'VERIFICATION_OFFICER',
          ]}
        >
          <VoterRollPage />
        </RoleRoute>
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
  </>
);