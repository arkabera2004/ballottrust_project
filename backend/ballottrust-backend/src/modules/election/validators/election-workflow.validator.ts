import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import {
  BallotOrderMethod,
  ElectionStatus,
} from '@prisma/client';

@Injectable()
export class ElectionWorkflowValidator {

  ensureCanSubmit(
    status: ElectionStatus,
  ) {

    if (
      status !== ElectionStatus.DRAFT
    ) {

      throw new BadRequestException(
        'Only draft elections can be submitted.',
      );

    }

  }

  ensureCanApprove(
    status: ElectionStatus,
  ) {

    if (
      status !==
      ElectionStatus.PENDING_APPROVAL
    ) {

      throw new BadRequestException(
        'Election is not awaiting approval.',
      );

    }

  }

  ensureCanPublish(
    status: ElectionStatus,
  ) {

    if (
      status !==
      ElectionStatus.APPROVED
    ) {

      throw new BadRequestException(
        'Only approved elections can be published.',
      );

    }

  }

  // ===========================================
  // NEW
  // ===========================================

  ensureCanStart(
    status: ElectionStatus,
  ) {

    if (
      status !==
      ElectionStatus.PUBLISHED
    ) {

      throw new BadRequestException(
        'Only published elections can be started.',
      );

    }

  }

  ensureCanClose(
    status: ElectionStatus,
  ) {

    if (
      status !==
      ElectionStatus.ACTIVE
    ) {

      throw new BadRequestException(
        'Only active elections can be closed.',
      );

    }

  }

  ensureCanPublishResults(
    status: ElectionStatus,
  ) {

    if (
      status !==
      ElectionStatus.VOTING_CLOSED
    ) {

      throw new BadRequestException(
        'Voting must be closed before publishing results.',
      );

    }

  }

  ensureCanArchive(
    status: ElectionStatus,
  ) {

    if (
      status !==
      ElectionStatus.RESULT_PUBLISHED
    ) {

      throw new BadRequestException(
        'Only published results can be archived.',
      );

    }

  }

 // ===========================================
// Ensure Ballot Is Ready
// ===========================================

ensureBallotReady(
  ballotOrderMethod:
    BallotOrderMethod | null,

  ballotFinalizedAt:
    Date | null,

  totalApprovedCandidates:
    number,

  readyCandidates:
    number,
): void {
  // Ballot must first be generated.
  if (!ballotOrderMethod) {
    throw new BadRequestException(
      'Election cannot be started because the ballot has not been generated.',
    );
  }

  // Election must contain approved candidates.
  if (
    totalApprovedCandidates === 0
  ) {
    throw new BadRequestException(
      'Election cannot be started without approved candidates.',
    );
  }

  // Every approved candidate must have both
  // candidateNumber and ballotOrder.
  if (
    readyCandidates !==
    totalApprovedCandidates
  ) {
    throw new BadRequestException(
      'Election cannot be started because the ballot is incomplete.',
    );
  }

  // Explicit finalization is required before voting.
  if (!ballotFinalizedAt) {
    throw new BadRequestException(
      'Election cannot be started because the ballot has not been finalized.',
    );
  }
}
}