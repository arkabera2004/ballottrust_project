import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

const STAFF_SELECT = {
  id: true,
  fullName: true,
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

export const TASK_INCLUDE = {
  assignedTo: { select: STAFF_SELECT },
  assignedBy: { select: STAFF_SELECT },
  completedBy: { select: STAFF_SELECT },
  election: { select: { id: true, title: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.WorkflowTaskInclude;

@Injectable()
export class WorkflowTaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.WorkflowTaskCreateInput) {
    return this.prisma.workflowTask.create({
      data,
      include: TASK_INCLUDE,
    });
  }

  async findById(id: string) {
    return this.prisma.workflowTask.findFirst({
      where: { id, deletedAt: null },
      include: TASK_INCLUDE,
    });
  }

  async findMany(where: Prisma.WorkflowTaskWhereInput, skip = 0, take = 20) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.workflowTask.findMany({
        where: { ...where, deletedAt: null },
        include: TASK_INCLUDE,
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take,
      }),
      this.prisma.workflowTask.count({ where: { ...where, deletedAt: null } }),
    ]);

    return { items, total };
  }

  async update(id: string, data: Prisma.WorkflowTaskUpdateInput) {
    return this.prisma.workflowTask.update({
      where: { id },
      data,
      include: TASK_INCLUDE,
    });
  }

  /**
   * Conditionally completes a task, but only while it is still open.
   *
   * docs/07 §12: "Tasks cannot be completed twice." Expressed as a
   * conditional update so two concurrent requests cannot both pass a
   * check-then-write gap — the loser matches zero rows.
   */
  async completeIfOpen(
    id: string,
    // Unchecked variant so completedById can be set directly rather
    // than through a relation connect, which updateMany does not accept.
    data: Prisma.WorkflowTaskUncheckedUpdateManyInput,
  ) {
    const { count } = await this.prisma.workflowTask.updateMany({
      where: {
        id,
        deletedAt: null,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
      data,
    });

    return count;
  }

  async softDelete(id: string) {
    return this.prisma.workflowTask.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addComment(data: Prisma.WorkflowCommentCreateInput) {
    return this.prisma.workflowComment.create({
      data,
      include: { author: { select: STAFF_SELECT } },
    });
  }

  async findComments(taskId: string) {
    return this.prisma.workflowComment.findMany({
      where: { taskId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: STAFF_SELECT } },
    });
  }
}
