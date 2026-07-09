import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { ElectionCodeGenerator } from '../../common/utils';

import { ElectionController } from './controllers';

import { ElectionRepository } from './repository';

import { ElectionValidator, ElectionWorkflowValidator } from './validators';

import {
  CreateElectionService,
  UpdateElectionService,
  GetElectionService,
  GetElectionByIdService,
  DeleteElectionService,
  SubmitElectionForApprovalService,
  ApproveElectionService,
  PublishElectionService,
  ListElectionsService,
} from './services';

@Module({
  imports: [
    PrismaModule,
  ],

  controllers: [
    ElectionController,
  ],

  providers: [
    ElectionRepository,
    ElectionValidator,
    ElectionWorkflowValidator,
    ElectionCodeGenerator,
    CreateElectionService,
    UpdateElectionService,
    GetElectionService,
    GetElectionByIdService,
    DeleteElectionService,
    SubmitElectionForApprovalService,
    ApproveElectionService,
    PublishElectionService,
    ListElectionsService,
],

  exports: [
    ElectionRepository,
    CreateElectionService,
  ],
})
export class ElectionModule {}
