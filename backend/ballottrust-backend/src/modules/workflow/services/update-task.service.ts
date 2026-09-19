import { Injectable, NotFoundException } from '@nestjs/common';

import { WorkflowTaskRepository } from '../repository/workflow-task.repository';
import { WorkflowTaskStatusValidator } from '../validators/workflow-task-status.validator';
import { AuditService } from '../../audit/audit.service';
import { UpdateTaskDto } from '../dto';

@Injectable()
export class UpdateTaskService {
  constructor(
    private readonly repository: WorkflowTaskRepository,

    private readonly statusValidator: WorkflowTaskStatusValidator,

    private readonly auditService: AuditService,
  ) {}

  async execute(id: string, dto: UpdateTaskDto, updatedById: string) {
    const task = await this.repository.findById(id);

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    this.statusValidator.validateOpen(task.status);

    const updated = await this.repository.update(id, {
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      assignedTo: dto.assignedToId
        ? { connect: { id: dto.assignedToId } }
        : undefined,
    });

    await this.auditService.log({
      userId: updatedById,
      action:
        dto.assignedToId && dto.assignedToId !== task.assignedToId
          ? 'TASK_REASSIGNED'
          : 'TASK_UPDATED',
      module: 'workflow',
      entityType: 'WorkflowTask',
      entityId: id,
      result: 'SUCCESS',
      metadata: dto.assignedToId
        ? { from: task.assignedToId, to: dto.assignedToId }
        : undefined,
    });

    return updated;
  }
}
