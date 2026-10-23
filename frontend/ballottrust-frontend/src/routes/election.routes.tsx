import { Route } from 'react-router-dom';

import ProtectedRoute from '../routes/ProtectedRoute';

import {
  ElectionsPage,
  CreateElectionPage,
  ElectionDetailsPage,
  EditElectionPage,
} from './lazy-pages';

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