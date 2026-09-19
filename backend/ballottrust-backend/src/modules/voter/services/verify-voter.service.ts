import { Injectable, NotFoundException } from '@nestjs/common';

import { VoterRegistrationStatus } from '@prisma/client';

import { VoterRegistrationRepository } from '../repository/voter-registration.repository';
import { VoterRegistrationStatusValidator } from '../validators/voter-registration-status.validator';
import { AuditService } from '../../audit/audit.service';

/** Verification Officer confirms the voter's supporting identity details. */
@Injectable()
export class VerifyVoterService {
  constructor(
    private readonly repository: VoterRegistrationRepository,

    private readonly statusValidator: VoterRegistrationStatusValidator,

    private readonly auditService: AuditService,
  ) {}

  async execute(registrationId: string, verifiedById: string) {
    const registration = await this.repository.findById(registrationId);

    if (!registration) {
      throw new NotFoundException('Voter registration not found.');
    }

    this.statusValidator.validateTransition(
      registration.status,
      VoterRegistrationStatus.VERIFIED,
    );

    const updated = await this.repository.update(registrationId, {
      status: VoterRegistrationStatus.VERIFIED,
      verifiedBy: { connect: { id: verifiedById } },
      verifiedAt: new Date(),
    });

    await this.auditService.log({
      userId: verifiedById,
      action: 'VOTER_VERIFIED',
      module: 'voter',
      entityType: 'VoterRegistration',
      entityId: registrationId,
      result: 'SUCCESS',
      metadata: {
        previousStatus: registration.status,
        electionId: registration.electionId,
      },
    });

    return updated;
  }
}
