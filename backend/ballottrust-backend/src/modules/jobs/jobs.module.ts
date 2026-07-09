import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from '../../prisma/prisma.module';

import { ElectionLifecycleJob } from './election-lifecycle.job';
import { ElectionModule } from '../election/election.module';
import { ElectionLifecycleService } from './election-lifecycle.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    ElectionModule,
  ],

  providers: [
    ElectionLifecycleJob,
    ElectionLifecycleService,
  ],
})
export class JobsModule {}