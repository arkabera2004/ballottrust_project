import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Role,
} from '@prisma/client';

import {
  CandidateRepository,
} from '../../repository/candidate.repository';

import {
  CandidateDocumentRepository,
} from '../candidate-document.repository';

@Injectable()
export class ListCandidateDocumentsService {
  constructor(
    private readonly candidateRepository:
      CandidateRepository,

    private readonly candidateDocumentRepository:
      CandidateDocumentRepository,
  ) {}

  async execute(
    candidateId: string,
    userId: string,
    role: Role,
  ) {
    // ==========================================
    // 1. Find Candidate
    // ==========================================

    const candidate =
      await this.candidateRepository.findById(
        candidateId,
      );

    if (!candidate) {
      throw new NotFoundException(
        'Candidate not found.',
      );
    }

    // ==========================================
    // 2. Determine Access
    // ==========================================

    const isAdministrator =
      role === Role.SUPER_ADMIN ||
      role ===
        Role.ELECTION_COMMISSIONER;

    const isOwner =
      candidate.userId === userId;

    // ==========================================
    // 3. Enforce Access
    // ==========================================

    if (
      !isAdministrator &&
      !isOwner
    ) {
      throw new ForbiddenException(
        'You are not authorized to view these candidate documents.',
      );
    }

    // ==========================================
    // 4. Retrieve Documents
    // ==========================================

    return this.candidateDocumentRepository
      .findByCandidateId(
        candidateId,
      );
  }
}
