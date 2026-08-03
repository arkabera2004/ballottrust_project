import { Injectable } from '@nestjs/common';

import {
  BallotOrderMethod,
  Candidate,
  CandidateStatus,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CandidateRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================
  // Create Candidate
  // ==========================================

  async create(
    data: Prisma.CandidateUncheckedCreateInput,
  ): Promise<Candidate> {
    return this.prisma.candidate.create({
      data,
    });
  }

  // ==========================================
  // Find Candidate By ID
  // ==========================================

  async findById(
    id: string,
  ): Promise<Candidate | null> {
    return this.prisma.candidate.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  // ==========================================
  // Find Candidate With Relations
  // ==========================================

  async findByIdWithDetails(id: string) {
    return this.prisma.candidate.findFirst({
      where: {
        id,
        deletedAt: null,
      },

      include: {
        user: true,
        election: true,
        party: true,
        verifiedBy: true,
        approvedBy: true,
      },
    });
  }

  // ==========================================
  // Find Candidate For User + Election
  // ==========================================

  async findByUserAndElection(
    userId: string,
    electionId: string,
  ): Promise<Candidate | null> {
    return this.prisma.candidate.findUnique({
      where: {
        userId_electionId: {
          userId,
          electionId,
        },
      },
    });
  }

  // ==========================================
  // List Candidates
  // ==========================================

  async findMany(
    where: Prisma.CandidateWhereInput = {},
  ) {
    return this.prisma.candidate.findMany({
      where: {
        ...where,
        deletedAt: null,
      },

      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            registrationNumber: true,
            department: true,
            profilePhoto: true,
          },
        },

        election: {
          select: {
            id: true,
            title: true,
            electionCode: true,
            status: true,
          },
        },

        party: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ==========================================
  // Count Candidates
  // ==========================================

  async count(
    where: Prisma.CandidateWhereInput = {},
  ): Promise<number> {
    return this.prisma.candidate.count({
      where: {
        ...where,
        deletedAt: null,
      },
    });
  }

  // ==========================================
  // Update Candidate
  // ==========================================

  async update(
    id: string,
    data: Prisma.CandidateUpdateInput,
  ): Promise<Candidate> {
    return this.prisma.candidate.update({
      where: {
        id,
      },
      data,
    });
  }

  // ==========================================
  // Update Status
  // ==========================================

  async updateStatus(
    id: string,
    status: CandidateStatus,
  ): Promise<Candidate> {
    return this.prisma.candidate.update({
      where: {
        id,
      },

      data: {
        status,
      },
    });
  }

  // ==========================================
  // Candidate Number Exists
  // ==========================================

  async candidateNumberExists(
    electionId: string,
    candidateNumber: number,
  ): Promise<boolean> {
    const candidate =
      await this.prisma.candidate.findFirst({
        where: {
          electionId,
          candidateNumber,
          deletedAt: null,
        },

        select: {
          id: true,
        },
      });

    return !!candidate;
  }

  // ==========================================
// Get Highest Candidate Number
// ==========================================

async getHighestCandidateNumber(
  electionId: string,
): Promise<number> {
  const candidate =
    await this.prisma.candidate.findFirst({
      where: {
        electionId,

        candidateNumber: {
          not: null,
        },
      },

      orderBy: {
        candidateNumber: 'desc',
      },

      select: {
        candidateNumber: true,
      },
    });

  return candidate?.candidateNumber ?? 0;
}

// ==========================================
// Find Eligible Candidates For Ballot
// ==========================================

async findEligibleForBallot(
  electionId: string,
) {
  return this.prisma.candidate.findMany({
    where: {
      electionId,

      status:
        CandidateStatus.APPROVED,

      candidateNumber: {
        not: null,
      },

      deletedAt: null,
    },

    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },

      party: {
        select: {
          id: true,
          name: true,
          abbreviation: true,
        },
      },
    },
  });
}

// ==========================================
// Update Ballot Orders
// ==========================================

async updateBallotOrders(
  assignments: {
    candidateId: string;
    ballotOrder: number;
  }[],
) {
  return this.prisma.$transaction(
    assignments.map(
      (assignment) =>
        this.prisma.candidate.update({
          where: {
            id: assignment.candidateId,
          },

          data: {
            ballotOrder:
              assignment.ballotOrder,
          } as any,
        } as any),
    ),
  );
}

// ==========================================
// Clear Ballot Orders
// ==========================================

async clearBallotOrders(
  electionId: string,
) {
  return this.prisma.candidate.updateMany({
    where: {
      electionId,
      ballotOrder: {
        not: null,
      },
    } as any,

    data: {
      ballotOrder: null,
    } as any,
  } as any);
}

// ==========================================
// Replace Ballot Orders Atomically
// ==========================================

// ==========================================
// Replace Ballot Orders Atomically
// ==========================================

async replaceBallotOrders(
  electionId: string,
  method: BallotOrderMethod,
  assignments: {
    candidateId: string;
    ballotOrder: number;
  }[],
) {
  return this.prisma.$transaction(
    async (tx) => {
      // ==========================================
      // Clear Existing Ballot Orders
      // ==========================================

      await tx.candidate.updateMany({
        where: {
          electionId,

          ballotOrder: {
            not: null,
          },
        },

        data: {
          ballotOrder: null,
        },
      });

      // ==========================================
      // Assign New Ballot Orders
      // ==========================================

      const updatedCandidates: Candidate[] = [];

      for (
        const assignment of assignments
      ) {
        const candidate =
          await tx.candidate.update({
            where: {
              id:
                assignment.candidateId,
            },

            data: {
              ballotOrder:
                assignment.ballotOrder,
            },
          });

        updatedCandidates.push(
          candidate,
        );
      }

      // ==========================================
      // Persist Election Ordering Method
      // ==========================================

      await tx.election.update({
        where: {
          id: electionId,
        },

        data: {
          ballotOrderMethod:
            method,
        },
      });

      return updatedCandidates;
    },
  );
}

  // ==========================================
  // Soft Delete
  // ==========================================

  async softDelete(
    id: string,
  ): Promise<Candidate> {
    return this.prisma.candidate.update({
      where: {
        id,
      },

      data: {
        deletedAt: new Date(),
      },
    });
  }

  async findAllPaginated(
  where: Prisma.CandidateWhereInput,
  page: number,
  limit: number,
) {
  const [data, total] =
    await this.prisma.$transaction([
      this.prisma.candidate.findMany({
        where: {
          ...where,
          deletedAt: null,
        },

        skip:
          (page - 1) * limit,

        take:
          limit,

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              registrationNumber: true,
              department: true,
              profilePhoto: true,
            },
          },

          election: {
            select: {
              id: true,
              title: true,
              electionCode: true,
              status: true,
            },
          },

          party: {
            select: {
              id: true,
              name: true,
              abbreviation: true,
              symbol: true,
              logo: true,
            },
          },
        },
      }),

      this.prisma.candidate.count({
        where: {
          ...where,
          deletedAt: null,
        },
      }),
    ]);

  return {
    data,
    total,
    page,
    limit,

    totalPages:
      Math.ceil(
        total / limit,
      ),
  };
}
}