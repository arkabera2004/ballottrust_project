import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkflowTaskStatus } from '@prisma/client';

import { WorkflowTaskRepository } from '../repository/workflow-task.repository';
import { WorkflowTaskStatusValidator } from '../validators/workflow-task-status.validator';
import { AuditService } from '../../audit/audit.service';

/** The assignee picks a task up, moving it from PENDING to IN_PROGRESS. */
@Injectable()
export class StartTaskService {
  constructor(
    private readonly repository: WorkflowTaskRepository,

    private readonly statusValidator: WorkflowTaskStatusValidator,

    private readonly auditService: AuditService,
  ) {}

  async execute(id: string, userId: string, isAdmin = false) {
    const task = await this.repository.findById(id);

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    if (!isAdmin && task.assignedToId !== userId) {
      throw new ForbiddenException('This task is not assigned to you.');
    }

    this.statusValidator.validateTransition(
      task.status,
      WorkflowTaskStatus.IN_PROGRESS,
    );

    const updated = await this.repository.update(id, {
      status: WorkflowTaskStatus.IN_PROGRESS,
    });

    await this.auditService.log({
      userId,
      action: 'TASK_STARTED',
      module: 'workflow',
      entityType: 'WorkflowTask',
      entityId: id,
      result: 'SUCCESS',
    });

    return updated;
  }
}
