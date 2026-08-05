import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CandidateRepository } from '../repository/candidate.repository';

@Injectable()
export class GetPublicCandidateProfileService {
  constructor(
    private readonly candidateRepository:
      CandidateRepository,
  ) {}

  async execute(
    candidateId: string,
  ) {
    const candidate =
      await this.candidateRepository
        .findPublicProfile(
          candidateId,
        );

    if (!candidate) {
      throw new NotFoundException(
        'Public candidate profile not found.',
      );
    }

    return candidate;
  }
}