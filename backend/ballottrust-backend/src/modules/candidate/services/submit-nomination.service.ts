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

    const existingCandidate =
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
// 6. Restore Previously Cancelled Nomination
// ======================================================

if (
  existingCandidate &&
  existingCandidate.deletedAt
) {
  return this.candidateRepository.update(
    existingCandidate.id,
    {
      candidateType:
        dto.candidateType,

      party:
        dto.partyId
          ? {
              connect: {
                id: dto.partyId,
              },
            }
          : {
              disconnect: true,
            },

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

      deletedAt:
        null,

      // Reset verification workflow
      verifiedBy: {
        disconnect: true,
      },

      verifiedAt:
        null,

      // Reset approval workflow
      approvedBy: {
        disconnect: true,
      },

      approvedAt:
        null,

      // Reset rejection workflow
      rejectedBy: {
        disconnect: true,
      },

      rejectionReason:
        null,

      rejectedAt:
        null,

      // Reset withdrawal workflow
      withdrawnAt:
        null,

      withdrawalReason:
        null,

      // Reset disqualification workflow
      disqualifiedBy: {
        disconnect: true,
      },

      disqualifiedAt:
        null,

      disqualificationReason:
        null,

      // Reset ballot assignment
      candidateNumber:
        null,

      ballotOrder:
        null,
    },
  );
}

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
  dto.position.trim(),

      // ======================================================
// Candidate Profile
// ======================================================

      biography:
        dto.biography?.trim(),

      campaignSlogan:
        dto.campaignSlogan?.trim(),

      campaignWebsite:
        dto.campaignWebsite?.trim(),

      manifesto:
        dto.manifesto?.trim(),

      agenda:
        dto.agenda?.trim(),

      achievements:
        dto.achievements?.trim(),

      nominationStatement:
        dto.nominationStatement.trim(),

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