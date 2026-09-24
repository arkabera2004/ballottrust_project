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

  /**
   * There is no /candidates/pending route. Requesting it matched
   * @Get(':id'), whose ParseUUIDPipe rejected "pending" with a 400, so the
   * dashboard never loaded. Pending candidates are the status filter on the
   * paginated list endpoint.
   */
  async getPendingCandidates() {
    const response =
      await api.get(
        '/candidates',
        {
          params: {
            status: 'PENDING',
            limit: 10,
          },
        },
      );

    return response.data.data.data;
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