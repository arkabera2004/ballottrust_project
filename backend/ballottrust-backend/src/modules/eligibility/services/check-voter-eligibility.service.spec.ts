import { NotFoundException } from '@nestjs/common';

import { CheckVoterEligibilityService } from './check-voter-eligibility.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EligibilityRuleSetRepository } from '../repository/eligibility-rule-set.repository';
import { EligibilityEvaluatorService } from './eligibility-evaluator.service';

describe('CheckVoterEligibilityService', () => {
  let service: CheckVoterEligibilityService;

  const mockPrisma = {
    user: { findUnique: jest.fn() },
  };

  const mockRepository = {
    findActive: jest.fn(),
    saveSnapshot: jest.fn(),
  };

  const evaluator = new EligibilityEvaluatorService();

  beforeEach(() => {
    jest.clearAllMocks();

    service = new CheckVoterEligibilityService(
      mockPrisma as unknown as PrismaService,
      mockRepository as unknown as EligibilityRuleSetRepository,
      evaluator,
    );
  });

  it('throws NotFoundException when the voter does not exist', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(service.execute('user-1', 'election-1')).rejects.toThrow(
      NotFoundException,
    );

    expect(mockRepository.saveSnapshot).not.toHaveBeenCalled();
  });

  it('evaluates against the default rule when no rule set is active, and persists a snapshot', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      department: 'CSE',
      course: 'B.Tech',
      year: 2,
      semester: 3,
      role: 'VOTER',
      status: 'APPROVED',
    });

    mockRepository.findActive.mockResolvedValue(null);

    const result = await service.execute('user-1', 'election-1');

    expect(result.eligible).toBe(true);
    expect(result.ruleSetId).toBeNull();
    expect(result.ruleSetVersion).toBe(0);

    expect(mockRepository.saveSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        electionId: 'election-1',
        userId: 'user-1',
        ruleSetId: null,
        eligible: true,
      }),
    );
  });

  it('evaluates against the active custom rule set when one exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      department: 'MECH',
      course: 'B.Tech',
      year: 3,
      semester: 5,
      role: 'VOTER',
      status: 'APPROVED',
    });

    mockRepository.findActive.mockResolvedValue({
      id: 'ruleset-1',
      version: 3,
      rule: {
        type: 'CONDITION',
        condition: { field: 'department', operator: 'eq', value: 'CSE' },
      },
    });

    const result = await service.execute('user-1', 'election-1');

    expect(result.eligible).toBe(false);
    expect(result.ruleSetId).toBe('ruleset-1');
    expect(result.ruleSetVersion).toBe(3);

    expect(mockRepository.saveSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        ruleSetId: 'ruleset-1',
        eligible: false,
      }),
    );
  });

  it('never passes fields outside the whitelist to the evaluator', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      department: 'CSE',
      course: 'B.Tech',
      year: 2,
      semester: 3,
      role: 'VOTER',
      status: 'APPROVED',
    });

    mockRepository.findActive.mockResolvedValue(null);

    await service.execute('user-1', 'election-1');

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: {
        department: true,
        course: true,
        year: true,
        semester: true,
        role: true,
        status: true,
      },
    });
  });
});
