import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { EligibilityRuleSetRepository } from '../repository/eligibility-rule-set.repository';
import { EligibilityRuleValidator } from '../validators/eligibility-rule.validator';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class DefineEligibilityRulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: EligibilityRuleSetRepository,
    private readonly validator: EligibilityRuleValidator,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    electionId: string,
    input: { rule: unknown; description?: string },
    actorId: string,
  ) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found.');
    }

    // Throws BadRequestException on anything malformed/disallowed.
    const validatedRule = this.validator.validate(input.rule);

    const ruleSet = await this.repository.createNewVersion({
      electionId,
      rule: validatedRule as unknown as Prisma.InputJsonValue,
      description: input.description,
      createdById: actorId,
    });

    await this.auditService.log({
      userId: actorId,
      action: 'ELIGIBILITY_RULES_DEFINED',
      module: 'eligibility',
      entityType: 'EligibilityRuleSet',
      entityId: ruleSet.id,
      result: 'SUCCESS',
      metadata: { electionId, version: ruleSet.version },
    });

    return ruleSet;
  }
}
