import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class EligibilityRuleSetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActive(electionId: string) {
    return this.prisma.eligibilityRuleSet.findFirst({
      where: { electionId, isActive: true },
    });
  }

  async findVersions(electionId: string) {
    return this.prisma.eligibilityRuleSet.findMany({
      where: { electionId },
      orderBy: { version: 'desc' },
    });
  }

  async findLatestVersionNumber(
    electionId: string,
  ): Promise<number> {
    const latest = await this.prisma.eligibilityRuleSet.findFirst({
      where: { electionId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    return latest?.version ?? 0;
  }

  /**
   * Creates a new version and deactivates every previous version for the
   * election, inside one transaction — there is never a moment where two
   * versions are simultaneously active.
   */
  async createNewVersion(data: {
    electionId: string;
    rule: Prisma.InputJsonValue;
    description?: string;
    createdById: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      await tx.eligibilityRuleSet.updateMany({
        where: { electionId: data.electionId, isActive: true },
        data: { isActive: false },
      });

      const nextVersion =
        (
          await tx.eligibilityRuleSet.findFirst({
            where: { electionId: data.electionId },
            orderBy: { version: 'desc' },
            select: { version: true },
          })
        )?.version ?? 0;

      return tx.eligibilityRuleSet.create({
        data: {
          electionId: data.electionId,
          version: nextVersion + 1,
          isActive: true,
          rule: data.rule,
          description: data.description,
          createdById: data.createdById,
        },
      });
    });
  }

  async saveSnapshot(data: {
    electionId: string;
    userId: string;
    ruleSetId: string | null;
    eligible: boolean;
    explanation: Prisma.InputJsonValue;
  }) {
    return this.prisma.voterEligibilitySnapshot.create({
      data,
    });
  }
}
