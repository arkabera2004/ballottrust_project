import { useState } from 'react';
import {ElectionService} from '../services';

export function usePublishResults() {
  const [loading, setLoading] = useState(false);

  async function publishResults(id: string) {
    try {
      setLoading(true);
      return await ElectionService.publishResults(id);
    } finally {
      setLoading(false);
    }
  }

  return {
    publishResults,
    loading,
  };
}