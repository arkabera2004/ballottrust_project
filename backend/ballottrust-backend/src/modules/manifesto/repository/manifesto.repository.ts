import { Injectable } from '@nestjs/common';
import { ManifestoStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export const MANIFESTO_INCLUDE = {
  candidate: {
    select: {
      id: true,
      electionId: true,
      userId: true,
      status: true,
    },
  },
} satisfies Prisma.CandidateManifestoInclude;

@Injectable()
export class ManifestoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CandidateManifestoCreateInput) {
    return this.prisma.candidateManifesto.create({
      data,
      include: MANIFESTO_INCLUDE,
    });
  }

  async findById(id: string) {
    return this.prisma.candidateManifesto.findFirst({
      where: { id, deletedAt: null },
      include: MANIFESTO_INCLUDE,
    });
  }

  /** Highest version for a candidate, regardless of status. */
  async findCurrent(candidateId: string) {
    return this.prisma.candidateManifesto.findFirst({
      where: { candidateId, deletedAt: null },
      orderBy: { version: 'desc' },
      include: MANIFESTO_INCLUDE,
    });
  }

  /**
   * Highest APPROVED version — the only manifesto the public portal may
   * serve (docs/07 §7: "Only approved manifestos are public").
   */
  async findPublished(candidateId: string) {
    return this.prisma.candidateManifesto.findFirst({
      where: {
        candidateId,
        deletedAt: null,
        status: ManifestoStatus.APPROVED,
      },
      orderBy: { version: 'desc' },
    });
  }

  /** Full version history, newest first. */
  async findVersions(candidateId: string) {
    return this.prisma.candidateManifesto.findMany({
      where: { candidateId, deletedAt: null },
      orderBy: { version: 'desc' },
    });
  }

  /**
   * Next version number for a candidate. Counts soft-deleted rows too:
   * versions are an append-only history, so a deleted version must not
   * have its number reused.
   */
  async nextVersion(candidateId: string) {
    const latest = await this.prisma.candidateManifesto.findFirst({
      where: { candidateId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    return (latest?.version ?? 0) + 1;
  }

  async findMany(
    where: Prisma.CandidateManifestoWhereInput,
    skip = 0,
    take = 25,
  ) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.candidateManifesto.findMany({
        where: { ...where, deletedAt: null },
        include: MANIFESTO_INCLUDE,
        orderBy: [{ candidateId: 'asc' }, { version: 'desc' }],
        skip,
        take,
      }),
      this.prisma.candidateManifesto.count({
        where: { ...where, deletedAt: null },
      }),
    ]);

    return { items, total };
  }

  async update(id: string, data: Prisma.CandidateManifestoUpdateInput) {
    return this.prisma.candidateManifesto.update({
      where: { id },
      data,
      include: MANIFESTO_INCLUDE,
    });
  }

  async softDelete(id: string) {
    return this.prisma.candidateManifesto.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
