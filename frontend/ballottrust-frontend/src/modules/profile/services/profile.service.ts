import api from '../../../api/axios';

import type { ProfileFormData } from '../schemas/profile.schema';

class ProfileService {
  async getMyProfile() {
    const response = await api.get('/profile/me');
    return response.data;
  }

  async updateMyProfile(data: Partial<ProfileFormData>) {
    const response = await api.put('/profile/me', data);
    return response.data;
  }
}

export default new ProfileService();