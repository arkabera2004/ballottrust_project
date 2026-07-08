import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResultService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getResults(electionId: string) {

    const election =
      await this.prisma.election.findUnique({
        where: {
          id: electionId,
        },
      });

    const candidates =
      await this.prisma.candidate.findMany({
        where: {
          electionId,
        },
        include: {
          votes: true,
        },
      });

    const results = candidates.map(
      (candidate) => ({
        candidateId: candidate.id,
        candidateName: candidate.name,
        votes: candidate.votes.length,
      }),
    );

    results.sort(
      (a, b) => b.votes - a.votes,
    );

    const winner =
      results.length > 0
        ? results[0]
        : null;

    return {
      election,
      totalCandidates: candidates.length,
      results,
      winner,
    };
  }
}