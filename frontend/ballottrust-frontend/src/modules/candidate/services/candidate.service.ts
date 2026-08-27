import api from '../../../api/axios';

import type {
  Candidate,
  CreateCandidateDto,
} from '../types';

class CandidateService {

  // ======================================================
  // Get My Candidates
  // ======================================================

  async getMyCandidates(): Promise<Candidate[]> {
    const response = await api.get(
      '/candidates/me',
    );

    return response.data.data;
  }

  // ======================================================
  // Get Candidate
  // ======================================================

  async getById(
    id: string,
  ): Promise<Candidate> {
    const response = await api.get(
      `/candidates/${id}`,
    );

    return response.data.data;
  }

  // ======================================================
  // Get Public Candidate Profile
  // ======================================================

  async getPublicProfile(
    id: string,
  ) {
    const response = await api.get(
      `/candidates/public/${id}`,
    );

    return response.data.data;
  }

  // ======================================================
  // Submit Nomination
  // ======================================================

  async nominate(
    dto: CreateCandidateDto,
  ): Promise<Candidate> {
    const response = await api.post(
      '/candidates/nominate',
      dto,
    );

    return response.data.data;
  }

  // ======================================================
  // Update Candidate
  // ======================================================

  async update(
    id: string,
    dto: Partial<CreateCandidateDto>,
  ): Promise<Candidate> {
    const response = await api.patch(
      `/candidates/${id}`,
      dto,
    );

    return response.data.data;
  }

  // ======================================================
  // Update Candidate Profile
  // ======================================================

  async updateProfile(
    id: string,
    dto: {
      biography?: string;
    },
  ): Promise<Candidate> {
    const response = await api.patch(
      `/candidates/${id}/profile`,
      dto,
    );

    return response.data.data;
  }

  // ======================================================
  // Update Campaign
  // ======================================================

  async updateCampaign(
    id: string,
    dto: {
      campaignSlogan?: string;
      campaignWebsite?: string;
    },
  ): Promise<Candidate> {
    const response = await api.patch(
      `/candidates/${id}/campaign`,
      dto,
    );

    return response.data.data;
  }

  // ======================================================
  // Withdraw Candidacy
  // ======================================================

  async withdraw(
    id: string,
    reason: string,
  ): Promise<Candidate> {
    const response = await api.patch(
      `/candidates/${id}/withdraw`,
      {
        reason,
      },
    );

    return response.data.data;
  }

  // ======================================================
  // Cancel Nomination
  // ======================================================

  async cancelNomination(
    id: string,
  ) {
    const response = await api.delete(
      `/candidates/${id}/nomination`,
    );

    return response.data.data;
  }
}

export default new CandidateService();