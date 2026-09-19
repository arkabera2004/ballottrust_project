import { Injectable } from '@nestjs/common';
import { VoterRegistrationStatus } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export interface VoterRollCheck {
  /** False only when the roll is authoritative and the voter is not on it. */
  admitted: boolean;
  /** Whether this election's roll governs admission at all. */
  rollEnforced: boolean;
  status: VoterRegistrationStatus | null;
  reason?: string;
}

/**
 * Applies the spec's "verification required before voting" rule
 * (docs/07 §8) without breaking elections that predate voter registration.
 *
 * The roll is authoritative only when the election actually configures a
 * registration window. An election with no window never collected
 * registrations, so requiring one would lock every existing voter out.
 * Making the switch depend on explicit configuration keeps the rule
 * enforced where it was opted into and inert everywhere else.
 */
@Injectable()
export class CheckVoterRollService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, electionId: string): Promise<VoterRollCheck> {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
      select: { registrationStart: true, registrationEnd: true },
    });

    const rollEnforced = Boolean(
      election?.registrationStart && election?.registrationEnd,
    );

    if (!rollEnforced) {
      return { admitted: true, rollEnforced: false, status: null };
    }

    const registration = await this.prisma.voterRegistration.findFirst({
      where: { userId, electionId, deletedAt: null },
      select: { status: true },
    });

    if (!registration) {
      return {
        admitted: false,
        rollEnforced: true,
        status: null,
        reason: 'You are not registered for this election.',
      };
    }

    if (registration.status !== VoterRegistrationStatus.APPROVED) {
      return {
        admitted: false,
        rollEnforced: true,
        status: registration.status,
        reason: `Your registration is ${registration.status} and has not yet been approved.`,
      };
    }

    return { admitted: true, rollEnforced: true, status: registration.status };
  }
}
