import {
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  ElectionStatus,
} from '@prisma/client';

import { ElectionRepository } from '../election/repository';

@Injectable()
export class ElectionLifecycleService {

  private readonly logger =
    new Logger(ElectionLifecycleService.name);

  constructor(
    private readonly repository: ElectionRepository,
  ) {}

  async activatePublishedElections() {

    const elections =
      await this.repository.findPublishedReadyToActivate();

    for (const election of elections) {

      await this.repository.activateElection(
        election.id,
      );

      this.logger.log(
        `Election "${election.title}" activated.`,
      );
    }

  }

  async closeActiveElections() {
  const elections =
    await this.repository.findActiveReadyToClose();

  for (const election of elections) {
    await this.repository.closeElection(
      election.id,
    );

    this.logger.log(
      `Election "${election.title}" voting closed.`,
    );
  }
}

async publishElectionResults() {

  const elections =
    await this.repository.findReadyToPublishResults();

  for (const election of elections) {

    await this.repository.publishResults(
      election.id,
    );

    this.logger.log(
      `Results published for "${election.title}".`,
    );

  }

}

async archiveElections() {
  const elections =
    await this.repository.findReadyToArchive();

  for (const election of elections) {
    await this.repository.archiveElection(
      election.id,
    );

    this.logger.log(
      `Election "${election.title}" archived.`,
    );
  }
}

}