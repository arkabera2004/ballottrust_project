import { Injectable, NotFoundException } from '@nestjs/common';

import { ManifestoStatus } from '@prisma/client';

import { ManifestoRepository } from '../repository/manifesto.repository';
import { ManifestoStatusValidator } from '../validators/manifesto-status.validator';
import { AuditService } from '../../audit/audit.service';
import { RejectManifestoDto } from '../dto';

@Injectable()
export class RejectManifestoService {
  constructor(
    private readonly repository: ManifestoRepository,

    private readonly statusValidator: ManifestoStatusValidator,

    private readonly auditService: AuditService,
  ) {}

  async execute(id: string, rejectedById: string, dto: RejectManifestoDto) {
    const manifesto = await this.repository.findById(id);

    if (!manifesto) {
      throw new NotFoundException('Manifesto not found.');
    }

    this.statusValidator.validateTransition(
      manifesto.status,
      ManifestoStatus.REJECTED,
    );

    const updated = await this.repository.update(id, {
      status: ManifestoStatus.REJECTED,
      rejectedBy: { connect: { id: rejectedById } },
      rejectedAt: new Date(),
      rejectionReason: dto.reason,
    });

    await this.auditService.log({
      userId: rejectedById,
      action: 'MANIFESTO_REJECTED',
      module: 'manifesto',
      entityType: 'CandidateManifesto',
      entityId: id,
      result: 'SUCCESS',
      metadata: {
        candidateId: manifesto.candidateId,
        version: manifesto.version,
        reason: dto.reason,
      },
    });

    return updated;
  }
}
