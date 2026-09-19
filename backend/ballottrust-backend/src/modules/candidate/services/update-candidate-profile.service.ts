import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CandidateRepository } from '../repository/candidate.repository';

import { UpdateCandidateProfileDto } from '../dto/update-candidate-profile.dto';

import { CandidateStatusValidator } from '../validators/candidate-status.validator';

@Injectable()
export class UpdateCandidateProfileService {
  constructor(
    private readonly candidateRepository: CandidateRepository,

    private readonly candidateStatusValidator: CandidateStatusValidator,
  ) {}

  async execute(
    candidateId: string,
    userId: string,
    dto: UpdateCandidateProfileDto,
  ) {
    // ======================================================
    // 1. Find Candidate
    // ======================================================

    const candidate = await this.candidateRepository.findById(candidateId);

    if (!candidate) {
      throw new NotFoundException('Candidate not found.');
    }

    // ======================================================
    // 2. Validate Ownership
    // ======================================================

    if (candidate.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own candidate profile.',
      );
    }

    // ======================================================
    // 3. Validate Candidate Edit Lifecycle
    // ======================================================

    this.candidateStatusValidator.validateEditable(candidate.status);

    // ======================================================
    // 4. Update Candidate Profile
    // ======================================================

    return this.candidateRepository.update(candidateId, {
      ...(dto.biography !== undefined && {
        biography: dto.biography.trim(),
      }),
    });
  }
}
