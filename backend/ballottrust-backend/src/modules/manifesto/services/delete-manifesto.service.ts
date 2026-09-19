import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ManifestoRepository } from '../repository/manifesto.repository';
import { ManifestoStatusValidator } from '../validators/manifesto-status.validator';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class DeleteManifestoService {
  constructor(
    private readonly repository: ManifestoRepository,

    private readonly statusValidator: ManifestoStatusValidator,

    private readonly auditService: AuditService,
  ) {}

  async execute(id: string, deletedById: string, isAdmin = false) {
    const manifesto = await this.repository.findById(id);

    if (!manifesto) {
      throw new NotFoundException('Manifesto not found.');
    }

    if (!isAdmin && manifesto.candidate.userId !== deletedById) {
      throw new ForbiddenException(
        'You can only manage your own candidate manifesto.',
      );
    }

    this.statusValidator.validateDeletable(manifesto.status);

    await this.repository.softDelete(id);

    await this.auditService.log({
      userId: deletedById,
      action: 'MANIFESTO_DELETED',
      module: 'manifesto',
      entityType: 'CandidateManifesto',
      entityId: id,
      result: 'SUCCESS',
      metadata: { version: manifesto.version },
    });

    return { success: true };
  }
}
