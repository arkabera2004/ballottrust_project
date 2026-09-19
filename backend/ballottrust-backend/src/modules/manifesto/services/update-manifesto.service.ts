import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ManifestoRepository } from '../repository/manifesto.repository';
import { ManifestoStatusValidator } from '../validators/manifesto-status.validator';
import { ManifestoContentSanitizer } from '../manifesto-content.sanitizer';
import { AuditService } from '../../audit/audit.service';
import { UpdateManifestoDto } from '../dto';

/**
 * Edits a manifesto in place. Permitted only while it is still a DRAFT —
 * once submitted, a change must become a new version so the reviewed
 * content stays exactly what was reviewed.
 */
@Injectable()
export class UpdateManifestoService {
  constructor(
    private readonly repository: ManifestoRepository,

    private readonly statusValidator: ManifestoStatusValidator,

    private readonly sanitizer: ManifestoContentSanitizer,

    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    dto: UpdateManifestoDto,
    authorId: string,
    isAdmin = false,
  ) {
    const manifesto = await this.repository.findById(id);

    if (!manifesto) {
      throw new NotFoundException('Manifesto not found.');
    }

    if (!isAdmin && manifesto.candidate.userId !== authorId) {
      throw new ForbiddenException(
        'You can only manage your own candidate manifesto.',
      );
    }

    this.statusValidator.validateEditable(manifesto.status);

    const updated = await this.repository.update(id, {
      title: dto.title,
      summary: dto.summary,
      content: dto.content ? this.sanitizer.sanitize(dto.content) : undefined,
      documentUrl: dto.documentUrl,
      videoUrl: dto.videoUrl,
      coverImage: dto.coverImage,
    });

    await this.auditService.log({
      userId: authorId,
      action: 'MANIFESTO_UPDATED',
      module: 'manifesto',
      entityType: 'CandidateManifesto',
      entityId: id,
      result: 'SUCCESS',
      metadata: { version: manifesto.version },
    });

    return updated;
  }
}
