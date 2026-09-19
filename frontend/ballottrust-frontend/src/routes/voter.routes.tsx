import { Route } from 'react-router-dom';

import RoleRoute from '../routes/RoleRoute';

import VoterDashboard from '../pages/VoterDashboard';
import { MyRegistrationsPage } from '../modules/voter';

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

    <Route
      path="/voter/registrations"
      element={
        <RoleRoute
          allowedRoles={[
            'VOTER',
          ]}
        >
          <MyRegistrationsPage />
        </RoleRoute>
      }
    />
  </>
);