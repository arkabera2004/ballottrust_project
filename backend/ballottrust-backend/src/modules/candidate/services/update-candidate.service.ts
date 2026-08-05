import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';


import { UpdateCandidateDto } from '../dto/update-candidate.dto';

import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateValidator } from '../validators/candidate.validator';
import { CandidateStatusValidator } from '../validators/candidate-status.validator';

@Injectable()
export class UpdateCandidateService {
  constructor(
  private readonly candidateRepository:
    CandidateRepository,

  private readonly candidateValidator:
    CandidateValidator,

  private readonly candidateStatusValidator:
    CandidateStatusValidator,
) {}

  async execute(
    candidateId: string,
    userId: string,
    dto: UpdateCandidateDto,
  ) {
    // ======================================================
    // 1. Find Candidate
    // ======================================================

    const candidate =
      await this.candidateRepository.findById(
        candidateId,
      );

    if (!candidate) {
      throw new NotFoundException(
        'Candidate not found.',
      );
    }

    // ======================================================
    // 2. Validate Ownership
    // ======================================================

    if (candidate.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own nomination.',
      );
    }

    // ======================================================
// 3. Validate Candidate Edit Lifecycle
// ======================================================

this.candidateStatusValidator
  .validateEditable(
    candidate.status,
  );

    // ======================================================
    // 4. Validate Election
    // ======================================================

    const election =
      await this.candidateValidator
        .validateElectionExists(
          candidate.electionId,
        );

    // ======================================================
    // 5. Validate Nomination Window
    // ======================================================

    this.candidateValidator
      .validateNominationWindow(
        election,
      );

    // ======================================================
    // 6. Resolve Effective Candidate Type / Party
    // ======================================================

    const effectiveCandidateType =
      dto.candidateType ??
      candidate.candidateType;

    let effectivePartyId:
      string | undefined;

    if (dto.partyId !== undefined) {
      effectivePartyId =
        dto.partyId;
    } else if (
      dto.candidateType !== undefined &&
      dto.candidateType !==
        candidate.candidateType
    ) {
      // When switching candidate type without supplying
      // a new party, do not silently reuse an old party.
      effectivePartyId =
        undefined;
    } else {
      effectivePartyId =
        candidate.partyId ??
        undefined;
    }

    // ======================================================
    // 7. Validate Candidate Type / Party
    // ======================================================

    await this.candidateValidator
      .validateCandidateType(
        effectiveCandidateType,
        effectivePartyId,
      );

    // ======================================================
    // 8. Update Nomination
    // ======================================================

    return this.candidateRepository.update(
      candidateId,
      {
        candidateType:
          effectiveCandidateType,

        party:
          effectivePartyId
            ? {
                connect: {
                  id: effectivePartyId,
                },
              }
            : {
                disconnect: true,
              },

        ...(dto.position !== undefined && {
  position:
    dto.position.trim(),
}),

        ...(dto.manifesto !== undefined && {
  manifesto:
    dto.manifesto.trim(),
}),

...(dto.agenda !== undefined && {
  agenda:
    dto.agenda.trim(),
}),

...(dto.achievements !== undefined && {
  achievements:
    dto.achievements.trim(),
}),

...(dto.nominationStatement !==
  undefined && {
  nominationStatement:
    dto.nominationStatement.trim(),
}),

        ...(dto.photoUrl !== undefined && {
  photoUrl:
    dto.photoUrl.trim(),
}),

...(dto.documentUrl !== undefined && {
  documentUrl:
    dto.documentUrl.trim(),
}),

      },
    );
  }
}