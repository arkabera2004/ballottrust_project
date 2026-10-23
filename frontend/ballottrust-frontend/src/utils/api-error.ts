import axios from 'axios';
import Toast from './toast';

/**
 * Extracts a server-provided error message from a caught `unknown` value,
 * falling back to `fallback` when the error isn't an Axios error carrying
 * one. Centralizes the `error?.response?.data?.message || 'X failed'`
 * pattern repeated across hooks, which previously required typing the
 * caught error as `any` to reach into it.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}

class ApiErrorHandler {

  handle(error: unknown) {

    if (axios.isAxiosError(error)) {

      const status = error.response?.status;

      switch (status) {

        case 400:
          Toast.error(
            error.response?.data?.message ??
            'Bad Request',
          );
          break;

        case 401:
          Toast.error(
            'Unauthorized',
          );
          break;

        case 403:
          Toast.error(
            'Forbidden',
          );
          break;

        case 404:
          Toast.error(
            'Resource Not Found',
          );
          break;

        case 500:
          Toast.error(
            'Internal Server Error',
          );
          break;

        default:
          Toast.error(
            error.message,
          );
      }

      return;
    }

    Toast.error(
      'Unexpected Error',
    );

  }

}

export default new ApiErrorHandler();