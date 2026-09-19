import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ElectionStatus, ResultVisibility } from '@prisma/client';

import { GetPublicResultsService } from './get-public-results.service';

describe('GetPublicResultsService', () => {
  let service: GetPublicResultsService;

  const mockPrisma = {
    election: { findFirst: jest.fn() },
    candidate: { findMany: jest.fn() },
  };

  const closedElection = {
    id: 'e-1',
    title: 'Student Council',
    status: ElectionStatus.VOTING_CLOSED,
    resultVisibility: ResultVisibility.AFTER_CLOSURE,
    resultDate: null,
    endDate: new Date(),
  };

  const candidate = (id: string, name: string, votes: number) => ({
    id,
    candidateNumber: 1,
    ballotOrder: 1,
    photoUrl: null,
    user: { id: `u-${id}`, fullName: name, avatarUrl: null },
    party: null,
    _count: { votes },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.election.findFirst.mockResolvedValue(closedElection);
    mockPrisma.candidate.findMany.mockResolvedValue([]);
    service = new GetPublicResultsService(mockPrisma as any);
  });

  it('404s for an election that is not publicly visible', async () => {
    mockPrisma.election.findFirst.mockResolvedValue(null);

    await expect(service.execute('e-1')).rejects.toThrow(NotFoundException);
  });

  it('refuses results that have not been published yet', async () => {
    mockPrisma.election.findFirst.mockResolvedValue({
      ...closedElection,
      status: ElectionStatus.ACTIVE,
    });

    await expect(service.execute('e-1')).rejects.toThrow(ForbiddenException);
    expect(mockPrisma.candidate.findMany).not.toHaveBeenCalled();
  });

  it('tallies votes and ranks candidates by count', async () => {
    mockPrisma.candidate.findMany.mockResolvedValue([
      candidate('c-1', 'Alice', 3),
      candidate('c-2', 'Bob', 7),
    ]);

    const result = await service.execute('e-1');

    expect(result.totalVotes).toBe(10);
    expect(result.results.map((r) => r.name)).toEqual(['Bob', 'Alice']);
    expect(result.results[0].percentage).toBe(70);
    expect(result.results[1].percentage).toBe(30);
  });

  it('reports a single winner', async () => {
    mockPrisma.candidate.findMany.mockResolvedValue([
      candidate('c-1', 'Alice', 3),
      candidate('c-2', 'Bob', 7),
    ]);

    const result = await service.execute('e-1');

    expect(result.isTie).toBe(false);
    expect(result.winners.map((w) => w.name)).toEqual(['Bob']);
  });

  it('reports every leader rather than inventing a winner on a tie', async () => {
    mockPrisma.candidate.findMany.mockResolvedValue([
      candidate('c-1', 'Alice', 5),
      candidate('c-2', 'Bob', 5),
    ]);

    const result = await service.execute('e-1');

    expect(result.isTie).toBe(true);
    expect(result.winners).toHaveLength(2);
  });

  it('handles an election where nobody voted', async () => {
    mockPrisma.candidate.findMany.mockResolvedValue([
      candidate('c-1', 'Alice', 0),
      candidate('c-2', 'Bob', 0),
    ]);

    const result = await service.execute('e-1');

    expect(result.totalVotes).toBe(0);
    // No division by zero, and no winner declared on zero votes.
    expect(result.results.every((r) => r.percentage === 0)).toBe(true);
    expect(result.winners).toHaveLength(0);
    expect(result.isTie).toBe(false);
  });

  it('counts only approved candidates', async () => {
    await service.execute('e-1');

    const args = mockPrisma.candidate.findMany.mock.calls[0][0] as {
      where: Record<string, unknown>;
    };

    expect(args.where).toEqual(
      expect.objectContaining({ status: 'APPROVED', deletedAt: null }),
    );
  });
});
