import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  Prisma,
  Election,
  ElectionStatus,
  CandidateStatus,
} from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { QueryElectionDto } from '../dto/query-election.dto';

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
  async findByElectionCode(electionCode: string): Promise<Election | null> {
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
  async count(where?: Prisma.ElectionWhereInput): Promise<number> {
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
  async electionCodeExists(electionCode: string): Promise<boolean> {
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

  async findAll(query: QueryElectionDto) {
    const { search, status, type, page, limit } = query;

    const where: Prisma.ElectionWhereInput = {
      deletedAt: null,

      ...(status && {
        status,
      }),

      ...(type && {
        electionType: type,
      }),

      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },

          {
            electionCode: {
              contains: search,
              mode: 'insensitive',
            },
          },

          {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.election.findMany({
        where,

        skip: (page - 1) * limit,

        take: limit,

        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.election.count({
        where,
      }),
    ]);

    return {
      data,

      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),
    };
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
    const election = await this.findById(id);

    if (!election || election.deletedAt) {
      throw new NotFoundException('Election not found.');
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

  async approveElection(id: string, approvedById: string) {
    return this.prisma.election.update({
      where: {
        id,
      },
      data: {
        status: ElectionStatus.APPROVED,
        approvedById,
        approvedAt: new Date(),
      },
    });
  }

  // ======================================================
  // Publish Election
  // ======================================================

  async publishElection(id: string, publishedById: string) {
    return this.prisma.election.update({
      where: {
        id,
      },

      data: {
        status: ElectionStatus.PUBLISHED,

        publishedById,

        publishedAt: new Date(),
      },
    });
  }

  // ======================================================
  // Published Elections Ready For Activation
  // ======================================================

  async findPublishedReadyToActivate() {
    return this.prisma.election.findMany({
      where: {
        status: ElectionStatus.PUBLISHED,

        deletedAt: null,

        startDate: {
          lte: new Date(),
        },
      },
    });
  }

  // ======================================================
  // Activate Election
  // ======================================================

  async activateElection(id: string) {
    return this.prisma.election.update({
      where: {
        id,
      },

      data: {
        status: ElectionStatus.ACTIVE,
      },
    });
  }

  // ======================================================
  // Active Elections Ready To Close
  // ======================================================

  async findActiveReadyToClose() {
    return this.prisma.election.findMany({
      where: {
        status: ElectionStatus.ACTIVE,
        deletedAt: null,
        endDate: {
          lte: new Date(),
        },
      },
    });
  }

  // ======================================================
  // Close Election
  // ======================================================

  async closeElection(id: string) {
    return this.prisma.election.update({
      where: {
        id,
      },
      data: {
        status: ElectionStatus.VOTING_CLOSED,
        closedAt: new Date(),
      },
    });
  }

  // ======================================================
  // Elections Ready To Publish Results
  // ======================================================

  async findReadyToPublishResults() {
    return this.prisma.election.findMany({
      where: {
        status: ElectionStatus.VOTING_CLOSED,
        deletedAt: null,
        autoPublish: true,
      },
    });
  }

  // ======================================================
  // Publish Results
  // ======================================================

  async publishResults(id: string) {
    return this.prisma.election.update({
      where: {
        id,
      },
      data: {
        status: ElectionStatus.RESULT_PUBLISHED,
        resultDate: new Date(),
      },
    });
  }

  async findReadyToArchive() {
    return this.prisma.election.findMany({
      where: {
        status: ElectionStatus.RESULT_PUBLISHED,
        deletedAt: null,
        autoArchive: true,
      },
    });
  }

  async archiveElection(id: string) {
    return this.prisma.election.update({
      where: { id },
      data: {
        status: ElectionStatus.ARCHIVED,
      },
    });
  }

  async publishElectionTransaction(id: string, publishedById: string) {
    return this.prisma.$transaction(async (tx) => {
      const election = await tx.election.update({
        where: {
          id,
        },

        data: {
          status: ElectionStatus.PUBLISHED,

          publishedById,

          publishedAt: new Date(),
        },
      });

      // =====================================
      // TODO
      // Audit Log
      // =====================================

      /*
      await tx.auditLog.create({

        data: {

          ...

        },

      });
      */

      // =====================================
      // TODO
      // Notification
      // =====================================

      /*
      await tx.notification.create({

        ...

      });
      */

      return election;
    });
  }

  // ==========================================
  // Get Ballot Readiness
  // ==========================================

  async getBallotReadiness(electionId: string) {
    const [totalApprovedCandidates, readyCandidates] =
      await this.prisma.$transaction([
        this.prisma.candidate.count({
          where: {
            electionId,

            status: CandidateStatus.APPROVED,

            deletedAt: null,
          },
        }),

        this.prisma.candidate.count({
          where: {
            electionId,

            status: CandidateStatus.APPROVED,

            candidateNumber: {
              not: null,
            },

            ballotOrder: {
              not: null,
            },

            deletedAt: null,
          },
        }),
      ]);

    return {
      totalApprovedCandidates,
      readyCandidates,
    };
  }
}
