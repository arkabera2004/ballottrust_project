import api from '../../../api/axios';

import type {
  CreateElectionDto,
  UpdateElectionDto,
  QueryElectionDto,
  ElectionListResponse,
} from '../types';

class ElectionService {

  // =====================================
  // List Elections
  // =====================================

  async getAll(
  params?: QueryElectionDto,
): Promise<ElectionListResponse> {

  const response = await api.get(
    '/elections',
    {
      params,
    },
  );

  return response.data.data;
}

  // =====================================
  // Get Election
  // =====================================

async getById(id: string) {
    const response = await api.get(`/elections/${id}`);
    return response.data.data;
}
  // =====================================
  // Create
  // =====================================

  async create(
    dto: CreateElectionDto,
  ) {

    const response =
      await api.post(
        '/elections',
        dto,
      );

    return response.data;

  }

  // =====================================
  // Update
  // =====================================

  async update(
    id: string,
    dto: UpdateElectionDto,
  ) {

    const response =
      await api.patch(
        `/elections/${id}`,
        dto,
      );

    return response.data;

  }

  // =====================================
  // Delete
  // =====================================

  async delete(
    id: string,
  ) {

    const response =
      await api.delete(
        `/elections/${id}`,
      );

    return response.data;

  }

  // =====================================
  // Submit
  // =====================================

  async submit(
    id: string,
  ) {

    const response =
      await api.patch(
        `/elections/${id}/submit`,
      );

    return response.data;

  }

  // =====================================
  // Approve
  // =====================================

  async approve(
    id: string,
  ) {

    const response =
      await api.patch(
        `/elections/${id}/approve`,
      );

    return response.data;

  }

  // =====================================
  // Publish
  // =====================================

  async publish(
    id: string,
  ) {

    const response =
      await api.patch(
        `/elections/${id}/publish`,
      );

    return response.data;

  }

  // ======================================================
// Start Election
// ======================================================

async start(id: string) {
  const response = await api.patch(
    `/elections/${id}/start`,
  );

  return response.data;
}

// ======================================================
// Close Election
// ======================================================

async close(id: string) {
  const response = await api.patch(
    `/elections/${id}/close`,
  );

  return response.data;
}

// ======================================================
// Publish Results
// ======================================================

async publishResults(id: string) {
  const response = await api.patch(
    `/elections/${id}/publish-results`,
  );

  return response.data;
}

// ======================================================
// Archive Election
// ======================================================

async archive(id: string) {
  const response = await api.patch(
    `/elections/${id}/archive`,
  );

  return response.data;
}

}

export default new ElectionService();