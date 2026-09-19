import { Injectable } from '@nestjs/common';
import { Prisma, VoterRegistrationStatus } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

/** Columns exposed for a voter on the roll. Never selects credentials. */
const VOTER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  registrationNumber: true,
  department: true,
  course: true,
  year: true,
  semester: true,
  status: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

export const VOTER_REGISTRATION_INCLUDE = {
  user: { select: VOTER_SELECT },
  election: { select: { id: true, title: true, electionCode: true } },
} satisfies Prisma.VoterRegistrationInclude;

@Injectable()
export class VoterRegistrationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.VoterRegistrationCreateInput) {
    return this.prisma.voterRegistration.create({
      data,
      include: VOTER_REGISTRATION_INCLUDE,
    });
  }

  async findById(id: string) {
    return this.prisma.voterRegistration.findFirst({
      where: { id, deletedAt: null },
      include: VOTER_REGISTRATION_INCLUDE,
    });
  }

  async findByUserAndElection(userId: string, electionId: string) {
    return this.prisma.voterRegistration.findFirst({
      where: { userId, electionId, deletedAt: null },
      include: VOTER_REGISTRATION_INCLUDE,
    });
  }

  /**
   * Includes soft-deleted rows on purpose: the (userId, electionId)
   * unique constraint still covers them, so a re-registration must
   * revive the existing row rather than insert a colliding one.
   */
  async findByUserAndElectionIncludingDeleted(
    userId: string,
    electionId: string,
  ) {
    return this.prisma.voterRegistration.findUnique({
      where: { userId_electionId: { userId, electionId } },
    });
  }

  async findMany(
    where: Prisma.VoterRegistrationWhereInput,
    skip = 0,
    take = 25,
  ) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.voterRegistration.findMany({
        where: { ...where, deletedAt: null },
        include: VOTER_REGISTRATION_INCLUDE,
        orderBy: { registeredAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.voterRegistration.count({
        where: { ...where, deletedAt: null },
      }),
    ]);

    return { items, total };
  }

  /** Unpaginated — used by the CSV export only. */
  async findAllForExport(where: Prisma.VoterRegistrationWhereInput) {
    return this.prisma.voterRegistration.findMany({
      where: { ...where, deletedAt: null },
      include: VOTER_REGISTRATION_INCLUDE,
      orderBy: { registeredAt: 'asc' },
    });
  }

  async update(id: string, data: Prisma.VoterRegistrationUpdateInput) {
    return this.prisma.voterRegistration.update({
      where: { id },
      data,
      include: VOTER_REGISTRATION_INCLUDE,
    });
  }

  async softDelete(id: string) {
    return this.prisma.voterRegistration.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countByStatus(electionId: string) {
    const grouped = await this.prisma.voterRegistration.groupBy({
      by: ['status'],
      where: { electionId, deletedAt: null },
      _count: { _all: true },
    });

    const counts: Record<VoterRegistrationStatus, number> = {
      PENDING: 0,
      VERIFIED: 0,
      APPROVED: 0,
      REJECTED: 0,
    };

    for (const row of grouped) {
      counts[row.status] = row._count._all;
    }

    return counts;
  }
}
