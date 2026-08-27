import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CandidateStatus } from '@prisma/client';

import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateStatusValidator } from '../validators/candidate-status.validator';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class ApproveCandidateService {
  constructor(
    private readonly candidateRepository:
      CandidateRepository,

    private readonly candidateStatusValidator:
      CandidateStatusValidator,

    private readonly auditService: AuditService,
  ) {}

  async execute(
    candidateId: string,
    approvedById: string,
  ) {
    const candidate =
      await this.candidateRepository.findById(
        candidateId,
      );

    if (!candidate) {
      throw new NotFoundException(
        'Candidate not found.',
      );
    }

    // ======================================================
    // Validate Lifecycle Transition
    // ======================================================

    this.candidateStatusValidator
      .validateTransition(
        candidate.status,
        CandidateStatus.APPROVED,
      );

    const updated = await this.candidateRepository.update(
      candidateId,
      {
        status:
          CandidateStatus.APPROVED,

        approvedBy: {
          connect: {
            id: approvedById,
          },
        },

        approvedAt:
          new Date(),
      },
    );

    await this.auditService.log({
      userId: approvedById,
      action: 'CANDIDATE_APPROVED',
      module: 'candidate',
      entityType: 'Candidate',
      entityId: candidateId,
      result: 'SUCCESS',
      metadata: { previousStatus: candidate.status },
    });

    return updated;
  }
}
