import api from '../../../api/axios';

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../../../types/auth';

class AuthService {
  async register(
  data: RegisterRequest,
    ): Promise<RegisterResponse> {

      const response =
        await api.post(
          '/auth/register',
          data,
        );

      return response.data.data;
    }

  async login(
  data: LoginRequest,
    ): Promise<LoginResponse> {

      const response =
        await api.post(
          '/auth/login',
          data,
        );

      return response.data.data;
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

      return response.data.data;
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

      return response.data.data;
    }

  async getProfile() {
      const response =
        await api.get(
          '/auth/profile',
        );
      return response.data.data;
    }
}
export default new AuthService();