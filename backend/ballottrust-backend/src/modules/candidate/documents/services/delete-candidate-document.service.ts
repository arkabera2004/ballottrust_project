import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CandidateDocumentStatus, CandidateStatus } from '@prisma/client';

import { CandidateDocumentRepository } from '../candidate-document.repository';

@Injectable()
export class DeleteCandidateDocumentService {
  constructor(
    private readonly candidateDocumentRepository: CandidateDocumentRepository,
  ) {}

  async execute(candidateId: string, documentId: string, userId: string) {
    // ==========================================
    // 1. Find Document
    // ==========================================

    const document =
      await this.candidateDocumentRepository.findById(documentId);

    if (!document) {
      throw new NotFoundException('Candidate document not found.');
    }

    // ==========================================
    // 2. Validate Candidate Relationship
    // ==========================================

    if (document.candidateId !== candidateId) {
      throw new NotFoundException('Candidate document not found.');
    }

    // ==========================================
    // 3. Validate Ownership
    // ==========================================

    if (document.candidate.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own candidate documents.',
      );
    }

    // ==========================================
    // 4. Prevent Historical Document Deletion
    // ==========================================

    if (document.replacedAt !== null) {
      throw new BadRequestException(
        'Replaced candidate documents cannot be deleted.',
      );
    }

    // ==========================================
    // 5. Only Pending Documents Can Be Deleted
    // ==========================================

    if (document.status !== CandidateDocumentStatus.PENDING) {
      throw new BadRequestException(
        'Only pending candidate documents can be deleted.',
      );
    }

    // ==========================================
    // 6. Validate Candidate Lifecycle
    // ==========================================

    const editableStatuses: CandidateStatus[] = [
      CandidateStatus.PENDING,
      CandidateStatus.VERIFIED,
    ];

    if (!editableStatuses.includes(document.candidate.status)) {
      throw new BadRequestException(
        'Candidate documents cannot be deleted in the current candidate status.',
      );
    }

    // ==========================================
    // 7. Soft Delete
    // ==========================================

    const deletedDocument = await this.candidateDocumentRepository.softDelete(
      document.id,
    );

    // ==========================================
    // 8. Return Safe Result
    // ==========================================

    return {
      id: deletedDocument.id,
      candidateId: deletedDocument.candidateId,
      documentType: deletedDocument.documentType,
      deletedAt: deletedDocument.deletedAt,
      message: 'Candidate document deleted successfully.',
    };
  }
}
