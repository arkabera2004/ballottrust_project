import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
  ) {}


async getStats() {
  const elections =
    await this.prisma.election.count();

  const candidates =
    await this.prisma.candidate.count();

  const votes =
    await this.prisma.vote.count();

  const activeElections =
    await this.prisma.election.count({
      where: {
        status: 'ACTIVE',
      }, 
    });

  const closedElections =
    await this.prisma.election.count({
      where: {
        status: 'CLOSED',
      },
    });

  const draftElections =
    await this.prisma.election.count({
      where: {
        status: 'DRAFT',
      },
    });

  const recentElections =
    await this.prisma.election.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    const registeredVoters =
  await this.prisma.user.count({
    where: {
      role: 'VOTER',
    },
  });

  const pendingVoters =
  await this.prisma.user.count({
    where: {
      role: 'VOTER',
      status: 'PENDING',
    },
  });

const turnout =
  registeredVoters === 0
    ? 0
    : (
        (votes / registeredVoters) *
        100
      ).toFixed(1);




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

async getWinnerSummary() {

  const latestElection =
    await this.prisma.election.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    });

  if (!latestElection) {
    return {
      message: 'No elections found',
    };
  }

  const candidates =
    await this.prisma.candidate.findMany({
      where: {
        electionId: latestElection.id,
      },
      include: {
        votes: true,
      },
    });

  if (candidates.length === 0) {
    return {
      message: 'No candidates found',
    };
  }

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

  return {
    election: latestElection.title,
    winner: results[0],
  };
}

async getResultsChart(
  electionId: string,
) {
  const candidates =
    await this.prisma.candidate.findMany({
      where: {
        electionId,
      },
      include: {
        votes: true,
      },
    });

  return candidates.map(
    (candidate) => ({
      name: candidate.name,
      votes: candidate.votes.length,
    }),
  );
}

async getCurrentElection() {
  const election =
    await this.prisma.election.findFirst({
      where: {
        status: 'ACTIVE',
      },
      include: {
        candidates: true,
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
    title: election.title,
    status: election.status,
    candidates:
      election.candidates.length,
    votes:
      election.votes.length,
  };
}




}