import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, Election, ElectionStatus } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ElectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create Election
   */
  async create(data: Prisma.ElectionCreateInput): Promise<Election> {
    return this.prisma.election.create({
      data,
    });
  }

  /**
   * Find Election by ID
   */
  async findById(id: string): Promise<Election | null> {
    return this.prisma.election.findUnique({
      where: { id },
    });
  }

  /**
   * Find Election by Election Code
   */
  async findByElectionCode(
    electionCode: string,
  ): Promise<Election | null> {
    return this.prisma.election.findUnique({
      where: {
        electionCode,
      },
    });
  }

  /**
   * Get All Elections
   */
  async findMany(args?: Prisma.ElectionFindManyArgs): Promise<Election[]> {
    return this.prisma.election.findMany(args);
  }

  /**
   * Update Election
   */
  async update(
    id: string,
    data: Prisma.ElectionUpdateInput,
  ): Promise<Election> {
    return this.prisma.election.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete Election
   */
  async delete(id: string): Promise<Election> {
    return this.prisma.election.delete({
      where: { id },
    });
  }

  /**
   * Count Elections
   */
  async count(
    where?: Prisma.ElectionWhereInput,
  ): Promise<number> {
    return this.prisma.election.count({
      where,
    });
  }

  /**
   * Check Election Exists
   */
  async exists(id: string): Promise<boolean> {
    const election = await this.prisma.election.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    return !!election;
  }

  /**
 * Find Election by Title
 */
async findByTitle(title: string): Promise<Election | null> {
  return this.prisma.election.findFirst({
    where: {
      title,
    },
  });
}

/**
 * Check Election Code Exists
 */
async electionCodeExists(
  electionCode: string,
): Promise<boolean> {
  const election = await this.prisma.election.findUnique({
    where: {
      electionCode,
    },
    select: {
      id: true,
    },
  });

  return !!election;
}

async findAll(): Promise<Election[]> {
  return this.prisma.election.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// ======================================================
// Soft Delete
// ======================================================

async softDelete(id: string) {
  return this.prisma.election.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  });
}

// ======================================================
// Find By ID Or Throw
// ======================================================

async findByIdOrThrow(id: string) {
  const election =
    await this.findById(id);

  if (!election || election.deletedAt) {
    throw new NotFoundException(
      'Election not found.',
    );
  }

  return election;
}

// ======================================================
// Submit For Approval
// ======================================================

// ======================================================
// Submit For Approval
// ======================================================

async submitForApproval(id: string) {
  return this.prisma.election.update({
    where: {
      id,
    },
    data: {
      status: 'PENDING_APPROVAL',
    },
  });
}

// ======================================================
// Approve Election
// ======================================================

async approveElection(
  id: string,
  approvedById: string,
) {
  return this.prisma.election.update({
    where: {
      id,
    },
    data: {
      status: ElectionStatus.APPROVED,
      approvedById,
    },
  });
}

}
