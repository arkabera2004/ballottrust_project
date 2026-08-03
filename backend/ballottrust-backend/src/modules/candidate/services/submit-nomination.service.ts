import { Injectable } from '@nestjs/common';

import {
  CandidateStatus,
} from '@prisma/client';

import { CreateCandidateDto } from '../dto/create-candidate.dto';

import { CandidateRepository } from '../repository/candidate.repository';

import { CandidateValidator } from '../validators/candidate.validator';

@Injectable()
export class SubmitNominationService {
  constructor(
    private readonly candidateRepository:
      CandidateRepository,

    private readonly candidateValidator:
      CandidateValidator,
  ) {}

  async execute(
    dto: CreateCandidateDto,
    userId: string,
  ) {
    // ======================================================
    // 1. Validate Election
    // ======================================================

    const election =
      await this.candidateValidator
        .validateElectionExists(
          dto.electionId,
        );

    // ======================================================
    // 2. Validate Nomination Window
    // ======================================================

    this.candidateValidator
      .validateNominationWindow(
        election,
      );

    // ======================================================
    // 3. Prevent Duplicate Nomination
    // ======================================================

    await this.candidateValidator
      .validateNoDuplicateNomination(
        userId,
        dto.electionId,
      );

    // ======================================================
    // 4. Validate Candidate Limit
    // ======================================================

    await this.candidateValidator
      .validateCandidateLimit(
        dto.electionId,
        election.candidateLimit,
      );

    // ======================================================
    // 5. Validate Candidate Type / Party
    // ======================================================

    await this.candidateValidator
      .validateCandidateType(
        dto.candidateType,
        dto.partyId,
      );

    // ======================================================
    // 6. Create Nomination
    // ======================================================

    return this.candidateRepository.create({
      electionId:
        dto.electionId,

      userId,

      candidateType:
        dto.candidateType,

      partyId:
        dto.partyId,

      position:
        dto.position,

      manifesto:
        dto.manifesto,

      agenda:
        dto.agenda,

      achievements:
        dto.achievements,

      nominationStatement:
        dto.nominationStatement,

      photoUrl:
        dto.photoUrl,

      documentUrl:
        dto.documentUrl,

      status:
        CandidateStatus.PENDING,

      submittedAt:
        new Date(),
    });
  }
}