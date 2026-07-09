import { useState } from 'react';

import { ElectionService } from '../services';

import type {
  CreateElectionDto,
} from '../types';

export function useCreateElection() {
  const [loading, setLoading] =
    useState(false);

  async function create(
    dto: CreateElectionDto,
  ) {
    try {
      setLoading(true);

      return await ElectionService.create(dto);

    } finally {

      setLoading(false);

    }
  }

  return {
    create,
    loading,
  };
}