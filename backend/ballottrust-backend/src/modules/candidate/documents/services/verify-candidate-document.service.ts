import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  CandidateDocumentStatus,
} from '@prisma/client';

import {
  CandidateDocumentRepository,
} from '../candidate-document.repository';

import {
  CandidateDocumentStatusValidator,
} from '../validators/candidate-document-status.validator';

@Injectable()
export class VerifyCandidateDocumentService {
  constructor(
    private readonly candidateDocumentRepository:
      CandidateDocumentRepository,

    private readonly candidateDocumentStatusValidator:
      CandidateDocumentStatusValidator,
  ) {}

  async execute(
    candidateId: string,
    documentId: string,
    reviewerId: string,
  ) {
    // ==========================================
    // 1. Find Document
    // ==========================================

    const document =
      await this.candidateDocumentRepository.findById(
        documentId,
      );

    if (!document) {
      throw new NotFoundException(
        'Candidate document not found.',
      );
    }

    // ==========================================
    // 2. Validate Candidate Relationship
    // ==========================================

    if (
      document.candidateId !==
      candidateId
    ) {
      throw new NotFoundException(
        'Candidate document not found.',
      );
    }

    // ==========================================
    // 3. Prevent Review Of Replaced Document
    // ==========================================

    if (document.replacedAt !== null) {
      throw new BadRequestException(
        'Replaced candidate documents cannot be verified.',
      );
    }

    // ==========================================
    // 4. Prevent Review Of Deleted Document
    // ==========================================

    if (document.deletedAt !== null) {
      throw new BadRequestException(
        'Deleted candidate documents cannot be verified.',
      );
    }

    // ==========================================
    // 5. Validate Status Transition
    // ==========================================

    this.candidateDocumentStatusValidator
      .validateTransition(
        document.status,
        CandidateDocumentStatus.VERIFIED,
      );

    // ==========================================
    // 6. Verify Document
    // ==========================================

    return this.candidateDocumentRepository
      .verifyDocument(
        document.id,
        reviewerId,
      );
  }
}