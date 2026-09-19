import { Injectable } from '@nestjs/common';
import {
  CandidateStatus,
  ElectionStatus,
  VoterRegistrationStatus,
} from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { PUBLIC_ELECTION_STATUSES } from '../public-visibility';

/**
 * Platform-wide transparency figures.
 *
 * Aggregates only. Nothing here identifies a voter or reveals how anyone
 * voted, and per-candidate tallies are deliberately excluded — those
 * live behind the results endpoint and its visibility rules.
 */
@Injectable()
export class GetPublicStatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const publicElections = {
      deletedAt: null,
      status: { in: PUBLIC_ELECTION_STATUSES },
    };

    const [
      totalElections,
      activeElections,
      completedElections,
      totalCandidates,
      totalVotesCast,
      approvedRegistrations,
    ] = await this.prisma.$transaction([
      this.prisma.election.count({ where: publicElections }),

      this.prisma.election.count({
        where: { deletedAt: null, status: ElectionStatus.ACTIVE },
      }),

      this.prisma.election.count({
        where: {
          deletedAt: null,
          status: {
            in: [ElectionStatus.VOTING_CLOSED, ElectionStatus.RESULT_PUBLISHED],
          },
        },
      }),

      this.prisma.candidate.count({
        where: {
          deletedAt: null,
          status: CandidateStatus.APPROVED,
          election: publicElections,
        },
      }),

      this.prisma.vote.count({
        where: { election: publicElections },
      }),

      this.prisma.voterRegistration.count({
        where: {
          deletedAt: null,
          status: VoterRegistrationStatus.APPROVED,
          election: publicElections,
        },
      }),
    ]);

    return {
      totalElections,
      activeElections,
      completedElections,
      totalCandidates,
      totalVotesCast,
      registeredVoters: approvedRegistrations,
      turnoutPercentage:
        approvedRegistrations === 0
          ? 0
          : Number(((totalVotesCast / approvedRegistrations) * 100).toFixed(2)),
    };
  }
}
