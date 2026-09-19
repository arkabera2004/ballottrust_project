import { BadRequestException, Injectable } from '@nestjs/common';

import { ElectionStatus } from '@prisma/client';

/**
 * Guards self-service registration against the election's registration
 * window. Mirrors CampaignWindowValidator, which does the same job for
 * the candidate campaign period.
 */
@Injectable()
export class RegistrationWindowValidator {
  /** Statuses during which an election can still accept registrations. */
  private readonly openStatuses: ElectionStatus[] = [
    ElectionStatus.PUBLISHED,
    ElectionStatus.APPROVED,
  ];

  // ==========================================
  // Validate Registration Window
  // ==========================================

  validate(
    status: ElectionStatus,
    registrationStart: Date | null,
    registrationEnd: Date | null,
    currentDate: Date = new Date(),
  ): void {
    if (!this.openStatuses.includes(status)) {
      throw new BadRequestException(
        `This election is not accepting voter registrations while in ${status} status.`,
      );
    }

    if (!registrationStart || !registrationEnd) {
      throw new BadRequestException(
        'Voter registration period has not been configured for this election.',
      );
    }

    if (registrationStart.getTime() >= registrationEnd.getTime()) {
      throw new BadRequestException(
        'The voter registration period is invalid.',
      );
    }

    if (currentDate.getTime() < registrationStart.getTime()) {
      throw new BadRequestException(
        'The voter registration period has not started yet.',
      );
    }

    if (currentDate.getTime() > registrationEnd.getTime()) {
      throw new BadRequestException('The voter registration period has ended.');
    }
  }

  // ==========================================
  // Check Whether Registration Is Open
  // ==========================================

  isOpen(
    status: ElectionStatus,
    registrationStart: Date | null,
    registrationEnd: Date | null,
    currentDate: Date = new Date(),
  ): boolean {
    if (!this.openStatuses.includes(status)) {
      return false;
    }

    if (!registrationStart || !registrationEnd) {
      return false;
    }

    if (registrationStart.getTime() >= registrationEnd.getTime()) {
      return false;
    }

    return (
      currentDate.getTime() >= registrationStart.getTime() &&
      currentDate.getTime() <= registrationEnd.getTime()
    );
  }

  // ==========================================
  // Get Registration Status
  // ==========================================

  getStatus(
    status: ElectionStatus,
    registrationStart: Date | null,
    registrationEnd: Date | null,
    currentDate: Date = new Date(),
  ): 'CLOSED' | 'NOT_CONFIGURED' | 'NOT_STARTED' | 'OPEN' | 'ENDED' {
    if (!this.openStatuses.includes(status)) {
      return 'CLOSED';
    }

    if (!registrationStart || !registrationEnd) {
      return 'NOT_CONFIGURED';
    }

    if (currentDate.getTime() < registrationStart.getTime()) {
      return 'NOT_STARTED';
    }

    if (currentDate.getTime() > registrationEnd.getTime()) {
      return 'ENDED';
    }

    return 'OPEN';
  }
}
