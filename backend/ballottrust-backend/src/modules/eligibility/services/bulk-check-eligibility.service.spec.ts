import { NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';

import { BulkCheckEligibilityService } from './bulk-check-eligibility.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EligibilityRuleSetRepository } from '../repository/eligibility-rule-set.repository';
import { EligibilityEvaluatorService } from './eligibility-evaluator.service';

describe('BulkCheckEligibilityService', () => {
  let service: BulkCheckEligibilityService;

  const mockPrisma = {
    election: { findUnique: jest.fn() },
    user: { findMany: jest.fn() },
    voterEligibilitySnapshot: { createMany: jest.fn() },
  };

  const mockRepository = {
    findActive: jest.fn(),
  };

  const evaluator = new EligibilityEvaluatorService();

  beforeEach(() => {
    jest.clearAllMocks();

    service = new BulkCheckEligibilityService(
      mockPrisma as unknown as PrismaService,
      mockRepository as unknown as EligibilityRuleSetRepository,
      evaluator,
    );
  });

  it('throws NotFoundException when the election does not exist', async () => {
    mockPrisma.election.findUnique.mockResolvedValue(null);

    await expect(service.execute('election-1')).rejects.toThrow(
      NotFoundException,
    );

    expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
  });

  it('evaluates every VOTER against the active rule and persists snapshots for each', async () => {
    mockPrisma.election.findUnique.mockResolvedValue({
      id: 'election-1',
    });

    mockRepository.findActive.mockResolvedValue({
      id: 'ruleset-1',
      version: 1,
      rule: {
        type: 'CONDITION',
        condition: { field: 'department', operator: 'eq', value: 'CSE' },
      },
    });

    mockPrisma.user.findMany.mockResolvedValue([
      {
        id: 'user-1',
        fullName: 'Alice',
        email: 'alice@example.com',
        department: 'CSE',
        course: 'B.Tech',
        year: 2,
        semester: 3,
        role: 'VOTER',
        status: 'APPROVED',
      },
      {
        id: 'user-2',
        fullName: 'Bob',
        email: 'bob@example.com',
        department: 'MECH',
        course: 'B.Tech',
        year: 2,
        semester: 3,
        role: 'VOTER',
        status: 'APPROVED',
      },
    ]);

    const result = await service.execute('election-1');

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      where: { role: Role.VOTER, deletedAt: null },
      select: expect.objectContaining({ id: true }),
    });

    expect(result.totalVoters).toBe(2);
    expect(result.eligibleCount).toBe(1);
    expect(result.ineligibleCount).toBe(1);
    expect(
      result.results.find((r) => r.userId === 'user-1')?.eligible,
    ).toBe(true);
    expect(
      result.results.find((r) => r.userId === 'user-2')?.eligible,
    ).toBe(false);

    expect(mockPrisma.voterEligibilitySnapshot.createMany).toHaveBeenCalledWith(
      {
        data: expect.arrayContaining([
          expect.objectContaining({ userId: 'user-1', eligible: true }),
          expect.objectContaining({ userId: 'user-2', eligible: false }),
        ]),
      },
    );
  });

  it('skips the snapshot write when there are no voters', async () => {
    mockPrisma.election.findUnique.mockResolvedValue({
      id: 'election-1',
    });
    mockRepository.findActive.mockResolvedValue(null);
    mockPrisma.user.findMany.mockResolvedValue([]);

    const result = await service.execute('election-1');

    expect(result.totalVoters).toBe(0);
    expect(
      mockPrisma.voterEligibilitySnapshot.createMany,
    ).not.toHaveBeenCalled();
  });
});
