import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { WorkflowTaskStatus } from '@prisma/client';

import { CompleteTaskService } from './complete-task.service';

describe('CompleteTaskService', () => {
  let service: CompleteTaskService;

  const mockRepository = {
    findById: jest.fn(),
    completeIfOpen: jest.fn(),
  };

  const mockAudit = { log: jest.fn() };

  const openTask = {
    id: 'task-1',
    assignedToId: 'officer-1',
    status: WorkflowTaskStatus.PENDING,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository.findById.mockResolvedValue(openTask);
    mockRepository.completeIfOpen.mockResolvedValue(1);

    service = new CompleteTaskService(mockRepository as any, mockAudit as any);
  });

  it('records reviewer and timestamp on completion', async () => {
    await service.execute('task-1', 'officer-1', { outcome: 'Verified' });

    const data = mockRepository.completeIfOpen.mock.calls[0][1] as {
      completedById: string;
      completedAt: Date;
      status: WorkflowTaskStatus;
    };

    expect(data.status).toBe(WorkflowTaskStatus.COMPLETED);
    expect(data.completedById).toBe('officer-1');
    expect(data.completedAt).toBeInstanceOf(Date);
  });

  it('rejects an unknown task', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(service.execute('missing', 'officer-1', {})).rejects.toThrow(
      NotFoundException,
    );
  });

  it('refuses completion by someone the task is not assigned to', async () => {
    await expect(service.execute('task-1', 'someone-else', {})).rejects.toThrow(
      ForbiddenException,
    );

    expect(mockRepository.completeIfOpen).not.toHaveBeenCalled();
  });

  it('lets an administrator close a task out on the assignee behalf', async () => {
    await expect(
      service.execute('task-1', 'admin-1', {}, true),
    ).resolves.toBeDefined();
  });

  it('cannot complete the same task twice', async () => {
    // The conditional update matched no rows: another request won.
    mockRepository.completeIfOpen.mockResolvedValue(0);

    await expect(service.execute('task-1', 'officer-1', {})).rejects.toThrow(
      ConflictException,
    );
  });

  it('guards completion at the database, not with a read-then-write', async () => {
    await service.execute('task-1', 'officer-1', {});

    // The status precondition must live in the update itself, otherwise
    // two concurrent completions could both pass an earlier check.
    expect(mockRepository.completeIfOpen).toHaveBeenCalledWith(
      'task-1',
      expect.any(Object),
    );
  });

  it('audits the completion', async () => {
    await service.execute('task-1', 'officer-1', { outcome: 'Approved' });

    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'TASK_COMPLETED',
        metadata: expect.objectContaining({ outcome: 'Approved' }),
      }),
    );
  });
});
