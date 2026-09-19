import { BadRequestException } from '@nestjs/common';
import { WorkflowTaskStatus } from '@prisma/client';

import { WorkflowTaskStatusValidator } from './workflow-task-status.validator';

describe('WorkflowTaskStatusValidator', () => {
  let validator: WorkflowTaskStatusValidator;

  beforeEach(() => {
    validator = new WorkflowTaskStatusValidator();
  });

  it.each([
    [WorkflowTaskStatus.PENDING, WorkflowTaskStatus.IN_PROGRESS],
    [WorkflowTaskStatus.PENDING, WorkflowTaskStatus.COMPLETED],
    [WorkflowTaskStatus.PENDING, WorkflowTaskStatus.CANCELLED],
    [WorkflowTaskStatus.IN_PROGRESS, WorkflowTaskStatus.COMPLETED],
    [WorkflowTaskStatus.IN_PROGRESS, WorkflowTaskStatus.CANCELLED],
  ])('allows %s -> %s', (from, to) => {
    expect(() => validator.validateTransition(from, to)).not.toThrow();
  });

  it('refuses to reopen a completed task', () => {
    expect(() =>
      validator.validateTransition(
        WorkflowTaskStatus.COMPLETED,
        WorkflowTaskStatus.IN_PROGRESS,
      ),
    ).toThrow(BadRequestException);
  });

  it('refuses to revive a cancelled task', () => {
    expect(() =>
      validator.validateTransition(
        WorkflowTaskStatus.CANCELLED,
        WorkflowTaskStatus.PENDING,
      ),
    ).toThrow(BadRequestException);
  });

  it('refuses to complete an already completed task', () => {
    expect(() =>
      validator.validateTransition(
        WorkflowTaskStatus.COMPLETED,
        WorkflowTaskStatus.COMPLETED,
      ),
    ).toThrow(/already in COMPLETED/);
  });

  describe('isOpen', () => {
    it('treats pending and in-progress as open', () => {
      expect(validator.isOpen(WorkflowTaskStatus.PENDING)).toBe(true);
      expect(validator.isOpen(WorkflowTaskStatus.IN_PROGRESS)).toBe(true);
    });

    it('treats completed and cancelled as closed', () => {
      expect(validator.isOpen(WorkflowTaskStatus.COMPLETED)).toBe(false);
      expect(validator.isOpen(WorkflowTaskStatus.CANCELLED)).toBe(false);
    });
  });

  it('blocks modification of a closed task', () => {
    expect(() => validator.validateOpen(WorkflowTaskStatus.COMPLETED)).toThrow(
      /can no longer be modified/,
    );
  });
});
