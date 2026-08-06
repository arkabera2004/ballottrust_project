import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  BallotOrderMethod,
} from '@prisma/client';

import { CandidateRepository } from '../repository/candidate.repository';
import { BallotLifecycleValidator } from '../validators/ballot-lifecycle.validator';

@Injectable()
export class GenerateBallotOrderService {
  constructor(
  private readonly candidateRepository:
    CandidateRepository,

  private readonly ballotLifecycleValidator:
    BallotLifecycleValidator,
) {}

  async execute(
    electionId: string,
    method: BallotOrderMethod,
  ) {

    // ======================================================
// 1. Validate Election Lifecycle
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

this.ballotLifecycleValidator
  .validateModification(
    election.status,
    election.ballotFinalizedAt,
  );
    // ======================================================
    // 1. Get Eligible Candidates
    // ======================================================

    const candidates =
      await this.candidateRepository
        .findEligibleForBallot(
          electionId,
        );

    if (candidates.length === 0) {
      throw new NotFoundException(
        'No eligible candidates are available for ballot ordering.',
      );
    }

    // ======================================================
    // 2. Manual Ordering Uses Separate Workflow
    // ======================================================

    if (
      method ===
      BallotOrderMethod.MANUAL
    ) {
      throw new BadRequestException(
        'Manual ballot ordering must use the manual ballot ordering endpoint.',
      );
    }

    // Work on a copy so the repository result
    // is not mutated unexpectedly.
    const orderedCandidates = [
      ...candidates,
    ];

    // ======================================================
    // 3. Candidate Number Ordering
    // ======================================================

    if (
      method ===
      BallotOrderMethod.CANDIDATE_NUMBER
    ) {
      orderedCandidates.sort(
        (a, b) =>
          (a.candidateNumber ?? 0) -
          (b.candidateNumber ?? 0),
      );
    }

    // ======================================================
    // 4. Alphabetical Ordering
    // ======================================================

    if (
      method ===
      BallotOrderMethod.ALPHABETICAL
    ) {
      orderedCandidates.sort(
        (a, b) =>
          a.user.fullName.localeCompare(
            b.user.fullName,
            'en',
            {
              sensitivity: 'base',
            },
          ),
      );
    }

    // ======================================================
    // 5. Random Ordering
    // ======================================================

    if (
      method ===
      BallotOrderMethod.RANDOM
    ) {
      this.shuffle(
        orderedCandidates,
      );
    }

    // ======================================================
    // 6. Create Persisted Assignments
    // ======================================================

    const assignments =
      orderedCandidates.map(
        (candidate, index) => ({
          candidateId:
            candidate.id,

          ballotOrder:
            index + 1,
        }),
      );

    // ======================================================
    // 7. Persist Atomically
    // ======================================================

    await this.candidateRepository
      .replaceBallotOrders(
        electionId,
        method,
        assignments,
      );

    // ======================================================
    // 8. Return Ordered Ballot
    // ======================================================

    return orderedCandidates.map(
      (candidate, index) => ({
        id:
          candidate.id,

        candidateNumber:
          candidate.candidateNumber,

        ballotOrder:
          index + 1,

        fullName:
          candidate.user.fullName,

        candidateType:
          candidate.candidateType,

        position:
          candidate.position,

        party:
          candidate.party,
      }),
    );
  }

  // ======================================================
  // Fisher-Yates Shuffle
  // ======================================================

  private shuffle<T>(
    items: T[],
  ): void {
    for (
      let i = items.length - 1;
      i > 0;
      i--
    ) {
      const j =
        Math.floor(
          Math.random() *
            (i + 1),
        );

      [
        items[i],
        items[j],
      ] = [
        items[j],
        items[i],
      ];
    }
  }
}