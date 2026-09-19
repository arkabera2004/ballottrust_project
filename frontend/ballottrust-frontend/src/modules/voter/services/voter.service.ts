import api from '../../../api/axios';

import type {
  QueryVoterDto,
  VoterImportResult,
  VoterListResponse,
  VoterRegistration,
  VoterRollStats,
} from '../types';

class VoterService {
  // =====================================
  // Self-service
  // =====================================

  async register(electionId: string, notes?: string) {
    const response = await api.post('/voters/register', {
      electionId,
      notes,
    });

    return response.data.data as VoterRegistration;
  }

  async myRegistrations() {
    const response = await api.get('/voters/me');

    return response.data.data as {
      items: VoterRegistration[];
      total: number;
    };
  }

  // =====================================
  // Roll administration
  // =====================================

  async getAll(params?: QueryVoterDto): Promise<VoterListResponse> {
    const response = await api.get('/voters', { params });

    return response.data.data;
  }

  async getById(id: string) {
    const response = await api.get(`/voters/${id}`);

    return response.data.data as VoterRegistration;
  }

  async stats(electionId: string) {
    const response = await api.get(`/voters/stats/${electionId}`);

    return response.data.data as VoterRollStats;
  }

  async create(userId: string, electionId: string, notes?: string) {
    const response = await api.post('/voters', {
      userId,
      electionId,
      notes,
    });

    return response.data.data as VoterRegistration;
  }

  async verify(id: string) {
    const response = await api.patch(`/voters/${id}/verify`);

    return response.data.data as VoterRegistration;
  }

  async approve(id: string) {
    const response = await api.patch(`/voters/${id}/approve`);

    return response.data.data as VoterRegistration;
  }

  async reject(id: string, reason: string) {
    const response = await api.patch(`/voters/${id}/reject`, { reason });

    return response.data.data as VoterRegistration;
  }

  async remove(id: string) {
    const response = await api.delete(`/voters/${id}`);

    return response.data.data as { success: boolean };
  }

  // =====================================
  // Bulk import / export
  // =====================================

  /**
   * `dryRun` reports what the import would do without writing anything —
   * worth running first on a large roll.
   */
  async import(
    file: File,
    electionId: string,
    dryRun = false,
  ): Promise<VoterImportResult> {
    const form = new FormData();

    form.append('file', file);
    form.append('electionId', electionId);
    form.append('dryRun', String(dryRun));

    const response = await api.post('/voters/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  }

  /** Returns the raw CSV document; the caller triggers the download. */
  async exportCsv(params?: QueryVoterDto): Promise<string> {
    const response = await api.get('/voters/export', {
      params,
      // The endpoint returns text/csv, not the usual JSON envelope.
      responseType: 'text',
      transformResponse: [(data: string) => data],
    });

    return response.data as string;
  }
}

export default new VoterService();
