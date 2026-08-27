import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  CandidateStatus,
  Prisma,
} from '@prisma/client';

import { CandidateRepository } from '../repository/candidate.repository';

import {
  BallotLifecycleValidator,
} from '../validators/ballot-lifecycle.validator';

@Injectable()
export class AutoAssignCandidateNumberService {
  constructor(
    private readonly candidateRepository:
      CandidateRepository,

    private readonly ballotLifecycleValidator:
      BallotLifecycleValidator,
  ) {}

  async execute(
    candidateId: string,
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
    // 4. Validate Election & Ballot Lifecycle
    // ======================================================

    const election =
      await this.candidateRepository
        .findElectionBallotState(
          candidate.electionId,
        );

    if (!election) {
      throw new NotFoundException(
        'Election not found.',
      );
    }

    this.ballotLifecycleValidator
      .validateModification(
        election.status,
        election.ballotFinalizedAt,
      );

    // ======================================================
    // 5. Find Next Candidate Number
    // ======================================================

    const highestCandidateNumber =
      await this.candidateRepository
        .getHighestCandidateNumber(
          candidate.electionId,
        );

    const nextCandidateNumber =
      highestCandidateNumber + 1;

    // ======================================================
    // 6. Assign Candidate Number
    // ======================================================

    try {
      return await this.candidateRepository.update(
        candidateId,
        {
          candidateNumber:
            nextCandidateNumber,
        },
      );
    } catch (error) {
      // Database unique constraint is the final
      // protection against concurrent assignment.

      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Candidate number assignment conflicted with another request. Please try again.',
        );
      }

      throw error;
    }
  }
}