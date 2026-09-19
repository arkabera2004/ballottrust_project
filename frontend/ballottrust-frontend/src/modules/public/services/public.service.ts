import api from '../../../api/axios';

import type {
  PublicCandidate,
  PublicCandidateDetail,
  PublicElection,
  PublicElectionDetail,
  PublicListResponse,
  PublicResults,
  PublicStatistics,
  ReceiptVerification,
} from '../types';

/**
 * The unauthenticated portal.
 *
 * Uses the shared client so the base URL and error handling are
 * consistent, but none of these endpoints require a token — the
 * interceptor simply omits the header when there is no session.
 */
class PublicService {
  async elections(params?: {
    search?: string;
    electionType?: string;
    page?: number;
    limit?: number;
  }): Promise<PublicListResponse<PublicElection>> {
    const response = await api.get('/public/elections', { params });

    return response.data.data;
  }

  async election(idOrCode: string): Promise<PublicElectionDetail> {
    const response = await api.get(`/public/elections/${idOrCode}`);

    return response.data.data;
  }

  async candidates(params?: {
    search?: string;
    electionId?: string;
    page?: number;
    limit?: number;
  }): Promise<PublicListResponse<PublicCandidate>> {
    const response = await api.get('/public/candidates', { params });

    return response.data.data;
  }

  async candidate(id: string): Promise<PublicCandidateDetail> {
    const response = await api.get(`/public/candidates/${id}`);

    return response.data.data;
  }

  async results(electionId: string): Promise<PublicResults> {
    const response = await api.get(`/public/results/${electionId}`);

    return response.data.data;
  }

  async statistics(): Promise<PublicStatistics> {
    const response = await api.get('/public/statistics');

    return response.data.data;
  }

  async verifyReceipt(code: string): Promise<ReceiptVerification> {
    const response = await api.get(
      `/public/verify/${encodeURIComponent(code)}`,
    );

    return response.data.data;
  }
}

export default new PublicService();
