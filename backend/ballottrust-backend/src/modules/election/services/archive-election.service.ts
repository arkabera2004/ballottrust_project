import { Injectable } from '@nestjs/common';

import { ElectionRepository } from '../repository';
import { ElectionWorkflowValidator } from '../validators';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class ArchiveElectionService {
  constructor(
    private readonly repository: ElectionRepository,
    private readonly workflowValidator: ElectionWorkflowValidator,
    private readonly auditService: AuditService,
  ) {}

  async execute(id: string, actorId?: string) {
    const election = await this.repository.findByIdOrThrow(id);

    this.workflowValidator.ensureCanArchive(election.status);

    const data = await this.repository.archiveElection(id);

    // actorId is undefined for cron-triggered auto-archive
    // (election-lifecycle.job.ts) — logged as a system action.
    await this.auditService.log({
      userId: actorId ?? null,
      action: 'ELECTION_ARCHIVED',
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
      message: 'Election archived successfully.',
      data,
    };
  }
}
