import { Injectable } from '@nestjs/common';

import { ElectionRepository } from '../repository';
import { ElectionWorkflowValidator } from '../validators';

@Injectable()
export class SubmitElectionForApprovalService {

  constructor(
    private readonly repository: ElectionRepository,
    private readonly workflowValidator: ElectionWorkflowValidator,
  ) {}

  async execute(id: string) {

    const election =
      await this.repository.findByIdOrThrow(id);

    this.workflowValidator.ensureCanSubmit(
      election.status,
    );

    return this.repository.submitForApproval(id);

  }

}