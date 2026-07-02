import {
  createContext,
  useContext,
  useEffect,
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

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const storedUser =
      TokenStorage.getUser();

    if (storedUser) {
      setUser(storedUser);
    }

    setLoading(false);

  }, []);

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