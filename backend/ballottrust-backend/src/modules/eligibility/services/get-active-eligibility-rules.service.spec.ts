import { GetActiveEligibilityRulesService } from './get-active-eligibility-rules.service';
import { EligibilityRuleSetRepository } from '../repository/eligibility-rule-set.repository';
import { DEFAULT_RULE } from '../types';

describe('GetActiveEligibilityRulesService', () => {
  let service: GetActiveEligibilityRulesService;

  const mockRepository = {
    findActive: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new GetActiveEligibilityRulesService(
      mockRepository as unknown as EligibilityRuleSetRepository,
    );
  });

  it('returns the active rule set when one exists', async () => {
    const active = {
      id: 'ruleset-1',
      electionId: 'election-1',
      version: 2,
      isActive: true,
      rule: { type: 'CONDITION' },
    };

    mockRepository.findActive.mockResolvedValue(active);

    const result = await service.execute('election-1');

    expect(result).toEqual(active);
  });

  it('returns the implicit default when no rule set has been defined', async () => {
    mockRepository.findActive.mockResolvedValue(null);

    const result = await service.execute('election-1');

    expect(result.id).toBeNull();
    expect(result.version).toBe(0);
    expect(result.rule).toEqual(DEFAULT_RULE);
  });
});
