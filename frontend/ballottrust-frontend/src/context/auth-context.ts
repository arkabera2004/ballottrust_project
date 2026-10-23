import { createContext } from 'react';

import type { User } from '../types/auth';

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (accessToken: string, refreshToken: string, user: User) => void;

  logout: () => void;
};

/**
 * Split out of AuthContext.tsx: react-refresh/only-export-components flags
 * a file that exports both a component (AuthProvider) and a non-component
 * value (the context object itself).
 */
export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);
