import { Injectable } from '@nestjs/common';
import { CandidateStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { PUBLIC_ELECTION_STATUSES } from '../public-visibility';
import { QueryPublicCandidateDto } from '../dto';

/**
 * Only the candidate's public-facing identity is exposed. Notably
 * absent: email, phone, address, documents and verification history.
 */
export const PUBLIC_CANDIDATE_SELECT = {
  id: true,
  candidateNumber: true,
  ballotOrder: true,
  candidateType: true,
  position: true,
  campaignSlogan: true,
  photoUrl: true,
  status: true,
  user: {
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
      department: true,
      course: true,
      year: true,
    },
  },
  party: {
    select: { id: true, name: true, abbreviation: true, symbol: true },
  },
  election: {
    select: { id: true, title: true, electionCode: true, status: true },
  },
} satisfies Prisma.CandidateSelect;

@Injectable()
export class ListPublicCandidatesService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: QueryPublicCandidateDto) {
    const where: Prisma.CandidateWhereInput = {
      deletedAt: null,
      // Only approved candidates on a publicly visible election.
      status: CandidateStatus.APPROVED,
      election: {
        deletedAt: null,
        status: { in: PUBLIC_ELECTION_STATUSES },
      },
    };

    if (query.electionId) {
      where.electionId = query.electionId;
    }

    if (query.search) {
      where.user = {
        fullName: { contains: query.search, mode: 'insensitive' },
      };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.candidate.findMany({
        where,
        select: PUBLIC_CANDIDATE_SELECT,
        orderBy: [{ ballotOrder: 'asc' }, { candidateNumber: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.candidate.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
