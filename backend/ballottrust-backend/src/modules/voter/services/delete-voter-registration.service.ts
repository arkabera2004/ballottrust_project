import { Injectable, NotFoundException } from '@nestjs/common';

import { AuditSeverity } from '@prisma/client';

import { VoterRegistrationRepository } from '../repository/voter-registration.repository';
import { AuditService } from '../../audit/audit.service';

/**
 * Removes a voter from the roll. Soft delete: the row is retained so the
 * audit trail and any issued VoterCredential remain explicable.
 */
@Injectable()
export class DeleteVoterRegistrationService {
  constructor(
    private readonly repository: VoterRegistrationRepository,

    private readonly auditService: AuditService,
  ) {}

  async execute(registrationId: string, deletedById: string) {
    const registration = await this.repository.findById(registrationId);

    if (!registration) {
      throw new NotFoundException('Voter registration not found.');
    }

    await this.repository.softDelete(registrationId);

    await this.auditService.log({
      userId: deletedById,
      action: 'VOTER_REGISTRATION_DELETED',
      module: 'voter',
      entityType: 'VoterRegistration',
      entityId: registrationId,
      result: 'SUCCESS',
      severity: AuditSeverity.HIGH,
      metadata: {
        previousStatus: registration.status,
        electionId: registration.electionId,
      },
    });

    return { success: true };
  }
}
