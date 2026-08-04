import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  ElectionStatus,
} from '@prisma/client';

import { CandidateRepository } from '../repository/candidate.repository';

@Injectable()
export class FinalizeBallotService {
  constructor(
    private readonly candidateRepository:
      CandidateRepository,
  ) {}

  async execute(
    electionId: string,
    finalizedById: string,
  ) {
    // ======================================================
    // 1. Find Election
    // ======================================================

    const election =
      await this.candidateRepository
        .findElectionBallotState(
          electionId,
        );

    if (!election) {
      throw new NotFoundException(
        'Election not found.',
      );
    }

    // ======================================================
    // 2. Election Must Be Published
    // ======================================================

    if (
      election.status !==
      ElectionStatus.PUBLISHED
    ) {
      throw new BadRequestException(
        'Only published elections can have their ballot finalized.',
      );
    }

    // ======================================================
    // 3. Prevent Re-Finalization
    // ======================================================

    if (
      election.ballotFinalizedAt
    ) {
      throw new BadRequestException(
        'The ballot has already been finalized.',
      );
    }

    // ======================================================
    // 4. Ballot Must Have Been Generated
    // ======================================================

    if (
      !election.ballotOrderMethod
    ) {
      throw new BadRequestException(
        'The ballot must be generated before it can be finalized.',
      );
    }

    // ======================================================
    // 5. Validate Ballot Readiness
    // ======================================================

    const readiness =
      await this.candidateRepository
        .getBallotReadiness(
          electionId,
        );

    if (
      readiness.totalApprovedCandidates ===
      0
    ) {
      throw new BadRequestException(
        'The ballot cannot be finalized without approved candidates.',
      );
    }

    if (
      readiness.readyCandidates !==
      readiness.totalApprovedCandidates
    ) {
      throw new BadRequestException(
        'The ballot cannot be finalized because it is incomplete.',
      );
    }

    // ======================================================
    // 6. Finalize Ballot
    // ======================================================

    const finalizedElection =
      await this.candidateRepository
        .finalizeBallot(
          electionId,
          finalizedById,
        );

    return {
      message:
        'Ballot finalized successfully.',

      data:
        finalizedElection,
    };
  }
}