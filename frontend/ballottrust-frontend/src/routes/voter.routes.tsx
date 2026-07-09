import { Route } from 'react-router-dom';

import RoleRoute from '../routes/RoleRoute';

import VoterDashboard from '../pages/VoterDashboard';

export const VoterRoutes = (
  <>
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
  </>
);