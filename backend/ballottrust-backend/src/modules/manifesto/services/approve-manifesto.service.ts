import { Injectable, NotFoundException } from '@nestjs/common';

import { ManifestoStatus } from '@prisma/client';

import { ManifestoRepository } from '../repository/manifesto.repository';
import { ManifestoStatusValidator } from '../validators/manifesto-status.validator';
import { AuditService } from '../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';
import {
  NOTIFICATION_REQUESTED,
  type NotificationRequestedEvent,
} from '../../notification/notification.events';

/** Approving a version makes it the publicly visible manifesto. */
@Injectable()
export class ApproveManifestoService {
  constructor(
    private readonly repository: ManifestoRepository,

    private readonly statusValidator: ManifestoStatusValidator,

    private readonly auditService: AuditService,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, approvedById: string) {
    const manifesto = await this.repository.findById(id);

    if (!manifesto) {
      throw new NotFoundException('Manifesto not found.');
    }

    this.statusValidator.validateTransition(
      manifesto.status,
      ManifestoStatus.APPROVED,
    );

    const updated = await this.repository.update(id, {
      status: ManifestoStatus.APPROVED,
      approvedBy: { connect: { id: approvedById } },
      approvedAt: new Date(),
    });

    await this.auditService.log({
      userId: approvedById,
      action: 'MANIFESTO_APPROVED',
      module: 'manifesto',
      entityType: 'CandidateManifesto',
      entityId: id,
      result: 'SUCCESS',
      metadata: {
        candidateId: manifesto.candidateId,
        version: manifesto.version,
      },
    });

    this.eventEmitter.emit(NOTIFICATION_REQUESTED, {
      userId: manifesto.candidate.userId,
      title: 'Manifesto approved',
      message:
        'Your manifesto has been approved and is now visible on the public portal.',
      type: NotificationType.SUCCESS,
      entityType: 'CandidateManifesto',
      entityId: id,
      sendEmail: true,
    } satisfies NotificationRequestedEvent);

    return updated;
  }
}
