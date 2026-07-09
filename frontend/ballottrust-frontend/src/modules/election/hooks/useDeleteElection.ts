import { useState } from 'react';

import { ElectionService } from '../services';

export function useDeleteElection() {

  const [loading, setLoading] =
    useState(false);

  async function remove(
    id: string,
  ) {

    try {

      setLoading(true);

      await ElectionService.delete(id);

    } finally {

      setLoading(false);

    }

  }

  return {

    remove,

    loading,

  };

}