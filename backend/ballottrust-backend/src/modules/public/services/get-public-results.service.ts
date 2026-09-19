import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CandidateStatus } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import {
  PUBLIC_ELECTION_STATUSES,
  areResultsPublic,
} from '../public-visibility';

@Injectable()
export class GetPublicResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(electionId: string) {
    const election = await this.prisma.election.findFirst({
      where: {
        id: electionId,
        deletedAt: null,
        status: { in: PUBLIC_ELECTION_STATUSES },
      },
      select: {
        id: true,
        title: true,
        status: true,
        resultVisibility: true,
        resultDate: true,
        endDate: true,
      },
    });

    if (!election) {
      throw new NotFoundException('Election not found.');
    }

    if (!areResultsPublic(election.status, election.resultVisibility)) {
      // Publishing a running tally mid-election would influence it.
      throw new ForbiddenException(
        'Results for this election have not been published yet.',
      );
    }

    const candidates = await this.prisma.candidate.findMany({
      where: {
        electionId,
        deletedAt: null,
        status: CandidateStatus.APPROVED,
      },
      select: {
        id: true,
        candidateNumber: true,
        ballotOrder: true,
        photoUrl: true,
        user: { select: { id: true, fullName: true, avatarUrl: true } },
        party: { select: { id: true, name: true, abbreviation: true } },
        _count: { select: { votes: true } },
      },
      orderBy: { ballotOrder: 'asc' },
    });

    const totalVotes = candidates.reduce((sum, c) => sum + c._count.votes, 0);

    const tallied = candidates
      .map((candidate) => ({
        candidateId: candidate.id,
        candidateNumber: candidate.candidateNumber,
        ballotOrder: candidate.ballotOrder,
        name: candidate.user.fullName,
        photoUrl: candidate.photoUrl ?? candidate.user.avatarUrl,
        party: candidate.party,
        votes: candidate._count.votes,
        percentage:
          totalVotes === 0
            ? 0
            : Number(((candidate._count.votes / totalVotes) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.votes - a.votes);

    const topVotes = tallied[0]?.votes ?? 0;

    // A tie has no single winner. Reporting one would be wrong, so every
    // candidate on the top score is returned and the caller decides how
    // to present it.
    const leaders = tallied.filter(
      (candidate) => candidate.votes === topVotes && topVotes > 0,
    );

    return {
      election: {
        id: election.id,
        title: election.title,
        status: election.status,
        resultDate: election.resultDate,
      },
      totalVotes,
      results: tallied,
      isTie: leaders.length > 1,
      winners: leaders,
    };
  }
}
