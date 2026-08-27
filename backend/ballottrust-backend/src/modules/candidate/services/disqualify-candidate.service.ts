import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CandidateStatus } from '@prisma/client';

import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateStatusValidator } from '../validators/candidate-status.validator';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class DisqualifyCandidateService {
  constructor(
    private readonly candidateRepository:
      CandidateRepository,

    private readonly candidateStatusValidator:
      CandidateStatusValidator,

    private readonly auditService: AuditService,
  ) {}

  async execute(
  candidateId: string,
  disqualifiedById: string,
  reason: string,
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
        CandidateStatus.DISQUALIFIED,
      );

    const updated = await this.candidateRepository.update(
  candidateId,
  {
    status:
      CandidateStatus.DISQUALIFIED,

    disqualifiedBy: {
  connect: {
    id: disqualifiedById,
  },
},

    disqualifiedAt:
      new Date(),

    disqualificationReason:
      reason.trim(),
  },
);

    await this.auditService.log({
      userId: disqualifiedById,
      action: 'CANDIDATE_DISQUALIFIED',
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
