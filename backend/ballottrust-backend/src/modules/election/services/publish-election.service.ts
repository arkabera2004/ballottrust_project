import { Injectable } from '@nestjs/common';

import { ElectionRepository } from '../repository';
import { ElectionWorkflowValidator } from '../validators';

@Injectable()
export class PublishElectionService {

  constructor(
    private readonly repository: ElectionRepository,
    private readonly workflowValidator: ElectionWorkflowValidator,
  ) {}

  async execute(
    id: string,
    publishedById: string,
  ) {

    const election =
      await this.repository.findByIdOrThrow(id);

    this.workflowValidator.ensureCanPublish(
      election.status,
    );

    const publishedElection =
      await this.repository.publishElection(
        id,
        publishedById,
      );

    return {
      message: 'Election published successfully.',
      data: publishedElection,
    };

  }

}