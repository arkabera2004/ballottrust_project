import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { QueryCandidateDto } from '../dto/query-candidate.dto';

import { CandidateRepository } from '../repository/candidate.repository';

@Injectable()
export class ListCandidatesService {
  constructor(
    private readonly candidateRepository:
      CandidateRepository,
  ) {}

  async execute(
    query: QueryCandidateDto,
  ) {
    const {
      search,
      status,
      type,
      electionId,
      partyId,
      page,
      limit,
    } = query;

    const where: Prisma.CandidateWhereInput = {
      ...(status && {
        status,
      }),

      ...(type && {
        candidateType: type,
      }),

      ...(electionId && {
        electionId,
      }),

      ...(partyId && {
        partyId,
      }),

      ...(search && {
        OR: [
          {
            user: {
              fullName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },

          {
            user: {
              registrationNumber: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },

          {
            position: {
              contains: search,
              mode: 'insensitive',
            },
          },

          {
            party: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ],
      }),
    };

    return this.candidateRepository
      .findAllPaginated(
        where,
        page,
        limit,
      );
  }
}