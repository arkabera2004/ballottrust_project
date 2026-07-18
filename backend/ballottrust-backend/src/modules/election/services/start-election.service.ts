import { Injectable } from '@nestjs/common';

import { ElectionRepository } from '../repository';
import { ElectionWorkflowValidator } from '../validators';

@Injectable()
export class StartElectionService {
  constructor(
    private readonly repository: ElectionRepository,
    private readonly workflowValidator: ElectionWorkflowValidator,
  ) {}

  async execute(id: string) {
    const election =
      await this.repository.findByIdOrThrow(id);

    this.workflowValidator.ensureCanStart(
      election.status,
    );

    return {
      message: 'Election started successfully.',
      data: await this.repository.activateElection(
        id,
      ),
    };
  }
}