import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import {
  CandidateStatus,
} from '@prisma/client';

@Injectable()
export class CandidateStatusValidator {

  // ======================================================
  // Candidate Lifecycle Transition Map
  // ======================================================

  private readonly transitions:
    Partial<
      Record<
        CandidateStatus,
        CandidateStatus[]
      >
    > = {

      [CandidateStatus.PENDING]: [
        CandidateStatus.VERIFIED,
        CandidateStatus.REJECTED,
      ],

      [CandidateStatus.VERIFIED]: [
        CandidateStatus.APPROVED,
        CandidateStatus.REJECTED,
      ],

      [CandidateStatus.APPROVED]: [
        CandidateStatus.WITHDRAWN,
        CandidateStatus.DISQUALIFIED,
      ],

      [CandidateStatus.REJECTED]: [],

      [CandidateStatus.WITHDRAWN]: [],

      [CandidateStatus.DISQUALIFIED]: [],
    };

  // ======================================================
  // Validate Transition
  // ======================================================

  validateTransition(
    currentStatus: CandidateStatus,
    targetStatus: CandidateStatus,
  ): void {

    // Prevent repeated transition.
    if (currentStatus === targetStatus) {
      throw new BadRequestException(
        `Candidate is already in ${targetStatus} status.`,
      );
    }

    const allowedTransitions =
      this.transitions[currentStatus] ?? [];

    if (
      !allowedTransitions.includes(
        targetStatus,
      )
    ) {
      throw new BadRequestException(
        `Candidate status cannot transition from ${currentStatus} to ${targetStatus}.`,
      );
    }
  }

  // ======================================================
  // Final State Check
  // ======================================================

  isFinalStatus(
  status: CandidateStatus,
): boolean {
  const finalStatuses: CandidateStatus[] = [
    CandidateStatus.REJECTED,
    CandidateStatus.WITHDRAWN,
    CandidateStatus.DISQUALIFIED,
  ];

  return finalStatuses.includes(status);
}

// ======================================================
// Validate Candidate Editing
// ======================================================

validateEditable(
  status: CandidateStatus,
): void {
  if (
    status !== CandidateStatus.PENDING
  ) {
    throw new BadRequestException(
      `Candidate information cannot be modified while the candidate is in ${status} status.`,
    );
  }
}
}