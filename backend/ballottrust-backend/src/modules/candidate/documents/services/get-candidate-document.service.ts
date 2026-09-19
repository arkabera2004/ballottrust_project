import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Role } from '@prisma/client';

import { CandidateDocumentRepository } from '../candidate-document.repository';

@Injectable()
export class GetCandidateDocumentService {
  constructor(
    private readonly candidateDocumentRepository: CandidateDocumentRepository,
  ) {}

  async execute(
    candidateId: string,
    documentId: string,
    userId: string,
    role: Role,
  ) {
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
    // 2. Determine Access
    // ==========================================

    const isAdministrator =
      role === Role.SUPER_ADMIN || role === Role.ELECTION_COMMISSIONER;

    const isOwner = document.candidate.userId === userId;

    // ==========================================
    // 3. Enforce Access
    // ==========================================

    if (!isAdministrator && !isOwner) {
      throw new ForbiddenException(
        'You are not authorized to view this candidate document.',
      );
    }

    // ==========================================
    // 4. Return Document
    // ==========================================

    return document;
  }
}
