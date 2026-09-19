import { WorkflowTaskStatus } from '@prisma/client';

import { ListTasksService } from './list-tasks.service';

describe('ListTasksService', () => {
  let service: ListTasksService;

  const mockRepository = { findMany: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository.findMany.mockResolvedValue({ items: [], total: 0 });
    service = new ListTasksService(mockRepository as any);
  });

  it('scopes to the signed-in user when one is supplied', async () => {
    await service.execute({ page: 1, limit: 20 }, 'officer-1');

    expect(mockRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ assignedToId: 'officer-1' }),
      0,
      20,
    );
  });

  it('does not let a query parameter widen a user-scoped listing', async () => {
    await service.execute(
      { page: 1, limit: 20, assignedToId: 'someone-else' },
      'officer-1',
    );

    // "My tasks" must stay mine even if the caller asks otherwise.
    expect(mockRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ assignedToId: 'officer-1' }),
      0,
      20,
    );
  });

  it('honours assignedToId for an unscoped administrative listing', async () => {
    await service.execute({ page: 1, limit: 20, assignedToId: 'officer-2' });

    expect(mockRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ assignedToId: 'officer-2' }),
      0,
      20,
    );
  });

  it('applies filters and pagination', async () => {
    await service.execute({
      page: 3,
      limit: 10,
      status: WorkflowTaskStatus.PENDING,
      module: 'candidate',
    });

    expect(mockRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        status: WorkflowTaskStatus.PENDING,
        module: 'candidate',
      }),
      20,
      10,
    );
  });
});
