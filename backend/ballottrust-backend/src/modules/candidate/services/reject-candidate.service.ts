import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CandidateStatus } from '@prisma/client';

import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateStatusValidator } from '../validators/candidate-status.validator';

@Injectable()
export class RejectCandidateService {
  constructor(
    private readonly candidateRepository:
      CandidateRepository,

    private readonly candidateStatusValidator:
      CandidateStatusValidator,
  ) {}

  async execute(
    candidateId: string,
    reason: string,
  ) {
    const candidate =
      await this.candidateRepository.findById(
        candidateId,
      );

    if (!candidate) {
      throw new NotFoundException(
        'Candidate not found.',
      );
    }

    // ======================================================
    // Validate Lifecycle Transition
    // ======================================================

    this.candidateStatusValidator
      .validateTransition(
        candidate.status,
        CandidateStatus.REJECTED,
      );

    return this.candidateRepository.update(
      candidateId,
      {
        status:
          CandidateStatus.REJECTED,

        rejectionReason:
          reason.trim(),

        rejectedAt:
          new Date(),
      },
    );
  }
}