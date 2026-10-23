import { useContext } from 'react';

import { AuthContext } from './auth-context';

/**
 * Split out of AuthContext.tsx: react-refresh/only-export-components flags
 * a file that exports both a component (AuthProvider) and a non-component
 * value (this hook).
 */
export const useAuth = () => useContext(AuthContext);
