import api from '../../../api/axios';

import type {
  LoginRequest,
  LoginResponse,
} from '../../../types/auth';

class AuthService {
  register(_arg0: { fullName: string; email: string; password: string; role: "VOTER" | "CANDIDATE"; }) {
      throw new Error('Method not implemented.');
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