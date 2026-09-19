import { Injectable, NotFoundException } from '@nestjs/common';

import { VoterRegistrationRepository } from '../repository/voter-registration.repository';
import { VoterRegistrationStatusValidator } from '../validators/voter-registration-status.validator';
import { AuditService } from '../../audit/audit.service';
import { UpdateVoterRegistrationDto } from '../dto';

@Injectable()
export class UpdateVoterRegistrationService {
  constructor(
    private readonly repository: VoterRegistrationRepository,

    private readonly statusValidator: VoterRegistrationStatusValidator,

    private readonly auditService: AuditService,
  ) {}

  async execute(
    registrationId: string,
    updatedById: string,
    dto: UpdateVoterRegistrationDto,
  ) {
    const registration = await this.repository.findById(registrationId);

    if (!registration) {
      throw new NotFoundException('Voter registration not found.');
    }

    this.statusValidator.validateEditable(registration.status);

    const updated = await this.repository.update(registrationId, {
      notes: dto.notes,
    });

    await this.auditService.log({
      userId: updatedById,
      action: 'VOTER_REGISTRATION_UPDATED',
      module: 'voter',
      entityType: 'VoterRegistration',
      entityId: registrationId,
      result: 'SUCCESS',
    });

    return updated;
  }
}
