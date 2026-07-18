import { Route } from 'react-router-dom';

import ProtectedRoute from '../routes/ProtectedRoute';

import ElectionsPage from '../modules/election/pages/ElectionsPage';
import CreateElectionPage from '../modules/election/pages/CreateElectionPage';
import ElectionDetailsPage from '../modules/election/pages/ElectionDetailsPage';
import EditElectionPage from '../modules/election/pages/EditElectionPage';
import {
  ElectionProvider,
} from '../modules/election/context/ElectionContext';

export const ElectionRoutes = (
  <>
    <Route
      path="/elections"
      element={
        <ProtectedRoute>
          <ElectionsPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/elections/create"
      element={
        <ProtectedRoute>
          <CreateElectionPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/elections/:id"
      element={
        <ProtectedRoute>
          <ElectionDetailsPage />
        </ProtectedRoute>
      }
    />

    <Route
        path="/elections/:id/edit"
        element={
            <ProtectedRoute>
            <EditElectionPage />
            </ProtectedRoute>
      }
    />
  </>
);