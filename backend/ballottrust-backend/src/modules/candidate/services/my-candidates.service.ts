import { Injectable } from '@nestjs/common';

import { CandidateRepository } from '../repository/candidate.repository';

@Injectable()
export class MyCandidatesService {
  constructor(private readonly candidateRepository: CandidateRepository) {}

  async execute(userId: string) {
    return this.candidateRepository.findMany({
      userId,
    });
  }
}
