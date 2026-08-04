import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import {
  ElectionStatus,
} from '@prisma/client';

@Injectable()
export class BallotLifecycleValidator {
  // ======================================================
  // Ballot Preparation States
  // ======================================================

  private readonly allowedStatuses:
    ElectionStatus[] = [
      ElectionStatus.APPROVED,
      ElectionStatus.PUBLISHED,
    ];

 // ======================================================
// Validate Ballot Modification
// ======================================================

validateModification(
  status: ElectionStatus,
  ballotFinalizedAt: Date | null,
): void {
  // Finalization creates an explicit lock even
  // before the election becomes ACTIVE.
  if (ballotFinalizedAt) {
    throw new BadRequestException(
      'The ballot has been finalized and can no longer be modified.',
    );
  }

  if (
    !this.allowedStatuses.includes(
      status,
    )
  ) {
    throw new BadRequestException(
      `Ballot ordering cannot be modified while the election is in ${status} status.`,
    );
  }
}

  // ======================================================
  // Ballot Locked Check
  // ======================================================

  // ======================================================
// Ballot Locked Check
// ======================================================

isLocked(
  status: ElectionStatus,
  ballotFinalizedAt: Date | null,
): boolean {
  if (ballotFinalizedAt) {
    return true;
  }

  const lockedStatuses:
    ElectionStatus[] = [
      ElectionStatus.ACTIVE,
      ElectionStatus.VOTING_CLOSED,
      ElectionStatus.RESULT_PUBLISHED,
      ElectionStatus.ARCHIVED,
    ];

  return lockedStatuses.includes(
    status,
  );
}
}