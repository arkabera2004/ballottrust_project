import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

import { EligibilityController } from './eligibility.controller';

import { EligibilityRuleSetRepository } from './repository/eligibility-rule-set.repository';
import { EligibilityRuleValidator } from './validators/eligibility-rule.validator';
import { EligibilityEvaluatorService } from './services/eligibility-evaluator.service';
import { DefineEligibilityRulesService } from './services/define-eligibility-rules.service';
import { GetActiveEligibilityRulesService } from './services/get-active-eligibility-rules.service';
import { ListEligibilityRuleVersionsService } from './services/list-eligibility-rule-versions.service';
import { CheckVoterEligibilityService } from './services/check-voter-eligibility.service';
import { BulkCheckEligibilityService } from './services/bulk-check-eligibility.service';

@Module({
  imports: [PrismaModule, AuditModule],

  controllers: [EligibilityController],

  providers: [
    EligibilityRuleSetRepository,
    EligibilityRuleValidator,
    EligibilityEvaluatorService,
    DefineEligibilityRulesService,
    GetActiveEligibilityRulesService,
    ListEligibilityRuleVersionsService,
    CheckVoterEligibilityService,
    BulkCheckEligibilityService,
  ],

  exports: [CheckVoterEligibilityService],
})
export class EligibilityModule {}
