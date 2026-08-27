import { Injectable } from '@nestjs/common';

import { ElectionRepository } from '../repository';
import { ElectionWorkflowValidator } from '../validators';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class ApproveElectionService {

  constructor(
    private readonly repository: ElectionRepository,
    private readonly workflowValidator: ElectionWorkflowValidator,
    private readonly auditService: AuditService,
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

    const result = await this.repository.approveElection(
      id,
      approvedById,
    );

    await this.auditService.log({
      userId: approvedById,
      action: 'ELECTION_APPROVED',
      module: 'election',
      entityType: 'Election',
      entityId: id,
      result: 'SUCCESS',
      metadata: { previousStatus: election.status },
    });

    return result;

  }

}
