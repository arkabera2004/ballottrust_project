import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { ManifestoRepository } from '../repository/manifesto.repository';
import { QueryManifestoDto } from '../dto';

@Injectable()
export class ListManifestosService {
  constructor(private readonly repository: ManifestoRepository) {}

  async execute(query: QueryManifestoDto) {
    const where: Prisma.CandidateManifestoWhereInput = {};

    if (query.candidateId) {
      where.candidateId = query.candidateId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.electionId) {
      where.candidate = { electionId: query.electionId };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { summary: { contains: query.search, mode: 'insensitive' } },
      ];
    }

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
