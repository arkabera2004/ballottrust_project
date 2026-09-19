import { BadRequestException, Injectable } from '@nestjs/common';

import { ManifestoStatus } from '@prisma/client';

@Injectable()
export class ManifestoStatusValidator {
  // ======================================================
  // Manifesto Lifecycle Transition Map
  // ======================================================

  private readonly transitions: Record<ManifestoStatus, ManifestoStatus[]> = {
    [ManifestoStatus.DRAFT]: [ManifestoStatus.SUBMITTED],

    [ManifestoStatus.SUBMITTED]: [
      ManifestoStatus.APPROVED,
      ManifestoStatus.REJECTED,
    ],

    // Approved and rejected versions are immutable. Revising either
    // produces a new version rather than reopening the old one, which is
    // what makes the version history trustworthy.
    [ManifestoStatus.APPROVED]: [],

    [ManifestoStatus.REJECTED]: [],
  };

  validateTransition(
    currentStatus: ManifestoStatus,
    targetStatus: ManifestoStatus,
  ): void {
    if (currentStatus === targetStatus) {
      throw new BadRequestException(
        `Manifesto is already in ${targetStatus} status.`,
      );
    }

    const allowed = this.transitions[currentStatus] ?? [];

    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Manifesto cannot transition from ${currentStatus} to ${targetStatus}.`,
      );
    }
  }

  isFinalStatus(status: ManifestoStatus): boolean {
    return (
      status === ManifestoStatus.APPROVED || status === ManifestoStatus.REJECTED
    );
  }

  /** Only a DRAFT may be edited in place; anything else needs a new version. */
  validateEditable(status: ManifestoStatus): void {
    if (status !== ManifestoStatus.DRAFT) {
      throw new BadRequestException(
        `A manifesto in ${status} status cannot be edited. Create a new version instead.`,
      );
    }
  }

  /** Only a DRAFT may be deleted; submitted history is retained. */
  validateDeletable(status: ManifestoStatus): void {
    if (status !== ManifestoStatus.DRAFT) {
      throw new BadRequestException(
        `A manifesto in ${status} status cannot be deleted.`,
      );
    }
  }
}
