import { useState } from 'react';

import {
  CandidateService,
} from '../services';

import type {
  Candidate,
  CreateCandidateDto,
} from '../types';

export function useSubmitNomination() {
  const [loading, setLoading] =
    useState(false);

  async function submit(
    dto: CreateCandidateDto,
  ): Promise<Candidate> {
    try {
      setLoading(true);

      return await CandidateService.nominate(
        dto,
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    submit,
    loading,
  };
}