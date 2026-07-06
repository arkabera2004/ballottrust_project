import axios from 'axios';

import type {

  ForgotPasswordRequest,

  ResetPasswordRequest,

  PasswordResponse,

} from '../types';

const API =
  'http://localhost:3000/auth';

class PasswordService {

  async forgotPassword(
    data: ForgotPasswordRequest,
  ) {

    const response =
      await axios.post<PasswordResponse>(

        `${API}/forgot-password`,

        data,

      );

    return response.data;

  }

  async resetPassword(

    data: ResetPasswordRequest,

  ) {

    const response =
      await axios.post<PasswordResponse>(

        `${API}/reset-password`,

        data,

      );

    return response.data;

  }

}

export default new PasswordService();