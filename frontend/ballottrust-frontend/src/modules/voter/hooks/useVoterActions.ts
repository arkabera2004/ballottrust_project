import { useState } from 'react';

import { VoterService } from '../services';
import ApiError from '../../../utils/api-error';
import Toast from '../../../utils/toast';

/**
 * Roll decisions. Each action reports its own outcome and leaves
 * refetching to the caller, so a list and a detail view can share it.
 */
export function useVoterActions(onDone?: () => void) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function run(
    id: string,
    action: () => Promise<unknown>,
    successMessage: string,
  ) {
    try {
      setPendingId(id);

      await action();

      Toast.success(successMessage);

      onDone?.();

      return true;
    } catch (err) {
      ApiError.handle(err);

      return false;
    } finally {
      setPendingId(null);
    }
  }

  return {
    pendingId,

    verify: (id: string) =>
      run(id, () => VoterService.verify(id), 'Voter verified.'),

    approve: (id: string) =>
      run(id, () => VoterService.approve(id), 'Voter added to the roll.'),

    reject: (id: string, reason: string) =>
      run(id, () => VoterService.reject(id, reason), 'Registration rejected.'),

    remove: (id: string) =>
      run(id, () => VoterService.remove(id), 'Voter removed from the roll.'),
  };
}
