import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ManifestoStatus } from '@prisma/client';

import { ManifestoRepository } from '../repository/manifesto.repository';
import { ManifestoStatusValidator } from '../validators/manifesto-status.validator';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class SubmitManifestoService {
  constructor(
    private readonly repository: ManifestoRepository,

    private readonly statusValidator: ManifestoStatusValidator,

    private readonly auditService: AuditService,
  ) {}

  async execute(id: string, authorId: string, isAdmin = false) {
    const manifesto = await this.repository.findById(id);

    if (!manifesto) {
      throw new NotFoundException('Manifesto not found.');
    }

    if (!isAdmin && manifesto.candidate.userId !== authorId) {
      throw new ForbiddenException(
        'You can only manage your own candidate manifesto.',
      );
    }

    this.statusValidator.validateTransition(
      manifesto.status,
      ManifestoStatus.SUBMITTED,
    );

    const updated = await this.repository.update(id, {
      status: ManifestoStatus.SUBMITTED,
      submittedAt: new Date(),
    });

    await this.auditService.log({
      userId: authorId,
      action: 'MANIFESTO_SUBMITTED',
      module: 'manifesto',
      entityType: 'CandidateManifesto',
      entityId: id,
      result: 'SUCCESS',
      metadata: { version: manifesto.version },
    });

    return updated;
  }
}
