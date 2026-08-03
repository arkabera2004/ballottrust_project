import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CandidateStatus } from '@prisma/client';

import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateStatusValidator } from '../validators/candidate-status.validator';

@Injectable()
export class WithdrawCandidateService {
  constructor(
    private readonly candidateRepository:
      CandidateRepository,

    private readonly candidateStatusValidator:
      CandidateStatusValidator,
  ) {}

  async execute(
    candidateId: string,
    userId: string,
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
    // Ownership Validation
    // ======================================================

    if (candidate.userId !== userId) {
      throw new ForbiddenException(
        'You can only withdraw your own candidacy.',
      );
    }

    // ======================================================
    // Validate Lifecycle Transition
    // ======================================================

    this.candidateStatusValidator
      .validateTransition(
        candidate.status,
        CandidateStatus.WITHDRAWN,
      );

    return this.candidateRepository.update(
      candidateId,
      {
        status:
          CandidateStatus.WITHDRAWN,

        withdrawnAt:
          new Date(),

        withdrawalReason:
          reason.trim(),
      },
    );
  }
}