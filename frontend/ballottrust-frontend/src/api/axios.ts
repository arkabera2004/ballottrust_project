import axios from 'axios';
import type {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

import { ENV } from '../config/env';
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
  (
    config: InternalAxiosRequestConfig,
  ) => {
    console.log(
      '================================',
    );
    console.log('AXIOS REQUEST');

    console.log(
      'URL:',
      `${config.baseURL ?? ''}${config.url ?? ''}`,
    );

    const token =
      TokenStorage.getAccessToken();

    console.log(
      'TokenStorage Token:',
      token,
    );

    console.log(
      'LocalStorage Token:',
      localStorage.getItem('token'),
    );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;

      console.log(
        'Authorization Header Attached',
      );
    } else {
      console.warn(
        'No access token found.',
      );
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

function processQueue(
  error: unknown,
  token?: string,
) {
  failedQueue.forEach(
    (promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token!);
      }
    },
  );

  failedQueue = [];
}

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

api.interceptors.response.use(
  (response) => {
    console.log(
      `SUCCESS: ${response.config.url} ${response.status}`,
    );

    return response;
  },

  async (error: AxiosError) => {
    const originalRequest =
      error.config as
        | (InternalAxiosRequestConfig & {
            _retry?: boolean;
          })
        | undefined;

    console.error(
      `ERROR: ${originalRequest?.url} ${error.response?.status}`,
    );

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise(
        (resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization =
                `Bearer ${token}`;

              resolve(
                api(originalRequest),
              );
            },
            reject,
          });
        },
      );
    }

    isRefreshing = true;

    try {
      const refreshToken =
        TokenStorage.getRefreshToken();

      if (!refreshToken) {
        throw new Error(
          'No refresh token found.',
        );
      }

      const response =
        await axios.post(
          `${ENV.API_URL}/auth/refresh`,
          {
            refreshToken,
          },
        );

      const newAccessToken =
        response.data.access_token;

      TokenStorage.setAccessToken(
        newAccessToken,
      );

      processQueue(
        null,
        newAccessToken,
      );

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (err) {
      console.error(
        'Refresh Token Failed:',
        err,
      );

      processQueue(err);

      TokenStorage.clear();

      window.location.href = '/';

      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;