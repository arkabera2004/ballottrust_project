import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CandidateRepository } from '../repository/candidate.repository';

@Injectable()
export class GetCandidateService {
  constructor(
    private readonly candidateRepository:
      CandidateRepository,
  ) {}

  async execute(
    candidateId: string,
  ) {
    const candidate =
      await this.candidateRepository
        .findByIdWithDetails(
          candidateId,
        );

    if (!candidate) {
      throw new NotFoundException(
        'Candidate not found.',
      );
    }

    return candidate;
  }
}