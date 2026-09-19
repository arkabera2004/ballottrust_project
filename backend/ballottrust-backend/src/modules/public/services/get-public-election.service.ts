import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import {
  PUBLIC_ELECTION_STATUSES,
  areResultsPublic,
} from '../public-visibility';
import { PUBLIC_ELECTION_SELECT } from './list-public-elections.service';

@Injectable()
export class GetPublicElectionService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(idOrCode: string) {
    const election = await this.prisma.election.findFirst({
      where: {
        deletedAt: null,
        status: { in: PUBLIC_ELECTION_STATUSES },
        OR: [{ id: idOrCode }, { electionCode: idOrCode }],
      },
      select: {
        ...PUBLIC_ELECTION_SELECT,
        resultVisibility: true,
        _count: { select: { candidates: true } },
      },
    });

    if (!election) {
      // Deliberately identical to a genuinely-missing election: a draft
      // election's existence is not public information.
      throw new NotFoundException('Election not found.');
    }

    const { resultVisibility, ...rest } = election;

    return {
      ...rest,
      resultsAvailable: areResultsPublic(election.status, resultVisibility),
    };
  }
}
