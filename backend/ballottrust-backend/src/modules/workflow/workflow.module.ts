import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

import { WorkflowController } from './workflow.controller';

import { WorkflowTaskRepository } from './repository/workflow-task.repository';
import { WorkflowTaskStatusValidator } from './validators/workflow-task-status.validator';

import { CreateTaskService } from './services/create-task.service';
import { ListTasksService } from './services/list-tasks.service';
import { GetTaskService } from './services/get-task.service';
import { UpdateTaskService } from './services/update-task.service';
import { StartTaskService } from './services/start-task.service';
import { CompleteTaskService } from './services/complete-task.service';
import { EscalateTaskService } from './services/escalate-task.service';
import { CancelTaskService } from './services/cancel-task.service';
import { CommentOnTaskService } from './services/comment-on-task.service';
import { ListTaskCommentsService } from './services/list-task-comments.service';

@Module({
  imports: [PrismaModule, AuditModule],

  controllers: [WorkflowController],

  providers: [
    WorkflowTaskRepository,
    WorkflowTaskStatusValidator,
    CreateTaskService,
    ListTasksService,
    GetTaskService,
    UpdateTaskService,
    StartTaskService,
    CompleteTaskService,
    EscalateTaskService,
    CancelTaskService,
    CommentOnTaskService,
    ListTaskCommentsService,
  ],

  exports: [CreateTaskService, WorkflowTaskRepository],
})
export class WorkflowModule {}
