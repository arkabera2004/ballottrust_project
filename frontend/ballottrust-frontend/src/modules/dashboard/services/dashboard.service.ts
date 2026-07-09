import api from '../../../api/axios';

class DashboardService {

  async getStats() {
    const response =
      await api.get('/dashboard/stats');

    return response.data.data;
  }

  async getCurrentElection() {
    const response =
      await api.get(
        '/dashboard/current-election',
      );

    return response.data.data;
  }

  async getPendingCandidates() {
    const response =
      await api.get(
        '/candidates/pending',
      );

    return response.data.data;
  }

  async approveCandidate(
    id: string,
  ) {
    return api.patch(
      `/candidates/${id}/approve`,
    );
  }

  async rejectCandidate(
    id: string,
  ) {
    return api.patch(
      `/candidates/${id}/reject`,
    );
  }

}

export default new DashboardService();