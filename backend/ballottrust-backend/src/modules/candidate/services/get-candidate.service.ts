import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Role } from '@prisma/client';

import { CandidateRepository } from '../repository/candidate.repository';

import { CandidateProfileCompletenessService } from './candidate-profile-completeness.service';
import { CandidateDocumentCompletenessService } from '../documents/services/candidate-document-completeness.service';

@Injectable()
export class GetCandidateService {
  constructor(
    private readonly candidateRepository:
      CandidateRepository,

    private readonly candidateProfileCompletenessService:
      CandidateProfileCompletenessService,

    private readonly candidateDocumentCompletenessService:
      CandidateDocumentCompletenessService,
  ) {}

  async execute(
    candidateId: string,
    userId: string,
    role: Role,
  ) {
    // ======================================================
    // 1. Find Candidate
    // ======================================================

    const candidate =
      await this.candidateRepository
        .findByIdWithDetails(
          candidateId,
        );

    if (!candidate) {
      throw new NotFoundException(
        'Candidate not found.',
      );
    }

    // ======================================================
    // 2. Administrative Access
    // ======================================================

    const isAdministrator =
      role === Role.SUPER_ADMIN ||
      role ===
        Role.ELECTION_COMMISSIONER;

    // ======================================================
    // 3. Candidate Ownership Access
    // ======================================================

    const isOwner =
      candidate.userId === userId;

    if (
      !isAdministrator &&
      !isOwner
    ) {
      throw new ForbiddenException(
        'You are not authorized to view this candidate record.',
      );
    }

    // ======================================================
    // 4. Calculate Profile Completeness
    // ======================================================

    const profileCompleteness =
      this.candidateProfileCompletenessService
        .calculate(
          candidate,
        );

    const documentCompleteness =
  await this.candidateDocumentCompletenessService
    .calculate(
      candidate.id,
    );

    // ======================================================
    // 5. Return Candidate + Completeness
    // ======================================================
    return {
      ...candidate,

      profileCompleteness,

      documentCompleteness,
    };
  }
}