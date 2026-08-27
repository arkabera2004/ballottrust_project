import { Injectable } from '@nestjs/common';

import { ElectionRepository } from '../repository';
import { ElectionWorkflowValidator } from '../validators';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class CloseElectionService {
  constructor(
    private readonly repository: ElectionRepository,
    private readonly workflowValidator: ElectionWorkflowValidator,
    private readonly auditService: AuditService,
  ) {}

  async execute(id: string, actorId?: string) {
    const election =
      await this.repository.findByIdOrThrow(id);

    this.workflowValidator.ensureCanClose(
      election.status,
    );

    const data = await this.repository.closeElection(
      id,
    );

    // actorId is undefined for cron-triggered auto-close
    // (election-lifecycle.job.ts) — logged as a system action.
    await this.auditService.log({
      userId: actorId ?? null,
      action: 'ELECTION_CLOSED',
      module: 'election',
      entityType: 'Election',
      entityId: id,
      result: 'SUCCESS',
      metadata: {
        previousStatus: election.status,
        triggeredBy: actorId ? 'user' : 'system',
      },
    });

    return {
      message: 'Election closed successfully.',
      data,
    };
  }
}
