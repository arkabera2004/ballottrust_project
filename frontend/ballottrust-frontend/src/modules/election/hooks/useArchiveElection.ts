import { useState } from 'react';
import { ElectionService } from '../services';

export function useArchiveElection() {
  const [loading, setLoading] = useState(false);

  async function archive(id: string) {
    try {
      setLoading(true);
      return await ElectionService.archive(id);
    } finally {
      setLoading(false);
    }
  }

  return {
    archive,
    loading,
  };
}