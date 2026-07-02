import api from '../../../api/axios';

import type {
  LoginRequest,
  LoginResponse,
} from '../../../types/auth';

class AuthService {

  async login(
    data: LoginRequest,
  ): Promise<LoginResponse> {

    const response =
      await api.post<LoginResponse>(
        '/auth/login',
        data,
      );

    return response.data;
  }

  async refresh(
    refreshToken: string,
  ) {

    const response =
      await api.post(
        '/auth/refresh',
        {
          refreshToken,
        },
      );

    return response.data;

  }

  async logout(
    refreshToken: string,
  ) {

    const response =
      await api.post(
        '/auth/logout',
        {
          refreshToken,
        },
      );

    return response.data;

  }

}

export default new AuthService();