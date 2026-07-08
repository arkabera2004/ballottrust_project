import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import {
  ElectionStatus,
} from '@prisma/client';

import { ElectionRepository } from '../repository';

@Injectable()
export class ApproveElectionService {
  constructor(
    private readonly repository: ElectionRepository,
  ) {}

  async execute(
    id: string,
    approvedById: string,
  ) {
    const election =
      await this.repository.findByIdOrThrow(id);

    if (
      election.status !==
      ElectionStatus.PENDING_APPROVAL
    ) {
      throw new BadRequestException(
        'Only pending approval elections can be approved.',
      );
    }

    return this.repository.approveElection(
      id,
      approvedById,
    );
  }
}