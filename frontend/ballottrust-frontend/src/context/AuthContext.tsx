import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { ReactNode } from 'react';

import TokenStorage from '../utils/token-storage';
import type { User } from '../types/auth';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (
    accessToken: string,
    refreshToken: string,
    user: User,
  ) => void;

  logout: () => void;
};

const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType,
  );

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {

  // TokenStorage.getUser() reads localStorage synchronously, so the stored
  // user can be read as the initial state directly instead of via an
  // effect-after-mount, which previously caused every page load to render
  // once as unauthenticated before flipping to the real session.
  const [user, setUser] =
    useState<User | null>(() => TokenStorage.getUser());

  // Always false: the session is now read synchronously above, so there is
  // no longer an async "checking session" window. Kept in the context
  // shape because RoleRoute (and possibly other consumers) still read it.
  const [loading] = useState(false);

  const login = (
    accessToken: string,
    refreshToken: string,
    user: User,
  ) => {

    TokenStorage.setAccessToken(
      accessToken,
    );

    TokenStorage.setRefreshToken(
      refreshToken,
    );

    TokenStorage.setUser(
      user,
    );

    localStorage.setItem(
      'userRole',
      user.role,
    );

    localStorage.setItem(
      'userEmail',
      user.email,
    );

    localStorage.setItem(
      'userId',
      user.id,
    );

    setUser(user);

  };

  const logout = () => {

    TokenStorage.clear();

    setUser(null);

  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, loading],
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () =>
  useContext(AuthContext);