import { useCallback, useEffect, useState } from 'react';

import { VoterService } from '../services';
import ApiError from '../../../utils/api-error';

import type { VoterRegistration } from '../types';

/** Every election the signed-in voter has registered for. */
export function useMyRegistrations() {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<VoterRegistration[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const result = await VoterService.myRegistrations();

      setRegistrations(result.items);
    } catch (err) {
      ApiError.handle(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { loading, registrations, refresh: load };
}
