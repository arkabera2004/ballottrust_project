import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  BallotOrderMethod,
} from '@prisma/client';

import { CandidateRepository } from '../repository/candidate.repository';

@Injectable()
export class ManualBallotOrderService {
  constructor(
    private readonly candidateRepository:
      CandidateRepository,
  ) {}

  async execute(
    electionId: string,
    candidateIds: string[],
  ) {
    // ======================================================
    // 1. Get All Eligible Candidates
    // ======================================================

    const eligibleCandidates =
      await this.candidateRepository
        .findEligibleForBallot(
          electionId,
        );

    if (
      eligibleCandidates.length === 0
    ) {
      throw new NotFoundException(
        'No eligible candidates are available for ballot ordering.',
      );
    }

    // ======================================================
    // 2. Ensure Complete Ballot Was Submitted
    // ======================================================

    if (
      candidateIds.length !==
      eligibleCandidates.length
    ) {
      throw new BadRequestException(
        'Manual ballot order must include every eligible candidate exactly once.',
      );
    }

    // ======================================================
    // 3. Validate Candidate Membership
    // ======================================================

    const eligibleCandidateIds =
      new Set(
        eligibleCandidates.map(
          (candidate) =>
            candidate.id,
        ),
      );

    for (
      const candidateId of candidateIds
    ) {
      if (
        !eligibleCandidateIds.has(
          candidateId,
        )
      ) {
        throw new BadRequestException(
          'Manual ballot order contains a candidate who is not eligible for this election.',
        );
      }
    }

    // ======================================================
    // 4. Generate Sequential Positions
    // ======================================================

    const assignments =
      candidateIds.map(
        (candidateId, index) => ({
          candidateId,
          ballotOrder:
            index + 1,
        }),
      );

    // ======================================================
    // 5. Persist Atomically
    // ======================================================

    await this.candidateRepository
      .replaceBallotOrders(
        electionId,
        BallotOrderMethod.MANUAL,
        assignments,
      );

    // ======================================================
    // 6. Return Ordered Ballot
    // ======================================================

    const candidateMap =
      new Map(
        eligibleCandidates.map(
          (candidate) => [
            candidate.id,
            candidate,
          ],
        ),
      );

    return candidateIds.map(
      (candidateId, index) => {
        const candidate =
          candidateMap.get(
            candidateId,
          )!;

        return {
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
        };
      },
    );
  }
}