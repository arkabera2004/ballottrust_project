import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CandidateStatus } from '@prisma/client';

import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateValidator } from '../validators/candidate.validator';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class CancelNominationService {
  constructor(
    private readonly candidateRepository: CandidateRepository,

    private readonly candidateValidator: CandidateValidator,

    private readonly auditService: AuditService,
  ) {}

  async execute(candidateId: string, userId: string) {
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
      throw new ForbiddenException('You can only cancel your own nomination.');
    }

    // ======================================================
    // 3. Only Pending Nominations Can Be Cancelled
    // ======================================================

    if (candidate.status !== CandidateStatus.PENDING) {
      throw new BadRequestException(
        'Only pending nominations can be cancelled.',
      );
    }

    // ======================================================
    // 4. Validate Election
    // ======================================================

    const election = await this.candidateValidator.validateElectionExists(
      candidate.electionId,
    );

    // ======================================================
    // 5. Validate Nomination Window
    // ======================================================

    this.candidateValidator.validateNominationWindow(election);

    // ======================================================
    // 6. Soft Delete Nomination
    // ======================================================

    await this.candidateRepository.softDelete(candidateId);

    await this.auditService.log({
      userId,
      action: 'CANDIDATE_NOMINATION_CANCELLED',
      module: 'candidate',
      entityType: 'Candidate',
      entityId: candidateId,
      result: 'SUCCESS',
    });

    return {
      message: 'Nomination cancelled successfully.',
    };
  }
}
