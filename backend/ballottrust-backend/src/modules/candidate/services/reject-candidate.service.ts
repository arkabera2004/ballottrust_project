import { Injectable, NotFoundException } from '@nestjs/common';

import { CandidateStatus } from '@prisma/client';

import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateStatusValidator } from '../validators/candidate-status.validator';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class RejectCandidateService {
  constructor(
    private readonly candidateRepository: CandidateRepository,

    private readonly candidateStatusValidator: CandidateStatusValidator,

    private readonly auditService: AuditService,
  ) {}

  async execute(candidateId: string, rejectedById: string, reason: string) {
    const candidate = await this.candidateRepository.findById(candidateId);

    if (!candidate) {
      throw new NotFoundException('Candidate not found.');
    }

    // ======================================================
    // Validate Lifecycle Transition
    // ======================================================

    this.candidateStatusValidator.validateTransition(
      candidate.status,
      CandidateStatus.REJECTED,
    );

    const updated = await this.candidateRepository.update(candidateId, {
      status: CandidateStatus.REJECTED,

      rejectedBy: {
        connect: {
          id: rejectedById,
        },
      },

      rejectionReason: reason.trim(),

      rejectedAt: new Date(),
    });

    await this.auditService.log({
      userId: rejectedById,
      action: 'CANDIDATE_REJECTED',
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
