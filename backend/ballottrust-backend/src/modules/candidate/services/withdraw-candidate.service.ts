import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CandidateStatus } from '@prisma/client';

import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateStatusValidator } from '../validators/candidate-status.validator';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class WithdrawCandidateService {
  constructor(
    private readonly candidateRepository: CandidateRepository,

    private readonly candidateStatusValidator: CandidateStatusValidator,

    private readonly auditService: AuditService,
  ) {}

  async execute(candidateId: string, userId: string, reason: string) {
    const candidate = await this.candidateRepository.findById(candidateId);

    if (!candidate) {
      throw new NotFoundException('Candidate not found.');
    }

    // ======================================================
    // Ownership Validation
    // ======================================================

    if (candidate.userId !== userId) {
      throw new ForbiddenException('You can only withdraw your own candidacy.');
    }

    // ======================================================
    // Validate Lifecycle Transition
    // ======================================================

    this.candidateStatusValidator.validateTransition(
      candidate.status,
      CandidateStatus.WITHDRAWN,
    );

    const updated = await this.candidateRepository.update(candidateId, {
      status: CandidateStatus.WITHDRAWN,

      withdrawnAt: new Date(),

      withdrawalReason: reason.trim(),
    });

    await this.auditService.log({
      userId,
      action: 'CANDIDATE_WITHDRAWN',
      module: 'candidate',
      entityType: 'Candidate',
      entityId: candidateId,
      result: 'SUCCESS',
      description: reason.trim(),
      metadata: { previousStatus: candidate.status },
    });

    return updated;
  }
}
