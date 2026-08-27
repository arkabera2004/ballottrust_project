import { Injectable } from '@nestjs/common';

import { ElectionRepository } from '../repository';
import { ElectionWorkflowValidator } from '../validators';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class PublishElectionService {

  constructor(
    private readonly repository: ElectionRepository,
    private readonly workflowValidator: ElectionWorkflowValidator,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    publishedById: string,
  ) {

    const election =
      await this.repository.findByIdOrThrow(id);

    this.workflowValidator.ensureCanPublish(
      election.status,
    );

    const publishedElection =
      await this.repository.publishElection(
        id,
        publishedById,
      );

    await this.auditService.log({
      userId: publishedById,
      action: 'ELECTION_PUBLISHED',
      module: 'election',
      entityType: 'Election',
      entityId: id,
      result: 'SUCCESS',
      metadata: { previousStatus: election.status },
    });

    return {
      message: 'Election published successfully.',
      data: publishedElection,
    };

  }

}
