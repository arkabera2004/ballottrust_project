import { Injectable } from '@nestjs/common';

import { EligibilityRuleSetRepository } from '../repository/eligibility-rule-set.repository';

@Injectable()
export class ListEligibilityRuleVersionsService {
  constructor(private readonly repository: EligibilityRuleSetRepository) {}

  async execute(electionId: string) {
    return this.repository.findVersions(electionId);
  }
}
