import { lazy } from 'react';

/**
 * Every route-level page, lazy-loaded (BT-FE-002). Centralized in one
 * file, rather than declared inline in each *.routes.tsx file, because
 * react-refresh/only-export-components flags a file that exports both a
 * route-list constant and ad hoc lazy()-wrapped components; this file
 * exports only components, so the *.routes.tsx files can stay clean.
 */

// Kept eager in auth.routes.tsx: Login is the "/" landing route most
// unauthenticated traffic hits first, so it is not re-exported here.

export const Register = lazy(() => import('../modules/auth/pages/Register'));

export const VerifyEmail = lazy(
  () => import('../modules/email-verification/pages/VerifyEmail'),
);

export const ForgotPassword = lazy(() =>
  import('../modules/forgot-password/pages').then((m) => ({
    default: m.ForgotPassword,
  })),
);
export const ResetPassword = lazy(() =>
  import('../modules/forgot-password/pages').then((m) => ({
    default: m.ResetPassword,
  })),
);

export const OAuthCallback = lazy(() =>
  import('../modules/oauth/pages').then((m) => ({
    default: m.OAuthCallback,
  })),
);

export const ElectionsPage = lazy(
  () => import('../modules/election/pages/ElectionsPage'),
);
export const CreateElectionPage = lazy(
  () => import('../modules/election/pages/CreateElectionPage'),
);
export const ElectionDetailsPage = lazy(
  () => import('../modules/election/pages/ElectionDetailsPage'),
);
export const EditElectionPage = lazy(
  () => import('../modules/election/pages/EditElectionPage'),
);

export const AdminDashboardPage = lazy(
  () => import('../modules/dashboard/pages/AdminDashboardPage'),
);
export const CandidateApproval = lazy(
  () => import('../pages/CandidateApproval'),
);
export const VoterRollPage = lazy(() =>
  import('../modules/voter').then((m) => ({ default: m.VoterRollPage })),
);
export const StaffManagement = lazy(() => import('../pages/StaffManagement'));

export const CandidateDashboard = lazy(
  () => import('../pages/CandidateDashboard'),
);
export const CandidateNomination = lazy(
  () => import('../pages/CandidateNomination'),
);
export const EditCandidatePage = lazy(
  () => import('../modules/candidate/pages/EditCandidatePage'),
);

export const VoterDashboard = lazy(() => import('../pages/VoterDashboard'));
export const MyRegistrationsPage = lazy(() =>
  import('../modules/voter').then((m) => ({
    default: m.MyRegistrationsPage,
  })),
);

export const Dashboard = lazy(() => import('../pages/Dashboard'));
export const Candidates = lazy(() => import('../pages/Candidates'));
export const Vote = lazy(() => import('../pages/Vote'));
export const Results = lazy(() => import('../pages/Results'));
export const Blockchain = lazy(() => import('../pages/Blockchain'));
export const AuditLogs = lazy(() => import('../pages/AuditLogs'));
export const Settings = lazy(() => import('../pages/Settings'));
export const Profile = lazy(() => import('../modules/profile/pages/Profile'));
export const ChangePassword = lazy(
  () => import('../modules/change-password/pages/ChangePassword'),
);

export const PublicElectionsPage = lazy(() =>
  import('../modules/public').then((m) => ({
    default: m.PublicElectionsPage,
  })),
);
export const PublicElectionDetailPage = lazy(() =>
  import('../modules/public').then((m) => ({
    default: m.PublicElectionDetailPage,
  })),
);
export const PublicCandidatePage = lazy(() =>
  import('../modules/public').then((m) => ({
    default: m.PublicCandidatePage,
  })),
);
export const VerifyReceiptPage = lazy(() =>
  import('../modules/public').then((m) => ({
    default: m.VerifyReceiptPage,
  })),
);
