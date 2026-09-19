import { Route } from 'react-router-dom';

import {
  PublicCandidatePage,
  PublicElectionDetailPage,
  PublicElectionsPage,
  VerifyReceiptPage,
} from '../modules/public';

/**
 * The Public Election Portal.
 *
 * Deliberately outside ProtectedRoute and RoleRoute: docs/07 §17
 * requires these to be reachable with no authentication at all.
 */
export const PublicRoutes = (
  <>
    <Route path="/elections-public" element={<PublicElectionsPage />} />

    <Route
      path="/elections-public/:id"
      element={<PublicElectionDetailPage />}
    />

    <Route
      path="/candidates-public/:id"
      element={<PublicCandidatePage />}
    />

    <Route path="/verify" element={<VerifyReceiptPage />} />
  </>
);
