import { Injectable, NotFoundException } from '@nestjs/common';

import { VoterRegistrationStatus } from '@prisma/client';

import { VoterRegistrationRepository } from '../repository/voter-registration.repository';
import { VoterRegistrationStatusValidator } from '../validators/voter-registration-status.validator';
import { AuditService } from '../../audit/audit.service';
import { RejectVoterRegistrationDto } from '../dto';

@Injectable()
export class RejectVoterService {
  constructor(
    private readonly repository: VoterRegistrationRepository,

    private readonly statusValidator: VoterRegistrationStatusValidator,

    private readonly auditService: AuditService,
  ) {}

  async execute(
    registrationId: string,
    rejectedById: string,
    dto: RejectVoterRegistrationDto,
  ) {
    const registration = await this.repository.findById(registrationId);

    if (!registration) {
      throw new NotFoundException('Voter registration not found.');
    }

    this.statusValidator.validateTransition(
      registration.status,
      VoterRegistrationStatus.REJECTED,
    );

    const updated = await this.repository.update(registrationId, {
      status: VoterRegistrationStatus.REJECTED,
      rejectedBy: { connect: { id: rejectedById } },
      rejectedAt: new Date(),
      rejectionReason: dto.reason,
    });

    await this.auditService.log({
      userId: rejectedById,
      action: 'VOTER_REJECTED',
      module: 'voter',
      entityType: 'VoterRegistration',
      entityId: registrationId,
      result: 'SUCCESS',
      metadata: {
        previousStatus: registration.status,
        electionId: registration.electionId,
        reason: dto.reason,
      },
    });

    return updated;
  }
}
