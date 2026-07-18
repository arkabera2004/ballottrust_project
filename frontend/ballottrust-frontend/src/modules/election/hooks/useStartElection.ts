import { useState } from 'react';
import {ElectionService} from '../services';

export function useStartElection() {
  const [loading, setLoading] = useState(false);

  async function start(id: string) {
    try {
      setLoading(true);
      return await ElectionService.start(id);
    } finally {
      setLoading(false);
    }
  }

  return {
    start,
    loading,
  };
}