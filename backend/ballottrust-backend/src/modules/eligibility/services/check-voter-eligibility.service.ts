import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { EligibilityRuleSetRepository } from '../repository/eligibility-rule-set.repository';
import { EligibilityEvaluatorService } from './eligibility-evaluator.service';
import {
  DEFAULT_RULE,
  ELIGIBILITY_FIELDS,
  RuleNode,
  VoterAttributes,
} from '../types';

@Injectable()
export class CheckVoterEligibilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: EligibilityRuleSetRepository,
    private readonly evaluator: EligibilityEvaluatorService,
  ) {}

  /**
   * Evaluates one voter against an election's active eligibility rules
   * (or the implicit default if none has been defined yet) and persists
   * the result as a VoterEligibilitySnapshot — this is the single
   * evaluation path used both by VoteService.castVote (real-time
   * enforcement) and by admin/self "check eligibility" requests, so the
   * audit trail covers every evaluation regardless of caller.
   */
  async execute(userId: string, electionId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        department: true,
        course: true,
        year: true,
        semester: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Voter not found.');
    }

    const activeRuleSet = await this.repository.findActive(electionId);

    const rule: RuleNode = activeRuleSet
      ? (activeRuleSet.rule as unknown as RuleNode)
      : DEFAULT_RULE;

    const voterAttributes: VoterAttributes = Object.fromEntries(
      ELIGIBILITY_FIELDS.map((field) => [field, user[field]]),
    ) as VoterAttributes;

    const { eligible, explanation } = this.evaluator.evaluate(
      rule,
      voterAttributes,
    );

    await this.repository.saveSnapshot({
      electionId,
      userId,
      ruleSetId: activeRuleSet?.id ?? null,
      eligible,
      explanation: explanation as unknown as Prisma.InputJsonValue,
    });

    return {
      eligible,
      explanation,
      ruleSetId: activeRuleSet?.id ?? null,
      ruleSetVersion: activeRuleSet?.version ?? 0,
    };
  }
}
