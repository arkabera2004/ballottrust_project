import { Injectable, NotFoundException } from '@nestjs/common';

import { CandidateStatus } from '@prisma/client';

import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateStatusValidator } from '../validators/candidate-status.validator';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class VerifyCandidateService {
  constructor(
    private readonly candidateRepository: CandidateRepository,

    private readonly candidateStatusValidator: CandidateStatusValidator,

    private readonly auditService: AuditService,
  ) {}

  async execute(candidateId: string, verifiedById: string) {
    const candidate = await this.candidateRepository.findById(candidateId);

    if (!candidate) {
      throw new NotFoundException('Candidate not found.');
    }

    // ======================================================
    // Validate Lifecycle Transition
    // ======================================================

    this.candidateStatusValidator.validateTransition(
      candidate.status,
      CandidateStatus.VERIFIED,
    );

    const updated = await this.candidateRepository.update(candidateId, {
      status: CandidateStatus.VERIFIED,

      verifiedBy: {
        connect: {
          id: verifiedById,
        },
      },

      verifiedAt: new Date(),
    });

    await this.auditService.log({
      userId: verifiedById,
      action: 'CANDIDATE_VERIFIED',
      module: 'candidate',
      entityType: 'Candidate',
      entityId: candidateId,
      result: 'SUCCESS',
      metadata: { previousStatus: candidate.status },
    });

    return updated;
  }
}
