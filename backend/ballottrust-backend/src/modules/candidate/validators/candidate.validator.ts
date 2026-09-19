import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CandidateType, ElectionStatus, PartyStatus } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { CandidateRepository } from '../repository/candidate.repository';

@Injectable()
export class CandidateValidator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly candidateRepository: CandidateRepository,
  ) {}

  // ======================================================
  // Election Exists
  // ======================================================

  async validateElectionExists(electionId: string) {
    const election = await this.prisma.election.findFirst({
      where: {
        id: electionId,
        deletedAt: null,
      },
    });

    if (!election) {
      throw new NotFoundException('Election not found.');
    }

    return election;
  }

  // ======================================================
  // Election Accepts Nominations
  // ======================================================

  validateNominationWindow(election: {
    status: ElectionStatus;
    nominationStart: Date | null;
    nominationEnd: Date | null;
  }) {
    const now = new Date();

    if (election.status !== ElectionStatus.PUBLISHED) {
      throw new BadRequestException(
        'Nominations are not available for this election.',
      );
    }

    if (!election.nominationStart || !election.nominationEnd) {
      throw new BadRequestException(
        'Nomination period has not been configured for this election.',
      );
    }

    if (now < election.nominationStart) {
      throw new BadRequestException('Nomination period has not started yet.');
    }

    if (now > election.nominationEnd) {
      throw new BadRequestException('Nomination period has ended.');
    }
  }

  // ======================================================
  // Duplicate Nomination / Previous Record
  // ======================================================

  async validateNoDuplicateNomination(userId: string, electionId: string) {
    const existing = await this.candidateRepository.findByUserAndElection(
      userId,
      electionId,
    );

    if (existing && !existing.deletedAt) {
      throw new ConflictException(
        'You have already submitted a nomination for this election.',
      );
    }

    return existing;
  }

  // ======================================================
  // Candidate Limit
  // ======================================================

  async validateCandidateLimit(
    electionId: string,
    candidateLimit: number | null,
  ) {
    if (!candidateLimit || candidateLimit <= 0) {
      return;
    }

    const candidateCount = await this.candidateRepository.count({
      electionId,

      status: {
        in: ['PENDING', 'VERIFIED', 'APPROVED'],
      },
    });

    if (candidateCount >= candidateLimit) {
      throw new BadRequestException(
        'Candidate limit for this election has been reached.',
      );
    }
  }

  // ======================================================
  // Candidate Type / Party Validation
  // ======================================================

  async validateCandidateType(candidateType: CandidateType, partyId?: string) {
    if (candidateType === CandidateType.INDEPENDENT) {
      if (partyId) {
        throw new BadRequestException(
          'Independent candidates cannot be associated with a party.',
        );
      }

      return;
    }

    if (candidateType === CandidateType.PARTY) {
      if (!partyId) {
        throw new BadRequestException('Party candidates must provide a party.');
      }

      const party = await this.prisma.party.findFirst({
        where: {
          id: partyId,
          status: PartyStatus.ACTIVE,
          deletedAt: null,
        },
      });

      if (!party) {
        throw new NotFoundException('Active party not found.');
      }
    }
  }

  // ======================================================
  // Candidate Number
  // ======================================================

  async validateCandidateNumber(electionId: string, candidateNumber?: number) {
    if (candidateNumber === undefined) {
      return;
    }

    const exists = await this.candidateRepository.candidateNumberExists(
      electionId,
      candidateNumber,
    );

    if (exists) {
      throw new ConflictException(
        'Candidate number is already assigned in this election.',
      );
    }
  }
}
