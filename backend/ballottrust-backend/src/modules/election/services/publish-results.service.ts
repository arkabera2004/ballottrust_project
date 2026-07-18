import { Injectable } from '@nestjs/common';

import { ElectionRepository } from '../repository';
import { ElectionWorkflowValidator } from '../validators';

@Injectable()
export class PublishResultsService {
  constructor(
    private readonly repository: ElectionRepository,
    private readonly workflowValidator: ElectionWorkflowValidator,
  ) {}

  async execute(id: string) {
    const election =
      await this.repository.findByIdOrThrow(id);

    this.workflowValidator.ensureCanPublishResults(
      election.status,
    );

    return {
      message:
        'Results published successfully.',
      data:
        await this.repository.publishResults(
          id,
        ),
    };
  }
}