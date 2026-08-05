import {
  Injectable,
} from '@nestjs/common';

import {
  CandidateDocumentStatus,
  CandidateDocumentType,
} from '@prisma/client';

import {
  CandidateDocumentRepository,
} from '../candidate-document.repository';

import {
  REQUIRED_CANDIDATE_DOCUMENTS,
} from '../candidate-document.policy';

// ==========================================
// Document State
// ==========================================

export interface CandidateRequiredDocumentState {
  documentType: CandidateDocumentType;

  uploaded: boolean;

  verified: boolean;

  status:
    CandidateDocumentStatus |
    'MISSING';

  documentId: string | null;
}

// ==========================================
// Completeness Result
// ==========================================

export interface CandidateDocumentCompletenessResult {
  complete: boolean;

  documentationReady: boolean;

  uploadCompletionPercentage: number;

  verificationCompletionPercentage: number;

  requiredDocuments: number;

  uploadedDocuments: number;

  verifiedDocuments: number;

  missingDocuments:
    CandidateDocumentType[];

  pendingDocuments:
    CandidateDocumentType[];

  rejectedDocuments:
    CandidateDocumentType[];

  documents:
    CandidateRequiredDocumentState[];
}

@Injectable()
export class CandidateDocumentCompletenessService {
  constructor(
    private readonly candidateDocumentRepository:
      CandidateDocumentRepository,
  ) {}

  async calculate(
    candidateId: string,
  ): Promise<CandidateDocumentCompletenessResult> {

    // ========================================
    // 1. Load Active Documents
    // ========================================

    const activeDocuments =
      await this.candidateDocumentRepository
        .findActiveByCandidateId(
          candidateId,
        );

    // ========================================
    // 2. Build Required Document State
    // ========================================

    const documents:
      CandidateRequiredDocumentState[] =
      REQUIRED_CANDIDATE_DOCUMENTS.map(
        (documentType) => {

          const document =
            activeDocuments.find(
              (item) =>
                item.documentType ===
                documentType,
            );

          if (!document) {
            return {
              documentType,

              uploaded: false,

              verified: false,

              status: 'MISSING',

              documentId: null,
            };
          }

          return {
            documentType,

            uploaded: true,

            verified:
              document.status ===
              CandidateDocumentStatus.VERIFIED,

            status:
              document.status,

            documentId:
              document.id,
          };
        },
      );

    // ========================================
    // 3. Calculate Counts
    // ========================================

    const requiredDocuments =
      REQUIRED_CANDIDATE_DOCUMENTS.length;

    const uploadedDocuments =
      documents.filter(
        (document) =>
          document.uploaded,
      ).length;

    const verifiedDocuments =
      documents.filter(
        (document) =>
          document.verified,
      ).length;

    // ========================================
    // 4. Categorize Missing / Review States
    // ========================================

    const missingDocuments =
      documents
        .filter(
          (document) =>
            !document.uploaded,
        )
        .map(
          (document) =>
            document.documentType,
        );

    const pendingDocuments =
      documents
        .filter(
          (document) =>
            document.status ===
            CandidateDocumentStatus.PENDING,
        )
        .map(
          (document) =>
            document.documentType,
        );

    const rejectedDocuments =
      documents
        .filter(
          (document) =>
            document.status ===
            CandidateDocumentStatus.REJECTED,
        )
        .map(
          (document) =>
            document.documentType,
        );

    // ========================================
    // 5. Calculate Percentages
    // ========================================

    const uploadCompletionPercentage =
      requiredDocuments === 0
        ? 100
        : Math.round(
            (
              uploadedDocuments /
              requiredDocuments
            ) * 100,
          );

    const verificationCompletionPercentage =
      requiredDocuments === 0
        ? 100
        : Math.round(
            (
              verifiedDocuments /
              requiredDocuments
            ) * 100,
          );

    // ========================================
    // 6. Determine Readiness
    // ========================================

    const complete =
      uploadedDocuments ===
      requiredDocuments;

    const documentationReady =
      verifiedDocuments ===
      requiredDocuments;

    // ========================================
    // 7. Return Result
    // ========================================

    return {
      complete,

      documentationReady,

      uploadCompletionPercentage,

      verificationCompletionPercentage,

      requiredDocuments,

      uploadedDocuments,

      verifiedDocuments,

      missingDocuments,

      pendingDocuments,

      rejectedDocuments,

      documents,
    };
  }
}