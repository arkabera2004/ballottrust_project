import { Injectable } from '@nestjs/common';

import { ElectionRepository } from '../repository';
import { ElectionWorkflowValidator } from '../validators';

@Injectable()
export class CloseElectionService {
  constructor(
    private readonly repository: ElectionRepository,
    private readonly workflowValidator: ElectionWorkflowValidator,
  ) {}

  async execute(id: string) {
    const election =
      await this.repository.findByIdOrThrow(id);

    this.workflowValidator.ensureCanClose(
      election.status,
    );

    return {
      message: 'Election closed successfully.',
      data: await this.repository.closeElection(
        id,
      ),
    };
  }
}