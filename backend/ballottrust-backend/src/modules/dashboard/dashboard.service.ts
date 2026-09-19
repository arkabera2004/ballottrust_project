import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // ======================================================
  // Dashboard Statistics
  // ======================================================

  async getStats() {
    const elections = await this.prisma.election.count({
      where: {
        deletedAt: null,
      },
    });

    const candidates = await this.prisma.candidate.count({
      where: {
        deletedAt: null,
      },
    });

    const votes = await this.prisma.vote.count();

    const activeElections = await this.prisma.election.count({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
      },
    });

    const closedElections = await this.prisma.election.count({
      where: {
        status: 'VOTING_CLOSED',
        deletedAt: null,
      },
    });

    const draftElections = await this.prisma.election.count({
      where: {
        status: 'DRAFT',
        deletedAt: null,
      },
    });

    const recentElections = await this.prisma.election.findMany({
      where: {
        deletedAt: null,
      },

      orderBy: {
        createdAt: 'desc',
      },

      take: 5,
    });

    const registeredVoters = await this.prisma.user.count({
      where: {
        role: 'VOTER',
        deletedAt: null,
      },
    });

    const pendingVoters = await this.prisma.user.count({
      where: {
        role: 'VOTER',
        status: 'PENDING',
        deletedAt: null,
      },
    });

    const turnout =
      registeredVoters === 0
        ? 0
        : Number(((votes / registeredVoters) * 100).toFixed(1));

    return {
      elections,
      candidates,
      votes,

      activeElections,
      closedElections,
      draftElections,

      registeredVoters,
      pendingVoters,

      turnout,

      recentElections,
    };
  }

  // ======================================================
  // Latest Election Winner
  // ======================================================

  async getWinnerSummary() {
    const latestElection = await this.prisma.election.findFirst({
      where: {
        deletedAt: null,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!latestElection) {
      return {
        message: 'No elections found',
      };
    }

    const candidates = await this.prisma.candidate.findMany({
      where: {
        electionId: latestElection.id,
        deletedAt: null,
        status: 'APPROVED',
      },

      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },

        votes: true,
      },
    });

    if (candidates.length === 0) {
      return {
        message: 'No candidates found',
      };
    }

    const results = candidates.map((candidate) => ({
      candidateId: candidate.id,

      candidateName: candidate.user.fullName,

      candidateNumber: candidate.candidateNumber,

      votes: candidate.votes.length,
    }));

    results.sort((a, b) => b.votes - a.votes);

    return {
      electionId: latestElection.id,

      election: latestElection.title,

      winner: results[0],
    };
  }

  // ======================================================
  // Election Results Chart
  // ======================================================

  async getResultsChart(electionId: string) {
    const candidates = await this.prisma.candidate.findMany({
      where: {
        electionId,
        deletedAt: null,
        status: 'APPROVED',
      },

      include: {
        user: {
          select: {
            fullName: true,
          },
        },

        votes: true,
      },
    });

    return candidates.map((candidate) => ({
      candidateId: candidate.id,

      candidateNumber: candidate.candidateNumber,

      name: candidate.user.fullName,

      votes: candidate.votes.length,
    }));
  }

  // ======================================================
  // Current Active Election
  // ======================================================

  async getCurrentElection() {
    const election = await this.prisma.election.findFirst({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
      },

      include: {
        candidates: {
          where: {
            status: 'APPROVED',
            deletedAt: null,
          },
        },

        votes: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!election) {
      return null;
    }

    return {
      id: election.id,

      title: election.title,

      electionCode: election.electionCode,

      status: election.status,

      candidates: election.candidates.length,

      votes: election.votes.length,
    };
  }
}
