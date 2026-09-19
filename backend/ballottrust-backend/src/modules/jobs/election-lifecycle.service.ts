import { Injectable, Logger } from '@nestjs/common';

import { ElectionStatus } from '@prisma/client';

import { ElectionRepository } from '../election/repository';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ElectionLifecycleService {
  private readonly logger = new Logger(ElectionLifecycleService.name);

  constructor(
    private readonly repository: ElectionRepository,
    private readonly auditService: AuditService,
  ) {}

  async activatePublishedElections() {
    const elections = await this.repository.findPublishedReadyToActivate();

    for (const election of elections) {
      await this.repository.activateElection(election.id);

      await this.auditService.log({
        userId: null,
        action: 'ELECTION_STARTED',
        module: 'election',
        entityType: 'Election',
        entityId: election.id,
        result: 'SUCCESS',
        metadata: { triggeredBy: 'system', trigger: 'cron' },
      });

      this.logger.log(`Election "${election.title}" activated.`);
    }
  }

  async closeActiveElections() {
    const elections = await this.repository.findActiveReadyToClose();

    for (const election of elections) {
      await this.repository.closeElection(election.id);

      await this.auditService.log({
        userId: null,
        action: 'ELECTION_CLOSED',
        module: 'election',
        entityType: 'Election',
        entityId: election.id,
        result: 'SUCCESS',
        metadata: { triggeredBy: 'system', trigger: 'cron' },
      });

      this.logger.log(`Election "${election.title}" voting closed.`);
    }
  }

  async publishElectionResults() {
    const elections = await this.repository.findReadyToPublishResults();

    for (const election of elections) {
      await this.repository.publishResults(election.id);

      await this.auditService.log({
        userId: null,
        action: 'ELECTION_RESULTS_PUBLISHED',
        module: 'election',
        entityType: 'Election',
        entityId: election.id,
        result: 'SUCCESS',
        metadata: { triggeredBy: 'system', trigger: 'cron' },
      });

      this.logger.log(`Results published for "${election.title}".`);
    }
  }

  async archiveElections() {
    const elections = await this.repository.findReadyToArchive();

    for (const election of elections) {
      await this.repository.archiveElection(election.id);

      await this.auditService.log({
        userId: null,
        action: 'ELECTION_ARCHIVED',
        module: 'election',
        entityType: 'Election',
        entityId: election.id,
        result: 'SUCCESS',
        metadata: { triggeredBy: 'system', trigger: 'cron' },
      });

      this.logger.log(`Election "${election.title}" archived.`);
    }
  }
}
