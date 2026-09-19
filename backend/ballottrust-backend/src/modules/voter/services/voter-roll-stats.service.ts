import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { VoterRegistrationRepository } from '../repository/voter-registration.repository';
import { RegistrationWindowValidator } from '../validators/registration-window.validator';

/** Roll composition for one election, for the commissioner dashboard. */
@Injectable()
export class VoterRollStatsService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly repository: VoterRegistrationRepository,

    private readonly registrationWindowValidator: RegistrationWindowValidator,
  ) {}

  async execute(electionId: string) {
    const election = await this.prisma.election.findFirst({
      where: { id: electionId, deletedAt: null },
      select: {
        id: true,
        title: true,
        status: true,
        registrationStart: true,
        registrationEnd: true,
      },
    });

    if (!election) {
      throw new NotFoundException('Election not found.');
    }

    const counts = await this.repository.countByStatus(electionId);

    const total =
      counts.PENDING + counts.VERIFIED + counts.APPROVED + counts.REJECTED;

    return {
      electionId: election.id,
      electionTitle: election.title,
      registrationStatus: this.registrationWindowValidator.getStatus(
        election.status,
        election.registrationStart,
        election.registrationEnd,
      ),
      registrationStart: election.registrationStart,
      registrationEnd: election.registrationEnd,
      total,
      /** Only APPROVED registrations are eligible to be issued a ballot. */
      eligible: counts.APPROVED,
      byStatus: counts,
    };
  }
}
