import { BadRequestException, Injectable } from '@nestjs/common';

import { VoterRegistrationStatus } from '@prisma/client';

@Injectable()
export class VoterRegistrationStatusValidator {
  // ======================================================
  // Voter Registration Lifecycle Transition Map
  // ======================================================

  private readonly transitions: Record<
    VoterRegistrationStatus,
    VoterRegistrationStatus[]
  > = {
    [VoterRegistrationStatus.PENDING]: [
      VoterRegistrationStatus.VERIFIED,
      VoterRegistrationStatus.REJECTED,
    ],

    [VoterRegistrationStatus.VERIFIED]: [
      VoterRegistrationStatus.APPROVED,
      VoterRegistrationStatus.REJECTED,
    ],

    // Approval is terminal on the happy path. Removing a voter from the
    // roll after approval is a delete, not a status change, so that the
    // audit trail records it as such.
    [VoterRegistrationStatus.APPROVED]: [],

    [VoterRegistrationStatus.REJECTED]: [],
  };

  // ======================================================
  // Validate Transition
  // ======================================================

  validateTransition(
    currentStatus: VoterRegistrationStatus,
    targetStatus: VoterRegistrationStatus,
  ): void {
    if (currentStatus === targetStatus) {
      throw new BadRequestException(
        `Voter registration is already in ${targetStatus} status.`,
      );
    }

    const allowedTransitions = this.transitions[currentStatus] ?? [];

    if (!allowedTransitions.includes(targetStatus)) {
      throw new BadRequestException(
        `Voter registration cannot transition from ${currentStatus} to ${targetStatus}.`,
      );
    }
  }

  // ======================================================
  // Final State Check
  // ======================================================

  isFinalStatus(status: VoterRegistrationStatus): boolean {
    const finalStatuses: VoterRegistrationStatus[] = [
      VoterRegistrationStatus.APPROVED,
      VoterRegistrationStatus.REJECTED,
    ];

    return finalStatuses.includes(status);
  }

  // ======================================================
  // Validate Editing
  // ======================================================

  validateEditable(status: VoterRegistrationStatus): void {
    if (this.isFinalStatus(status)) {
      throw new BadRequestException(
        `Voter registration cannot be modified while in ${status} status.`,
      );
    }
  }
}
