import { Route } from 'react-router-dom';

import RoleRoute from '../routes/RoleRoute';

import CandidateDashboard from '../pages/CandidateDashboard';
import CandidateNomination from '../pages/CandidateNomination';

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