import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { PUBLIC_ELECTION_STATUSES } from '../public-visibility';
import { QueryPublicElectionDto } from '../dto';

/** Fields safe to expose without authentication. */
const PUBLIC_ELECTION_SELECT = {
  id: true,
  title: true,
  description: true,
  electionCode: true,
  electionType: true,
  status: true,
  startDate: true,
  endDate: true,
  nominationStart: true,
  nominationEnd: true,
  campaignStart: true,
  campaignEnd: true,
  resultDate: true,
  banner: true,
  logo: true,
  publishedAt: true,
} satisfies Prisma.ElectionSelect;

@Injectable()
export class ListPublicElectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: QueryPublicElectionDto) {
    const where: Prisma.ElectionWhereInput = {
      deletedAt: null,
      status: { in: PUBLIC_ELECTION_STATUSES },
    };

    if (query.electionType) {
      where.electionType = query.electionType;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.election.findMany({
        where,
        select: PUBLIC_ELECTION_SELECT,
        orderBy: { startDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.election.count({ where }),
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

export { PUBLIC_ELECTION_SELECT };
