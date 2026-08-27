import { Route } from 'react-router-dom';

import RoleRoute from '../routes/RoleRoute';

import CandidateDashboard from '../pages/CandidateDashboard';
import CandidateNomination from '../pages/CandidateNomination';
import EditCandidatePage from '../modules/candidate/pages/EditCandidatePage';

export const CandidateRoutes = (
  <>
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
      path="/candidate/:id/edit"
      element={
        <RoleRoute
          allowedRoles={[
            'CANDIDATE',
          ]}
        >
          <EditCandidatePage />
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
  </>
);