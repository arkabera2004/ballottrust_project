import { Injectable, NotFoundException } from '@nestjs/common';

import { WorkflowTaskRepository } from '../repository/workflow-task.repository';

@Injectable()
export class GetTaskService {
  constructor(private readonly repository: WorkflowTaskRepository) {}

  async execute(id: string) {
    const task = await this.repository.findById(id);

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    return task;
  }
}
