import { Injectable, NotFoundException } from '@nestjs/common';

import { VoterRegistrationStatus } from '@prisma/client';

import { VoterRegistrationRepository } from '../repository/voter-registration.repository';
import { VoterRegistrationStatusValidator } from '../validators/voter-registration-status.validator';
import { AuditService } from '../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';
import {
  NOTIFICATION_REQUESTED,
  type NotificationRequestedEvent,
} from '../../notification/notification.events';
import { RejectVoterRegistrationDto } from '../dto';

@Injectable()
export class RejectVoterService {
  constructor(
    private readonly repository: VoterRegistrationRepository,

    private readonly statusValidator: VoterRegistrationStatusValidator,

    private readonly auditService: AuditService,

    private readonly eventEmitter: EventEmitter2,
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

    this.eventEmitter.emit(NOTIFICATION_REQUESTED, {
      userId: registration.userId,
      title: 'Voter registration rejected',
      message: `Your registration for ${registration.election.title} was rejected: ${dto.reason}`,
      type: NotificationType.WARNING,
      entityType: 'VoterRegistration',
      entityId: registrationId,
      sendEmail: true,
    } satisfies NotificationRequestedEvent);

    return updated;
  }
}
