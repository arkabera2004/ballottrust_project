import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { ElectionStatus } from '@prisma/client';

import { ElectionRepository } from '../repository';

@Injectable()
export class SubmitElectionForApprovalService {
  constructor(
    private readonly repository: ElectionRepository,
  ) {}

  async execute(id: string) {
    const election =
      await this.repository.findByIdOrThrow(id);

    if (election.status !== ElectionStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft elections can be submitted for approval.',
      );
    }

    return this.repository.submitForApproval(id);
  }
}