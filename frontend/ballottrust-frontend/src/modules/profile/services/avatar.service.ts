import api from '../../../api/axios';

class AvatarService {

  async uploadAvatar(file: File) {

    const formData = new FormData();

    formData.append(
      'file',
      file,
    );

    const response = await api.post(
      '/upload/avatar',
      formData,
      {
        headers: {
          'Content-Type':
            'multipart/form-data',
        },
      },
    );

    return response.data;
  }
}

export default new AvatarService();