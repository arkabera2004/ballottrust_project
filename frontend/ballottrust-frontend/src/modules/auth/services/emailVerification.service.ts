import api from '../../../api/axios';

import type {
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendOtpRequest,
  ResendOtpResponse,
} from '../types/verifyEmail';

class EmailVerificationService {

  async verifyEmail(
    data: VerifyEmailRequest,
  ): Promise<VerifyEmailResponse> {

    const response =
      await api.post(
        '/auth/verify-email',
        data,
      );

    return response.data;

  }

  async resendOtp(
    data: ResendOtpRequest,
  ): Promise<ResendOtpResponse> {

    const response =
      await api.post(
        '/auth/resend-otp',
        data,
      );

    return response.data;

  }

}

export default new EmailVerificationService();