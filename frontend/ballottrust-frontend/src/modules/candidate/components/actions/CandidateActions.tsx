import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import type { Candidate } from '../../types';

import {
  useCandidateActions,
} from '../../hooks';

interface CandidateActionsProps {
  candidate: Candidate;
  onComplete?: () => void;
}

export default function CandidateActions({
  candidate,
  onComplete,
}: CandidateActionsProps) {

  const navigate = useNavigate();

  const {
    cancel,
    withdraw,
    loading,
  } = useCandidateActions();

  const [showWithdraw, setShowWithdraw] =
    useState(false);

  const [withdrawReason, setWithdrawReason] =
    useState('');

  // ------------------------------------------------------
  // Edit
  // ------------------------------------------------------

  const canEdit =
    candidate.status === 'PENDING';

  // ------------------------------------------------------
  // Cancel
  // ------------------------------------------------------

  const canCancel =
    candidate.status === 'PENDING';

  // ------------------------------------------------------
  // Withdraw
  // ------------------------------------------------------

  const canWithdraw =
    ![
      'WITHDRAWN',
      'DISQUALIFIED',
    ].includes(candidate.status);

  async function handleCancel() {
    const result = await Swal.fire({
      title: 'Cancel Nomination?',
      text: 'Your pending nomination will be cancelled.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel nomination',
      cancelButtonText: 'Keep Nomination',
      confirmButtonColor: '#dc2626',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await cancel(candidate.id);

      toast.success(
        'Nomination cancelled successfully.',
      );

      onComplete?.();

    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          'Unable to cancel nomination.',
      );
    }
  }

  async function handleWithdraw() {
    if (!withdrawReason.trim()) {
      toast.error(
        'Please provide a withdrawal reason.',
      );

      return;
    }

    try {
      await withdraw(
        candidate.id,
        withdrawReason.trim(),
      );

      toast.success(
        'Candidacy withdrawn successfully.',
      );

      setShowWithdraw(false);
      setWithdrawReason('');

      onComplete?.();

    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          'Unable to withdraw candidacy.',
      );
    }
  }

  if (
    !canEdit &&
    !canCancel &&
    !canWithdraw
  ) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-slate-200 pt-5">

      <div className="flex flex-wrap gap-3">

        {canEdit && (
          <button
            type="button"
            onClick={() =>
              navigate(
                `/candidate/${candidate.id}/edit`,
              )
            }
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Edit Nomination
          </button>
        )}

        {canCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="rounded-lg border border-red-300 px-4 py-2 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Cancel Nomination
          </button>
        )}

        {canWithdraw && (
          <button
            type="button"
            onClick={() =>
              setShowWithdraw(
                !showWithdraw,
              )
            }
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Withdraw Candidacy
          </button>
        )}

      </div>

      {showWithdraw && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">

          <h3 className="font-semibold text-slate-900">
            Withdraw Candidacy
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Please provide a reason for withdrawing
            your candidacy.
          </p>

          <textarea
            value={withdrawReason}
            onChange={(event) =>
              setWithdrawReason(
                event.target.value,
              )
            }
            rows={4}
            placeholder="Withdrawal reason..."
            className="mt-4 w-full rounded-lg border border-slate-300 bg-white p-3 outline-none focus:border-blue-500"
          />

          <div className="mt-3 flex gap-3">

            <button
              type="button"
              onClick={handleWithdraw}
              disabled={
                loading ||
                !withdrawReason.trim()
              }
              className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading
                ? 'Processing...'
                : 'Confirm Withdrawal'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowWithdraw(false);
                setWithdrawReason('');
              }}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-white"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

    </div>
  );
}