import api from '../../../api/api';

import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '../types/changePassword';

class ChangePasswordService {

  async changePassword(
    data: ChangePasswordRequest,
  ) {

    const response =
      await api.patch<ChangePasswordResponse>(
        '/auth/change-password',
        data,
      );

    return response.data;

  }

}

export default new ChangePasswordService();