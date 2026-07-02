import axios from 'axios';
import Toast from './toast';

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