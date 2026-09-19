import { Injectable } from '@nestjs/common';

import { EligibilityRuleSetRepository } from '../repository/eligibility-rule-set.repository';
import { DEFAULT_RULE } from '../types';

@Injectable()
export class GetActiveEligibilityRulesService {
  constructor(private readonly repository: EligibilityRuleSetRepository) {}

  async execute(electionId: string) {
    const active = await this.repository.findActive(electionId);

    if (active) {
      return active;
    }

    // No ruleset defined yet — report the implicit default so admins can
    // see exactly what's being enforced, not just an empty response.
    return {
      id: null,
      electionId,
      version: 0,
      isActive: true,
      description:
        'Default rule (no custom eligibility rules defined yet): role = VOTER AND status = APPROVED.',
      rule: DEFAULT_RULE,
      createdById: null,
      createdAt: null,
    };
  }
}
