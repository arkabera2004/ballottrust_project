import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../config/env';
import TokenStorage from '../utils/token-storage';

const api = axios.create({
  baseURL: ENV.API_URL,
});

api.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig,
  ) => {

    const token =
  TokenStorage.getAccessToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
);

let isRefreshing = false;

let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (
  error: unknown,
  token?: string,
) => {

  failedQueue.forEach((promise) => {

    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }

  });

  failedQueue = [];
};

api.interceptors.response.use(

  (response) => response,

  async (error: AxiosError) => {

    const originalRequest =
      error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

    if (
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {

      return new Promise((resolve, reject) => {

        failedQueue.push({

          resolve: (token) => {

            originalRequest.headers.Authorization =
              `Bearer ${token}`;

            resolve(api(originalRequest));

          },

          reject,

        });

      });

    }

    isRefreshing = true;

    try {

      const refreshToken =
  TokenStorage.getRefreshToken();

      if (!refreshToken) {
        throw new Error(
          'No Refresh Token',
        );
      }

      const response =
        await axios.post(
          'http://localhost:3000/auth/refresh',
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