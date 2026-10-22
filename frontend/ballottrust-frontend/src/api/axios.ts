import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { ENV } from '../config/env';
import { ROUTES } from '../constants/routes';
import TokenStorage from '../utils/token-storage';

const api = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenStorage.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ======================================================
// REFRESH TOKEN
// ======================================================

let isRefreshing = false;

let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function processQueue(error: unknown, token?: string) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });

  failedQueue = [];
}

/**
 * Every backend response is wrapped by the API's ResponseInterceptor as
 * `{ success, timestamp, data }`, so the payload is one level deeper
 * than a plain axios response. Reading `response.data.access_token`
 * here yields undefined and silently stores a broken token.
 */
interface RefreshEnvelope {
  data?: {
    access_token?: string;
    refresh_token?: string;
  };
}

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;

            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = TokenStorage.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token found.');
      }

      // Deliberately a bare axios call, not `api`: routing the refresh
      // through this same instance would re-enter these interceptors and
      // could recurse if the refresh itself 401s.
      const response = await axios.post<RefreshEnvelope>(
        `${ENV.API_URL}/auth/refresh`,
        { refreshToken },
      );

      const newAccessToken = response.data?.data?.access_token;
      const newRefreshToken = response.data?.data?.refresh_token;

      if (!newAccessToken) {
        throw new Error('Refresh response did not contain an access token.');
      }

      TokenStorage.setAccessToken(newAccessToken);

      // The backend rotates the refresh token on every use and revokes
      // the one just presented, so the new one must replace it or the
      // next refresh attempt will be rejected as reuse of a revoked token.
      if (newRefreshToken) {
        TokenStorage.setRefreshToken(newRefreshToken);
      }

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (err) {
      processQueue(err);

      TokenStorage.clear();

      // Full reload rather than a router navigation: the session is gone,
      // so every cached query and context value must be discarded too.
      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.href = ROUTES.LOGIN;
      }

      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
