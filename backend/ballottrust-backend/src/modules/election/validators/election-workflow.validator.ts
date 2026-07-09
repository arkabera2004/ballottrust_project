import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { ElectionStatus } from '@prisma/client';

@Injectable()
export class ElectionWorkflowValidator {

  ensureCanSubmit(
    status: ElectionStatus,
  ) {
    if (status !== ElectionStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft elections can be submitted for approval.',
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

  ensureCanArchive(
    status: ElectionStatus,
  ) {
    if (
      status !==
      ElectionStatus.RESULT_PUBLISHED
    ) {
      throw new BadRequestException(
        'Only completed elections can be archived.',
      );
    }
  }
}