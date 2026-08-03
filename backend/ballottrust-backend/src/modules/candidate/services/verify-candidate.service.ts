import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CandidateStatus } from '@prisma/client';

import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateStatusValidator } from '../validators/candidate-status.validator';

@Injectable()
export class VerifyCandidateService {
  constructor(
    private readonly candidateRepository:
      CandidateRepository,

    private readonly candidateStatusValidator:
      CandidateStatusValidator,
  ) {}

  async execute(
    candidateId: string,
    verifiedById: string,
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
        CandidateStatus.VERIFIED,
      );

    return this.candidateRepository.update(
      candidateId,
      {
        status:
          CandidateStatus.VERIFIED,

        verifiedBy: {
          connect: {
            id: verifiedById,
          },
        },

        verifiedAt:
          new Date(),
      },
    );
  }
}