import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Role, VoterRegistrationSource } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { VoterRegistrationRepository } from '../repository/voter-registration.repository';
import { RegistrationWindowValidator } from '../validators/registration-window.validator';
import { AuditService } from '../../audit/audit.service';
import { RegisterVoterDto } from '../dto';

/**
 * Self-service registration: a signed-in voter enrols themselves on the
 * roll for an election whose registration window is open.
 */
@Injectable()
export class RegisterVoterService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly repository: VoterRegistrationRepository,

    private readonly registrationWindowValidator: RegistrationWindowValidator,

    private readonly auditService: AuditService,
  ) {}

  async execute(userId: string, dto: RegisterVoterDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.role !== Role.VOTER) {
      throw new ForbiddenException(
        'Only accounts with the VOTER role can register to vote.',
      );
    }

    if (!user.emailVerified) {
      throw new BadRequestException(
        'Verify your email address before registering to vote.',
      );
    }

    const election = await this.prisma.election.findFirst({
      where: { id: dto.electionId, deletedAt: null },
    });

    if (!election) {
      throw new NotFoundException('Election not found.');
    }

    this.registrationWindowValidator.validate(
      election.status,
      election.registrationStart,
      election.registrationEnd,
    );

    // The (userId, electionId) unique constraint also covers soft-deleted
    // rows, so a previously withdrawn registration is revived rather than
    // re-inserted.
    const existing =
      await this.repository.findByUserAndElectionIncludingDeleted(
        userId,
        dto.electionId,
      );

    if (existing && !existing.deletedAt) {
      throw new ConflictException(
        'You are already registered for this election.',
      );
    }

    const registration = existing
      ? await this.repository.update(existing.id, {
          deletedAt: null,
          status: 'PENDING',
          source: VoterRegistrationSource.SELF,
          registeredAt: new Date(),
          notes: dto.notes ?? null,
          verifiedBy: { disconnect: true },
          verifiedAt: null,
          approvedBy: { disconnect: true },
          approvedAt: null,
          rejectedBy: { disconnect: true },
          rejectedAt: null,
          rejectionReason: null,
        })
      : await this.repository.create({
          user: { connect: { id: userId } },
          election: { connect: { id: dto.electionId } },
          source: VoterRegistrationSource.SELF,
          notes: dto.notes,
        });

    await this.auditService.log({
      userId,
      action: 'VOTER_REGISTERED',
      module: 'voter',
      entityType: 'VoterRegistration',
      entityId: registration.id,
      result: 'SUCCESS',
      metadata: {
        electionId: dto.electionId,
        source: VoterRegistrationSource.SELF,
        revived: Boolean(existing),
      },
    });

    return registration;
  }
}
