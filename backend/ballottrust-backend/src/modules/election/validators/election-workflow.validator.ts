import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import {
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

}