import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { WorkflowTaskRepository } from '../repository/workflow-task.repository';
import {
  NOTIFICATION_REQUESTED,
  type NotificationRequestedEvent,
} from '../../notification/notification.events';
import { CreateCommentDto } from '../dto';

@Injectable()
export class CommentOnTaskService {
  constructor(
    private readonly repository: WorkflowTaskRepository,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(taskId: string, authorId: string, dto: CreateCommentDto) {
    const task = await this.repository.findById(taskId);

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    const comment = await this.repository.addComment({
      task: { connect: { id: taskId } },
      author: { connect: { id: authorId } },
      body: dto.body,
    });

    // Tell the assignee, unless they are the one commenting.
    if (task.assignedToId !== authorId) {
      this.eventEmitter.emit(NOTIFICATION_REQUESTED, {
        userId: task.assignedToId,
        title: 'New comment on your task',
        message: `A comment was added to "${task.title}".`,
        type: NotificationType.INFO,
        entityType: 'WorkflowTask',
        entityId: taskId,
      } satisfies NotificationRequestedEvent);
    }

    return comment;
  }
}
