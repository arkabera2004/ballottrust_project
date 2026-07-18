import { Injectable } from '@nestjs/common';

import { ElectionRepository } from '../repository';
import { ElectionWorkflowValidator } from '../validators';

@Injectable()
export class ArchiveElectionService {
  constructor(
    private readonly repository: ElectionRepository,
    private readonly workflowValidator: ElectionWorkflowValidator,
  ) {}

  async execute(id: string) {
    const election =
      await this.repository.findByIdOrThrow(id);

    this.workflowValidator.ensureCanArchive(
      election.status,
    );

    return {
      message:
        'Election archived successfully.',
      data:
        await this.repository.archiveElection(
          id,
        ),
    };
  }
}