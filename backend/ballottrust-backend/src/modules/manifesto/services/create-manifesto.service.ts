import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CandidateStatus, ManifestoStatus } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { ManifestoRepository } from '../repository/manifesto.repository';
import { ManifestoContentSanitizer } from '../manifesto-content.sanitizer';
import { AuditService } from '../../audit/audit.service';
import { CreateManifestoDto } from '../dto';

/**
 * Creates the next manifesto version for a candidate.
 *
 * Business rule (docs/07 §7): every update creates a new version. There
 * is therefore no "edit an approved manifesto" path — revising one means
 * creating version N+1, which re-enters the approval workflow as a DRAFT.
 */
@Injectable()
export class CreateManifestoService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly repository: ManifestoRepository,

    private readonly sanitizer: ManifestoContentSanitizer,

    private readonly auditService: AuditService,
  ) {}

  async execute(dto: CreateManifestoDto, authorId: string, isAdmin = false) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id: dto.candidateId, deletedAt: null },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found.');
    }

    // A candidate may only publish their own manifesto; administrators
    // may act on any candidate's behalf.
    if (!isAdmin && candidate.userId !== authorId) {
      throw new ForbiddenException(
        'You can only manage your own candidate manifesto.',
      );
    }

    if (
      candidate.status === CandidateStatus.REJECTED ||
      candidate.status === CandidateStatus.WITHDRAWN ||
      candidate.status === CandidateStatus.DISQUALIFIED
    ) {
      throw new ForbiddenException(
        `A candidate in ${candidate.status} status cannot publish a manifesto.`,
      );
    }

    const version = await this.repository.nextVersion(dto.candidateId);

    const manifesto = await this.repository.create({
      candidate: { connect: { id: dto.candidateId } },
      version,
      title: dto.title,
      summary: dto.summary,
      content: this.sanitizer.sanitize(dto.content),
      documentUrl: dto.documentUrl,
      videoUrl: dto.videoUrl,
      coverImage: dto.coverImage,
      status: ManifestoStatus.DRAFT,
    });

    await this.auditService.log({
      userId: authorId,
      action: 'MANIFESTO_CREATED',
      module: 'manifesto',
      entityType: 'CandidateManifesto',
      entityId: manifesto.id,
      result: 'SUCCESS',
      metadata: { candidateId: dto.candidateId, version },
    });

    return manifesto;
  }
}
