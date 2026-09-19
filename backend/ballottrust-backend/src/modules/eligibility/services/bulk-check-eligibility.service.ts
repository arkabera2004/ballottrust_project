import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { EligibilityRuleSetRepository } from '../repository/eligibility-rule-set.repository';
import { EligibilityEvaluatorService } from './eligibility-evaluator.service';
import {
  DEFAULT_RULE,
  ELIGIBILITY_FIELDS,
  RuleNode,
  VoterAttributes,
} from '../types';

/**
 * Bulk-evaluates every VOTER-role user against an election's active
 * eligibility rules — lets an admin preview turnout before voting opens
 * rather than discovering eligibility gaps one rejected vote at a time.
 *
 * Simplification flagged for MVP: this loads and evaluates the voter
 * population in-process. Fine at typical institution scale; the spec's
 * 1M-voter load-testing target (Phase 10) would need pagination/streaming
 * here, which is intentionally out of scope for this pass.
 */
@Injectable()
export class BulkCheckEligibilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: EligibilityRuleSetRepository,
    private readonly evaluator: EligibilityEvaluatorService,
  ) {}

  async execute(electionId: string) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found.');
    }

    const activeRuleSet = await this.repository.findActive(electionId);

    const rule: RuleNode = activeRuleSet
      ? (activeRuleSet.rule as unknown as RuleNode)
      : DEFAULT_RULE;

    const voters = await this.prisma.user.findMany({
      where: { role: Role.VOTER, deletedAt: null },
      select: {
        id: true,
        fullName: true,
        email: true,
        department: true,
        course: true,
        year: true,
        semester: true,
        role: true,
        status: true,
      },
    });

    const snapshotsData: {
      electionId: string;
      userId: string;
      ruleSetId: string | null;
      eligible: boolean;
      explanation: Prisma.InputJsonValue;
    }[] = [];

    const results = voters.map((voter) => {
      const attributes: VoterAttributes = Object.fromEntries(
        ELIGIBILITY_FIELDS.map((field) => [field, voter[field]]),
      ) as VoterAttributes;

      const { eligible, explanation } = this.evaluator.evaluate(
        rule,
        attributes,
      );

      snapshotsData.push({
        electionId,
        userId: voter.id,
        ruleSetId: activeRuleSet?.id ?? null,
        eligible,
        explanation: explanation as unknown as Prisma.InputJsonValue,
      });

      return {
        userId: voter.id,
        fullName: voter.fullName,
        email: voter.email,
        eligible,
        explanation,
      };
    });

    if (snapshotsData.length > 0) {
      await this.prisma.voterEligibilitySnapshot.createMany({
        data: snapshotsData,
      });
    }

    return {
      electionId,
      ruleSetId: activeRuleSet?.id ?? null,
      ruleSetVersion: activeRuleSet?.version ?? 0,
      totalVoters: results.length,
      eligibleCount: results.filter((r) => r.eligible).length,
      ineligibleCount: results.filter((r) => !r.eligible).length,
      results,
    };
  }
}
