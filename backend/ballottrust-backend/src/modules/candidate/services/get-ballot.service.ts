import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

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
    const candidates =
      await this.candidateRepository
        .findOrderedBallot(
          electionId,
        );

    if (candidates.length === 0) {
      throw new NotFoundException(
        'Ballot has not been generated for this election.',
      );
    }

    return {
      electionId,

      totalCandidates:
        candidates.length,

      candidates,
    };
  }
}