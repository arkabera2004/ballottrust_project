import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNominationDto } from './dto/create-nomination.dto';

@Injectable()
export class CandidatePortalService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async submitNomination(
  data: CreateNominationDto,
) {
  return this.prisma.candidate.create({
    data: {
      name: data.name,
      email: data.email,
      registrationNumber: data.registrationNumber,
      department: data.department,
      position: data.position,
      bio: data.bio,
      manifesto: data.manifesto,
      agenda: data.agenda,
      achievements: data.achievements,
      photoUrl: data.photoUrl,
      documentUrl: data.documentUrl,
      electionId: data.electionId,
    },
  });
}

  async getAllCandidates() {
    return this.prisma.candidate.findMany({
      include: {
        election: true,
      },
    });
  }

  async approveCandidate(id: string) {
    return this.prisma.candidate.update({
      where: {
        id,
      },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
      },
    });
  }

  async rejectCandidate(
    id: string,
    reason: string,
  ) {
    return this.prisma.candidate.update({
      where: {
        id,
      },
      data: {
        status: 'REJECTED',
        rejectionReason:
          reason,
        reviewedAt: new Date(),
      },
    });
  }
}