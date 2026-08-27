import { Injectable } from '@nestjs/common';

import { ElectionRepository } from '../repository';
import { ElectionWorkflowValidator } from '../validators';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class StartElectionService {
  constructor(
    private readonly repository: ElectionRepository,
    private readonly workflowValidator: ElectionWorkflowValidator,
    private readonly auditService: AuditService,
  ) {}

  async execute(id: string, actorId?: string) {
    const election =
      await this.repository.findByIdOrThrow(id);

    this.workflowValidator.ensureCanStart(
      election.status,
    );

    // ===========================================
// Validate Ballot Readiness
// ===========================================

const ballotReadiness =
  await this.repository
    .getBallotReadiness(
      id,
    );

this.workflowValidator
  .ensureBallotReady(
    election.ballotOrderMethod,

    election.ballotFinalizedAt,

    ballotReadiness
      .totalApprovedCandidates,

    ballotReadiness
      .readyCandidates,
  );

    const data = await this.repository.activateElection(
      id,
    );

    // actorId is undefined for cron-triggered auto-activation
    // (election-lifecycle.job.ts) — logged as a system action.
    await this.auditService.log({
      userId: actorId ?? null,
      action: 'ELECTION_STARTED',
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
      message: 'Election started successfully.',
      data,
    };
  }
}
