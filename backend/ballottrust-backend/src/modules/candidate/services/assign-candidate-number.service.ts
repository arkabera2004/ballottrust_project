import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  CandidateStatus,
} from '@prisma/client';

import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateValidator } from '../validators/candidate.validator';

@Injectable()
export class AssignCandidateNumberService {
  constructor(
    private readonly candidateRepository:
      CandidateRepository,

    private readonly candidateValidator:
      CandidateValidator,
  ) {}

  async execute(
    candidateId: string,
    candidateNumber: number,
  ) {
    // ======================================================
    // 1. Find Candidate
    // ======================================================

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
    // 2. Candidate Must Be Approved
    // ======================================================

    if (
      candidate.status !==
      CandidateStatus.APPROVED
    ) {
      throw new BadRequestException(
        'Candidate number can only be assigned to an approved candidate.',
      );
    }

    // ======================================================
    // 3. Prevent Reassignment
    // ======================================================

    if (
      candidate.candidateNumber !== null
    ) {
      throw new BadRequestException(
        'Candidate number has already been assigned.',
      );
    }

    // ======================================================
    // 4. Validate Election-Scoped Uniqueness
    // ======================================================

    await this.candidateValidator
      .validateCandidateNumber(
        candidate.electionId,
        candidateNumber,
      );

    // ======================================================
    // 5. Assign Candidate Number
    // ======================================================

    return this.candidateRepository.update(
      candidateId,
      {
        candidateNumber,
      },
    );
  }
}