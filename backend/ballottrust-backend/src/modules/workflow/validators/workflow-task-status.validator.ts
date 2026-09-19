import { BadRequestException, Injectable } from '@nestjs/common';

import { WorkflowTaskStatus } from '@prisma/client';

@Injectable()
export class WorkflowTaskStatusValidator {
  private readonly transitions: Record<
    WorkflowTaskStatus,
    WorkflowTaskStatus[]
  > = {
    [WorkflowTaskStatus.PENDING]: [
      WorkflowTaskStatus.IN_PROGRESS,
      WorkflowTaskStatus.COMPLETED,
      WorkflowTaskStatus.CANCELLED,
    ],

    [WorkflowTaskStatus.IN_PROGRESS]: [
      WorkflowTaskStatus.COMPLETED,
      WorkflowTaskStatus.CANCELLED,
    ],

    // Terminal: a finished task is a historical record.
    [WorkflowTaskStatus.COMPLETED]: [],

    [WorkflowTaskStatus.CANCELLED]: [],
  };

  validateTransition(
    currentStatus: WorkflowTaskStatus,
    targetStatus: WorkflowTaskStatus,
  ): void {
    if (currentStatus === targetStatus) {
      throw new BadRequestException(
        `Task is already in ${targetStatus} status.`,
      );
    }

    const allowed = this.transitions[currentStatus] ?? [];

    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Task cannot transition from ${currentStatus} to ${targetStatus}.`,
      );
    }
  }

  isOpen(status: WorkflowTaskStatus): boolean {
    return (
      status === WorkflowTaskStatus.PENDING ||
      status === WorkflowTaskStatus.IN_PROGRESS
    );
  }

  /** Only an open task may be edited, escalated or commented upon. */
  validateOpen(status: WorkflowTaskStatus): void {
    if (!this.isOpen(status)) {
      throw new BadRequestException(
        `Task is ${status} and can no longer be modified.`,
      );
    }
  }
}
