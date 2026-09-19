import { Injectable, NotFoundException } from '@nestjs/common';
import { CandidateStatus, ManifestoStatus } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { PUBLIC_ELECTION_STATUSES } from '../public-visibility';
import { PUBLIC_CANDIDATE_SELECT } from './list-public-candidates.service';

@Injectable()
export class GetPublicCandidateService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const candidate = await this.prisma.candidate.findFirst({
      where: {
        id,
        deletedAt: null,
        status: CandidateStatus.APPROVED,
        election: {
          deletedAt: null,
          status: { in: PUBLIC_ELECTION_STATUSES },
        },
      },
      select: {
        ...PUBLIC_CANDIDATE_SELECT,
        biography: true,
        campaignWebsite: true,
        // Legacy single-field manifesto, superseded by the versioned
        // CandidateManifesto rows resolved below but still populated
        // on older candidates.
        manifesto: true,
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found.');
    }

    // Highest APPROVED manifesto version only — never a draft.
    const manifesto = await this.prisma.candidateManifesto.findFirst({
      where: {
        candidateId: id,
        deletedAt: null,
        status: ManifestoStatus.APPROVED,
      },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        version: true,
        title: true,
        summary: true,
        content: true,
        documentUrl: true,
        videoUrl: true,
        coverImage: true,
        approvedAt: true,
      },
    });

    return { ...candidate, publishedManifesto: manifesto };
  }
}
