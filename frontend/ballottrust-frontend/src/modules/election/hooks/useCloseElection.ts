import { useState } from 'react';
import {ElectionService} from '../services';

export function useCloseElection() {
  const [loading, setLoading] = useState(false);

  async function close(id: string) {
    try {
      setLoading(true);
      return await ElectionService.close(id);
    } finally {
      setLoading(false);
    }
  }

  return {
    close,
    loading,
  };
}