import { Injectable, NotFoundException } from '@nestjs/common';

import { WorkflowTaskRepository } from '../repository/workflow-task.repository';

@Injectable()
export class ListTaskCommentsService {
  constructor(private readonly repository: WorkflowTaskRepository) {}

  async execute(taskId: string) {
    const task = await this.repository.findById(taskId);

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    const items = await this.repository.findComments(taskId);

    return { items, total: items.length };
  }
}
