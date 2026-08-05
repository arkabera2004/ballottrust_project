import { BadRequestException, Injectable } from '@nestjs/common';
import { CandidateDocumentStatus } from '@prisma/client';

@Injectable()
export class CandidateDocumentStatusValidator {

  // ======================================================
  // Document Lifecycle Transition Map
  // ======================================================

  private readonly transitions:
    Partial<
      Record<
        CandidateDocumentStatus,
        CandidateDocumentStatus[]
      >
    > = {

      [CandidateDocumentStatus.PENDING]: [
        CandidateDocumentStatus.VERIFIED,
        CandidateDocumentStatus.REJECTED,
      ],

      [CandidateDocumentStatus.VERIFIED]: [],

      [CandidateDocumentStatus.REJECTED]: [],
    };

  // ======================================================
  // Validate Transition
  // ======================================================

  validateTransition(
    currentStatus: CandidateDocumentStatus,
    targetStatus: CandidateDocumentStatus,
  ): void {

    if (currentStatus === targetStatus) {
      throw new BadRequestException(
        `Candidate document is already in ${targetStatus} status.`,
      );
    }

    const allowedTransitions =
      this.transitions[currentStatus] ?? [];

    if (
      !allowedTransitions.includes(
        targetStatus,
      )
    ) {
      throw new BadRequestException(
        `Candidate document status cannot transition from ${currentStatus} to ${targetStatus}.`,
      );
    }
  }

  // ======================================================
  // Final State Check
  // ======================================================

  isFinalStatus(
    status: CandidateDocumentStatus,
  ): boolean {
    const finalStatuses:
      CandidateDocumentStatus[] = [
        CandidateDocumentStatus.VERIFIED,
        CandidateDocumentStatus.REJECTED,
      ];

    return finalStatuses.includes(
      status,
    );
  }
}