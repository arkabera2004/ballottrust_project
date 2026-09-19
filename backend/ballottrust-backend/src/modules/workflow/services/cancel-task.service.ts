import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkflowTaskStatus } from '@prisma/client';

import { WorkflowTaskRepository } from '../repository/workflow-task.repository';
import { WorkflowTaskStatusValidator } from '../validators/workflow-task-status.validator';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class CancelTaskService {
  constructor(
    private readonly repository: WorkflowTaskRepository,

    private readonly statusValidator: WorkflowTaskStatusValidator,

    private readonly auditService: AuditService,
  ) {}

  async execute(id: string, cancelledById: string) {
    const task = await this.repository.findById(id);

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    this.statusValidator.validateTransition(
      task.status,
      WorkflowTaskStatus.CANCELLED,
    );

    const updated = await this.repository.update(id, {
      status: WorkflowTaskStatus.CANCELLED,
    });

    await this.auditService.log({
      userId: cancelledById,
      action: 'TASK_CANCELLED',
      module: 'workflow',
      entityType: 'WorkflowTask',
      entityId: id,
      result: 'SUCCESS',
      metadata: { previousStatus: task.status },
    });

    return updated;
  }
}
