import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, WorkflowTaskPriority } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PrismaService } from '../../../prisma/prisma.service';
import { WorkflowTaskRepository } from '../repository/workflow-task.repository';
import { AuditService } from '../../audit/audit.service';
import {
  NOTIFICATION_REQUESTED,
  type NotificationRequestedEvent,
} from '../../notification/notification.events';
import { CreateTaskDto } from '../dto';

@Injectable()
export class CreateTaskService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly repository: WorkflowTaskRepository,

    private readonly auditService: AuditService,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateTaskDto, assignedById: string) {
    const assignee = await this.prisma.user.findFirst({
      where: { id: dto.assignedToId, deletedAt: null },
    });

    if (!assignee) {
      throw new NotFoundException('Assignee not found.');
    }

    const task = await this.repository.create({
      title: dto.title,
      description: dto.description,
      module: dto.module,
      entityType: dto.entityType,
      entityId: dto.entityId,
      priority: dto.priority ?? WorkflowTaskPriority.MEDIUM,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      assignedTo: { connect: { id: dto.assignedToId } },
      assignedBy: { connect: { id: assignedById } },
      election: dto.electionId
        ? { connect: { id: dto.electionId } }
        : undefined,
    });

    await this.auditService.log({
      userId: assignedById,
      action: 'TASK_ASSIGNED',
      module: 'workflow',
      entityType: 'WorkflowTask',
      entityId: task.id,
      result: 'SUCCESS',
      metadata: {
        assignedToId: dto.assignedToId,
        taskModule: dto.module,
      },
    });

    this.eventEmitter.emit(NOTIFICATION_REQUESTED, {
      userId: dto.assignedToId,
      title: 'New task assigned',
      message: `You have been assigned: ${dto.title}`,
      type: NotificationType.INFO,
      entityType: 'WorkflowTask',
      entityId: task.id,
      sendEmail: dto.priority === WorkflowTaskPriority.URGENT,
    } satisfies NotificationRequestedEvent);

    return task;
  }
}
