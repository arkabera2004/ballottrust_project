import { useState } from 'react';

import {
  CandidateService,
} from '../services';

import type {
  Candidate,
} from '../types';

import { getErrorMessage } from '../../../utils/api-error';

export function useCandidateActions() {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function update(
    id: string,
    data: Partial<{
      candidateType: 'INDEPENDENT' | 'PARTY';
      partyId: string;
      position: string;
      biography: string;
      campaignSlogan: string;
      campaignWebsite: string;
      manifesto: string;
      agenda: string;
      achievements: string;
      nominationStatement: string;
      photoUrl: string;
      documentUrl: string;
    }>,
  ): Promise<Candidate> {
    try {
      setLoading(true);
      setError(null);

      return await CandidateService.update(
        id,
        data,
      );
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Unable to update nomination.');

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function cancel(
    id: string,
  ) {
    try {
      setLoading(true);
      setError(null);

      return await CandidateService.cancelNomination(
        id,
      );
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Unable to cancel nomination.');

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function withdraw(
    id: string,
    reason: string,
  ): Promise<Candidate> {
    try {
      setLoading(true);
      setError(null);

      return await CandidateService.withdraw(
        id,
        reason,
      );
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Unable to withdraw candidacy.');

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    update,
    cancel,
    withdraw,
    loading,
    error,
  };
}