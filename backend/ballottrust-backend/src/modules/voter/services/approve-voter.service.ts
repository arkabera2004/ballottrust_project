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

/** Admits a verified voter to the roll. */
@Injectable()
export class ApproveVoterService {
  constructor(
    private readonly repository: VoterRegistrationRepository,

    private readonly statusValidator: VoterRegistrationStatusValidator,

    private readonly auditService: AuditService,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(registrationId: string, approvedById: string) {
    const registration = await this.repository.findById(registrationId);

    if (!registration) {
      throw new NotFoundException('Voter registration not found.');
    }

    this.statusValidator.validateTransition(
      registration.status,
      VoterRegistrationStatus.APPROVED,
    );

    const updated = await this.repository.update(registrationId, {
      status: VoterRegistrationStatus.APPROVED,
      approvedBy: { connect: { id: approvedById } },
      approvedAt: new Date(),
    });

    await this.auditService.log({
      userId: approvedById,
      action: 'VOTER_APPROVED',
      module: 'voter',
      entityType: 'VoterRegistration',
      entityId: registrationId,
      result: 'SUCCESS',
      metadata: {
        previousStatus: registration.status,
        electionId: registration.electionId,
      },
    });

    this.eventEmitter.emit(NOTIFICATION_REQUESTED, {
      userId: registration.userId,
      title: 'Voter registration approved',
      message: `Your registration for ${registration.election.title} has been approved. You are now on the voter roll.`,
      type: NotificationType.SUCCESS,
      entityType: 'VoterRegistration',
      entityId: registrationId,
      sendEmail: true,
    } satisfies NotificationRequestedEvent);

    return updated;
  }
}
