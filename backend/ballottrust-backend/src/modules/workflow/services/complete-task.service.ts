import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkflowTaskStatus } from '@prisma/client';

import { WorkflowTaskRepository } from '../repository/workflow-task.repository';
import { AuditService } from '../../audit/audit.service';
import { CompleteTaskDto } from '../dto';

/**
 * Completes a task.
 *
 * docs/07 §12 requires that "every approval records reviewer and
 * timestamp" and that "tasks cannot be completed twice". The second rule
 * is enforced with a conditional update rather than a read-then-write,
 * so two concurrent completions cannot both succeed.
 */
@Injectable()
export class CompleteTaskService {
  constructor(
    private readonly repository: WorkflowTaskRepository,

    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    completedById: string,
    dto: CompleteTaskDto,
    isAdmin = false,
  ) {
    const task = await this.repository.findById(id);

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    // A task is completed by the person it was assigned to. Admins may
    // close one out on their behalf.
    if (!isAdmin && task.assignedToId !== completedById) {
      throw new ForbiddenException('This task is not assigned to you.');
    }

    const updatedRows = await this.repository.completeIfOpen(id, {
      status: WorkflowTaskStatus.COMPLETED,
      completedById,
      completedAt: new Date(),
      outcome: dto.outcome,
    });

    if (updatedRows === 0) {
      throw new ConflictException(
        `Task is ${task.status} and cannot be completed again.`,
      );
    }

    await this.auditService.log({
      userId: completedById,
      action: 'TASK_COMPLETED',
      module: 'workflow',
      entityType: 'WorkflowTask',
      entityId: id,
      result: 'SUCCESS',
      metadata: {
        previousStatus: task.status,
        outcome: dto.outcome ?? null,
      },
    });

    return this.repository.findById(id);
  }
}
