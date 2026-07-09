import { Navigate } from 'react-router-dom';

import TokenStorage from '../utils/token-storage';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token =
    TokenStorage.getAccessToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}