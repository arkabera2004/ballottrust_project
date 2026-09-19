import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Role, VoterRegistrationSource } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { VoterRegistrationRepository } from '../repository/voter-registration.repository';
import { AuditService } from '../../audit/audit.service';
import { CreateVoterRegistrationDto } from '../dto';

/**
 * Admin-initiated registration. Unlike self-service this does not enforce
 * the registration window: administrators are expected to be able to add
 * a late or corrected entry to the roll.
 */
@Injectable()
export class CreateVoterRegistrationService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly repository: VoterRegistrationRepository,

    private readonly auditService: AuditService,
  ) {}

  async execute(dto: CreateVoterRegistrationDto, createdById: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: dto.userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.role !== Role.VOTER) {
      throw new BadRequestException(
        'Only accounts with the VOTER role can be added to a voter roll.',
      );
    }

    const election = await this.prisma.election.findFirst({
      where: { id: dto.electionId, deletedAt: null },
    });

    if (!election) {
      throw new NotFoundException('Election not found.');
    }

    const existing =
      await this.repository.findByUserAndElectionIncludingDeleted(
        dto.userId,
        dto.electionId,
      );

    if (existing && !existing.deletedAt) {
      throw new ConflictException(
        'This voter is already registered for the election.',
      );
    }

    const registration = existing
      ? await this.repository.update(existing.id, {
          deletedAt: null,
          status: 'PENDING',
          source: VoterRegistrationSource.ADMIN,
          registeredAt: new Date(),
          notes: dto.notes ?? null,
        })
      : await this.repository.create({
          user: { connect: { id: dto.userId } },
          election: { connect: { id: dto.electionId } },
          source: VoterRegistrationSource.ADMIN,
          notes: dto.notes,
        });

    await this.auditService.log({
      userId: createdById,
      action: 'VOTER_REGISTRATION_CREATED',
      module: 'voter',
      entityType: 'VoterRegistration',
      entityId: registration.id,
      result: 'SUCCESS',
      metadata: {
        electionId: dto.electionId,
        voterId: dto.userId,
        source: VoterRegistrationSource.ADMIN,
      },
    });

    return registration;
  }
}
