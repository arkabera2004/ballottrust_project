import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { WorkflowTaskRepository } from '../repository/workflow-task.repository';
import { QueryTaskDto } from '../dto';

@Injectable()
export class ListTasksService {
  constructor(private readonly repository: WorkflowTaskRepository) {}

  async execute(query: QueryTaskDto, forUserId?: string) {
    const where: Prisma.WorkflowTaskWhereInput = {};

    // When scoped to a user, that scope wins over any assignedToId in
    // the query — "my tasks" must never be widened by a query param.
    if (forUserId) {
      where.assignedToId = forUserId;
    } else if (query.assignedToId) {
      where.assignedToId = query.assignedToId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.electionId) {
      where.electionId = query.electionId;
    }

    if (query.module) {
      where.module = query.module;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const { items, total } = await this.repository.findMany(
      where,
      (page - 1) * limit,
      limit,
    );

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
