import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { ElectionLifecycleService } from './election-lifecycle.service';

@Injectable()
export class ElectionLifecycleJob {
  constructor(
    private readonly lifecycleService: ElectionLifecycleService,
  ) {}

  @Cron('*/1 * * * *')
async processElectionLifecycle() {

  await this.lifecycleService.activatePublishedElections();

  await this.lifecycleService.closeActiveElections();

  await this.lifecycleService.publishElectionResults();

  await this.lifecycleService.archiveElections();
}

}