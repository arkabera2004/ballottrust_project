import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AuditSeverity,
  NotificationType,
  WorkflowTaskPriority,
} from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { WorkflowTaskRepository } from '../repository/workflow-task.repository';
import { WorkflowTaskStatusValidator } from '../validators/workflow-task-status.validator';
import { AuditService } from '../../audit/audit.service';
import {
  NOTIFICATION_REQUESTED,
  type NotificationRequestedEvent,
} from '../../notification/notification.events';
import { EscalateTaskDto } from '../dto';

@Injectable()
export class EscalateTaskService {
  constructor(
    private readonly repository: WorkflowTaskRepository,

    private readonly statusValidator: WorkflowTaskStatusValidator,

    private readonly auditService: AuditService,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, escalatedById: string, dto: EscalateTaskDto) {
    const task = await this.repository.findById(id);

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    this.statusValidator.validateOpen(task.status);

    const updated = await this.repository.update(id, {
      escalatedAt: new Date(),
      escalationNote: dto.note,
      // Escalation always raises urgency; reassignment is optional.
      priority: WorkflowTaskPriority.URGENT,
      assignedTo: dto.assignedToId
        ? { connect: { id: dto.assignedToId } }
        : undefined,
    });

    await this.auditService.log({
      userId: escalatedById,
      action: 'TASK_ESCALATED',
      module: 'workflow',
      entityType: 'WorkflowTask',
      entityId: id,
      result: 'SUCCESS',
      severity: AuditSeverity.HIGH,
      metadata: {
        note: dto.note,
        reassignedTo: dto.assignedToId ?? null,
      },
    });

    this.eventEmitter.emit(NOTIFICATION_REQUESTED, {
      userId: updated.assignedToId,
      title: 'Task escalated',
      message: `"${updated.title}" has been escalated: ${dto.note}`,
      type: NotificationType.WARNING,
      entityType: 'WorkflowTask',
      entityId: id,
      sendEmail: true,
    } satisfies NotificationRequestedEvent);

    return updated;
  }
}
