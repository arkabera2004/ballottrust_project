import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ResultService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getResults(
    electionId: string,
  ) {
    // ======================================================
    // Find Election
    // ======================================================

    const election =
      await this.prisma.election.findFirst({
        where: {
          id: electionId,
          deletedAt: null,
        },
      });

    if (!election) {
      throw new NotFoundException(
        'Election not found.',
      );
    }

    // ======================================================
    // Get Approved Candidates
    // ======================================================

    const candidates =
      await this.prisma.candidate.findMany({
        where: {
          electionId,
          status: 'APPROVED',
          deletedAt: null,
        },

        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },

          party: {
            select: {
              id: true,
              name: true,
              abbreviation: true,
              symbol: true,
            },
          },

          votes: true,
        },
      });

    // ======================================================
    // Build Results
    // ======================================================

    const results =
      candidates.map(
        (candidate) => ({
          candidateId:
            candidate.id,

          userId:
            candidate.user.id,

          candidateName:
            candidate.user.fullName,

          candidateNumber:
            candidate.candidateNumber,

          candidateType:
            candidate.candidateType,

          party:
            candidate.party,

          votes:
            candidate.votes.length,
        }),
      );

    // ======================================================
    // Sort By Vote Count
    // ======================================================

    results.sort(
      (a, b) =>
        b.votes - a.votes,
    );

    // ======================================================
    // Winner
    // ======================================================

    const winner =
      results.length > 0
        ? results[0]
        : null;

    // ======================================================
    // Total Votes
    // ======================================================

    const totalVotes =
      results.reduce(
        (total, candidate) =>
          total + candidate.votes,
        0,
      );

    return {
      election,

      totalCandidates:
        candidates.length,

      totalVotes,

      results,

      winner,
    };
  }
}