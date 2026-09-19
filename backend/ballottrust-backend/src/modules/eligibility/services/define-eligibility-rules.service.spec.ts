import { BadRequestException, NotFoundException } from '@nestjs/common';

import { DefineEligibilityRulesService } from './define-eligibility-rules.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EligibilityRuleSetRepository } from '../repository/eligibility-rule-set.repository';
import { EligibilityRuleValidator } from '../validators/eligibility-rule.validator';
import { AuditService } from '../../audit/audit.service';

describe('DefineEligibilityRulesService', () => {
  let service: DefineEligibilityRulesService;

  const mockPrisma = {
    election: { findUnique: jest.fn() },
  };

  const mockRepository = {
    createNewVersion: jest.fn(),
  };

  const mockValidator = {
    validate: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new DefineEligibilityRulesService(
      mockPrisma as unknown as PrismaService,
      mockRepository as unknown as EligibilityRuleSetRepository,
      mockValidator as unknown as EligibilityRuleValidator,
      mockAuditService as unknown as AuditService,
    );
  });

  it('throws NotFoundException when the election does not exist', async () => {
    mockPrisma.election.findUnique.mockResolvedValue(null);

    await expect(
      service.execute(
        'election-1',
        { rule: { type: 'CONDITION' } },
        'admin-1',
      ),
    ).rejects.toThrow(NotFoundException);

    expect(mockValidator.validate).not.toHaveBeenCalled();
    expect(mockRepository.createNewVersion).not.toHaveBeenCalled();
  });

  it('propagates validator rejection without creating a version', async () => {
    mockPrisma.election.findUnique.mockResolvedValue({
      id: 'election-1',
    });

    mockValidator.validate.mockImplementation(() => {
      throw new BadRequestException('bad rule');
    });

    await expect(
      service.execute(
        'election-1',
        { rule: { type: 'NONSENSE' } },
        'admin-1',
      ),
    ).rejects.toThrow(BadRequestException);

    expect(mockRepository.createNewVersion).not.toHaveBeenCalled();
    expect(mockAuditService.log).not.toHaveBeenCalled();
  });

  it('creates a new version and records an audit entry', async () => {
    mockPrisma.election.findUnique.mockResolvedValue({
      id: 'election-1',
    });

    const validatedRule = {
      type: 'CONDITION',
      condition: { field: 'year', operator: 'gte', value: 2 },
    };
    mockValidator.validate.mockReturnValue(validatedRule);

    const ruleSet = {
      id: 'ruleset-1',
      electionId: 'election-1',
      version: 1,
    };
    mockRepository.createNewVersion.mockResolvedValue(ruleSet);

    const result = await service.execute(
      'election-1',
      { rule: { type: 'CONDITION' }, description: 'Year 2+' },
      'admin-1',
    );

    expect(result).toEqual(ruleSet);

    expect(mockRepository.createNewVersion).toHaveBeenCalledWith({
      electionId: 'election-1',
      rule: validatedRule,
      description: 'Year 2+',
      createdById: 'admin-1',
    });

    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'admin-1',
        action: 'ELIGIBILITY_RULES_DEFINED',
        entityId: 'ruleset-1',
        result: 'SUCCESS',
      }),
    );
  });
});
