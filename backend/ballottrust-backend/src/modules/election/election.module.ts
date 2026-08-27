import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { ElectionCodeGenerator } from '../../common/utils';
import { AuditModule } from '../audit/audit.module';

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
  StartElectionService,
  CloseElectionService,
  PublishResultsService,
  ArchiveElectionService,
} from './services';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
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
    StartElectionService,
    CloseElectionService,
    PublishResultsService,
    ArchiveElectionService,
],

  exports: [
    ElectionRepository,
    CreateElectionService,
  ],
})
export class ElectionModule {}
