import api from '../../../api/axios';

class ProfileService {
  async getMyProfile() {
    const response = await api.get('/profile/me');
    return response.data;
  }

  async updateMyProfile(data: any) {
    const response = await api.put('/profile/me', data);
    return response.data;
  }
}

export default new ProfileService();