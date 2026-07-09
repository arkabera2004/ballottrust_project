import { useState } from 'react';

import { ElectionService } from '../services';

import type {
  UpdateElectionDto,
} from '../types';

export function useUpdateElection() {
  const [loading, setLoading] =
    useState(false);

  async function update(
    id: string,
    dto: UpdateElectionDto,
  ) {
    try {
      setLoading(true);

      return await ElectionService.update(
        id,
        dto,
      );

    } finally {

      setLoading(false);

    }
  }

  return {
    update,
    loading,
  };
}