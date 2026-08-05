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
export class GetBallotService {
  constructor(
    private readonly candidateRepository:
      CandidateRepository,
  ) {}

  async execute(
    electionId: string,
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
    // 2. Ballot Must Be Finalized
    // ======================================================

    if (!election.ballotFinalizedAt) {
      throw new BadRequestException(
        'The ballot has not been finalized for this election.',
      );
    }

    // ======================================================
    // 3. Validate Public Election Lifecycle
    // ======================================================

    const publicStatuses:
      ElectionStatus[] = [
        ElectionStatus.PUBLISHED,
        ElectionStatus.ACTIVE,
        ElectionStatus.VOTING_CLOSED,
        ElectionStatus.RESULT_PUBLISHED,
        ElectionStatus.ARCHIVED,
      ];

    if (
      !publicStatuses.includes(
        election.status,
      )
    ) {
      throw new BadRequestException(
        `The ballot is not publicly available while the election is in ${election.status} status.`,
      );
    }

    // ======================================================
    // 4. Get Finalized Ordered Ballot
    // ======================================================

    const candidates =
      await this.candidateRepository
        .findOrderedBallot(
          electionId,
        );

    if (candidates.length === 0) {
      throw new NotFoundException(
        'No candidates are available on the finalized ballot.',
      );
    }

    // ======================================================
    // 5. Return Public Ballot
    // ======================================================

    return {
      electionId,

      status:
        election.status,

      ballotOrderMethod:
        election.ballotOrderMethod,

      ballotFinalizedAt:
        election.ballotFinalizedAt,

      totalCandidates:
        candidates.length,

      candidates,
    };
  }
}