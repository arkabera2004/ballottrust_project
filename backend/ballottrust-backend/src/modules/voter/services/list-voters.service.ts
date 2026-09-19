import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { VoterRegistrationRepository } from '../repository/voter-registration.repository';
import { QueryVoterDto } from '../dto';

@Injectable()
export class ListVotersService {
  constructor(private readonly repository: VoterRegistrationRepository) {}

  async execute(query: QueryVoterDto) {
    const where = buildVoterRegistrationWhere(query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const { items, total } = await this.repository.findMany(
      where,
      (page - 1) * limit,
      limit,
    );

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

/** Shared by the list and export services so both filter identically. */
export function buildVoterRegistrationWhere(
  query: QueryVoterDto,
): Prisma.VoterRegistrationWhereInput {
  const where: Prisma.VoterRegistrationWhereInput = {};

  if (query.electionId) {
    where.electionId = query.electionId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.source) {
    where.source = query.source;
  }

  const userFilter: Prisma.UserWhereInput = {};

  if (query.department) {
    userFilter.department = query.department;
  }

  if (query.search) {
    userFilter.OR = [
      { fullName: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { registrationNumber: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (Object.keys(userFilter).length > 0) {
    where.user = userFilter;
  }

  return where;
}
