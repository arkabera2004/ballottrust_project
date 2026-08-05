import {
  Injectable,
} from '@nestjs/common';

import {
  CandidateDocument,
  CandidateDocumentStatus,
  CandidateDocumentType,
  Prisma,
} from '@prisma/client';

import {
  PrismaService,
} from '../../../prisma/prisma.service';

@Injectable()
export class CandidateDocumentRepository {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  // ==========================================
  // Find Active Document By Type
  // ==========================================

  async findActiveByType(
    candidateId: string,
    documentType: CandidateDocumentType,
  ): Promise<CandidateDocument | null> {
    return this.prisma.candidateDocument.findFirst({
      where: {
        candidateId,
        documentType,
        deletedAt: null,
        replacedAt: null,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ==========================================
  // Create Candidate Document
  // ==========================================

  async create(
    data: Prisma.CandidateDocumentCreateInput,
  ): Promise<CandidateDocument> {
    return this.prisma.candidateDocument.create({
      data,
    });
  }

  // ==========================================
// Find Documents By Candidate
// ==========================================

async findByCandidateId(
  candidateId: string,
) {
  return this.prisma.candidateDocument.findMany({
    where: {
      candidateId,
      deletedAt: null,
    },

    orderBy: {
      createdAt: 'desc',
    },

    include: {
      verifiedBy: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },

      rejectedBy: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
  });
}

// ==========================================
// Find Document By ID
// ==========================================

async findById(
  documentId: string,
) {
  return this.prisma.candidateDocument.findFirst({
    where: {
      id: documentId,
      deletedAt: null,
    },

    include: {
      candidate: {
        select: {
          id: true,
          userId: true,
          electionId: true,
          status: true,
        },
      },

      verifiedBy: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },

      rejectedBy: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
  });
}

// ==========================================
// Replace Candidate Document
// ==========================================

async replaceDocument(
  existingDocumentId: string,
  newDocumentData:
    Prisma.CandidateDocumentCreateInput,
): Promise<CandidateDocument> {
  return this.prisma.$transaction(
    async (tx) => {
      const replacedAt = new Date();

      // ======================================
      // Mark Existing Document As Replaced
      // ======================================

      await tx.candidateDocument.update({
        where: {
          id: existingDocumentId,
        },

        data: {
          replacedAt,
        },
      });

      // ======================================
      // Create Replacement Document
      // ======================================

      return tx.candidateDocument.create({
        data: newDocumentData,
      });
    },
  );
}

// ==========================================
// Verify Candidate Document
// ==========================================

async verifyDocument(
  documentId: string,
  verifiedById: string,
): Promise<CandidateDocument> {
  return this.prisma.candidateDocument.update({
    where: {
      id: documentId,
    },

    data: {
      status: CandidateDocumentStatus.VERIFIED,

      verifiedBy: {
        connect: {
          id: verifiedById,
        },
      },

      verifiedAt: new Date(),

      // Ensure rejection metadata is cleared
      rejectedBy: {
        disconnect: true,
      },

      rejectedAt: null,
      rejectionReason: null,
    },
  });
}

// ==========================================
// Reject Candidate Document
// ==========================================

async rejectDocument(
  documentId: string,
  rejectedById: string,
  reason: string,
): Promise<CandidateDocument> {
  return this.prisma.candidateDocument.update({
    where: {
      id: documentId,
    },

    data: {
      status: CandidateDocumentStatus.REJECTED,

      rejectedBy: {
        connect: {
          id: rejectedById,
        },
      },

      rejectedAt: new Date(),

      rejectionReason: reason,

      // Ensure verification metadata is cleared
      verifiedBy: {
        disconnect: true,
      },

      verifiedAt: null,
    },
  });
}

// ==========================================
// Soft Delete Candidate Document
// ==========================================

async softDelete(
  documentId: string,
): Promise<CandidateDocument> {
  return this.prisma.candidateDocument.update({
    where: {
      id: documentId,
    },

    data: {
      deletedAt: new Date(),
    },
  });
}

// ==========================================
// Find Active Documents By Candidate
// ==========================================

async findActiveByCandidateId(
  candidateId: string,
): Promise<CandidateDocument[]> {
  return this.prisma.candidateDocument.findMany({
    where: {
      candidateId,
      deletedAt: null,
      replacedAt: null,
    },

    orderBy: {
      createdAt: 'desc',
    },
  });
}
}