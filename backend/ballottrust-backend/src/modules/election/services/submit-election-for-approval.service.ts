import { Injectable } from '@nestjs/common';

import { ElectionRepository } from '../repository';
import { ElectionWorkflowValidator } from '../validators';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class SubmitElectionForApprovalService {

  constructor(
    private readonly repository: ElectionRepository,
    private readonly workflowValidator: ElectionWorkflowValidator,
    private readonly auditService: AuditService,
  ) {}

  async execute(id: string, actorId?: string) {

    const election =
      await this.repository.findByIdOrThrow(id);

    this.workflowValidator.ensureCanSubmit(
      election.status,
    );

    const result = await this.repository.submitForApproval(id);

    await this.auditService.log({
      userId: actorId ?? null,
      action: 'ELECTION_SUBMITTED_FOR_APPROVAL',
      module: 'election',
      entityType: 'Election',
      entityId: id,
      result: 'SUCCESS',
      metadata: { previousStatus: election.status },
    });

    return result;

  }

}
