import {
  Injectable,
} from '@nestjs/common';

import { ElectionStatus } from '@prisma/client';

import { ElectionRepository } from '../repository';
import { ElectionWorkflowValidator } from '../validators';

@Injectable()
export class PublishElectionService {
  constructor(
    private readonly repository: ElectionRepository,
    private readonly workflow: ElectionWorkflowValidator,
  ) {}

  async execute(
    id: string,
    publishedById: string,
  ) {
    const election =
      await this.repository.findByIdOrThrow(id);

    this.workflow.ensureCanPublish(
      election.status,
    );

    return this.repository.publishElection(
      id,
      publishedById,
    );
  }
}