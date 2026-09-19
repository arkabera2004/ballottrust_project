import api from '../../../api/axios';

import type {
  ForgotPasswordRequest,
  ResetPasswordRequest,
  PasswordResponse,
} from '../types';

class PasswordService {
  async forgotPassword(
    data: ForgotPasswordRequest,
  ): Promise<PasswordResponse> {
    const response = await api.post('/auth/forgot-password', data);

    return response.data.data;
  }

  async resetPassword(
    data: ResetPasswordRequest,
  ): Promise<PasswordResponse> {
    const response = await api.post('/auth/reset-password', data);

    return response.data.data;
  }
}

export default new PasswordService();
