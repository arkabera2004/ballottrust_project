import { Injectable } from '@nestjs/common';

import { ElectionRepository } from '../repository';
import { ElectionWorkflowValidator } from '../validators';

@Injectable()
export class ApproveElectionService {

  constructor(
    private readonly repository: ElectionRepository,
    private readonly workflowValidator: ElectionWorkflowValidator,
  ) {}

  async execute(
    id: string,
    approvedById: string,
  ) {

    const election =
      await this.repository.findByIdOrThrow(id);

    this.workflowValidator.ensureCanApprove(
      election.status,
    );

    return this.repository.approveElection(
      id,
      approvedById,
    );

  }

}