import { NotFoundException } from '@nestjs/common';
import { CandidateStatus } from '@prisma/client';

import {
  describe,
  it,
  beforeEach,
  expect,
  jest,
} from '@jest/globals';

import { RejectCandidateService } from './reject-candidate.service';

import { CandidateRepository } from '../repository/candidate.repository';

import { CandidateStatusValidator } from '../validators/candidate-status.validator';
import { AuditService } from '../../audit/audit.service';

describe('RejectCandidateService', () => {
  let service: RejectCandidateService;

  const findById =
    jest.fn<
      (candidateId: string) => Promise<any>
    >();

  const update =
    jest.fn<
      (
        candidateId: string,
        data: any,
      ) => Promise<any>
    >();

  const validateTransition =
    jest.fn<
      (
        currentStatus: CandidateStatus,
        targetStatus: CandidateStatus,
      ) => void
    >();

  const candidateRepository = {
    findById,
    update,
  };

  const candidateStatusValidator = {
    validateTransition,
  };

  const auditService = {
    log: jest.fn<(...args: any[]) => any>(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new RejectCandidateService(
      candidateRepository as unknown as CandidateRepository,
      candidateStatusValidator as unknown as CandidateStatusValidator,
      auditService as unknown as AuditService,
    );
  });

  // ======================================================
  // 1. Successful Rejection
  // ======================================================

  it(
    'should reject an existing candidate',
    async () => {
      const candidateId =
        '16d19b1c-0ef6-4692-8e8d-31870e900c15';

      const rejectedById =
        '8729d5c3-6bd9-4916-b141-dbbce38293ed';

      const reason =
        '  Required eligibility document was not valid.  ';

      const candidate = {
        id: candidateId,
        status: CandidateStatus.VERIFIED,
      };

      const updatedCandidate = {
        id: candidateId,
        status: CandidateStatus.REJECTED,
        rejectedById,
        rejectionReason:
          'Required eligibility document was not valid.',
      };

      findById.mockResolvedValue(candidate);

      validateTransition.mockReturnValue(
        undefined,
      );

      update.mockResolvedValue(
        updatedCandidate,
      );

      const result = await service.execute(
        candidateId,
        rejectedById,
        reason,
      );

      expect(result).toEqual(
        updatedCandidate,
      );

      expect(findById).toHaveBeenCalledWith(
        candidateId,
      );

      expect(
        validateTransition,
      ).toHaveBeenCalledWith(
        CandidateStatus.VERIFIED,
        CandidateStatus.REJECTED,
      );

      expect(update).toHaveBeenCalledWith(
        candidateId,
        expect.objectContaining({
          status:
            CandidateStatus.REJECTED,

          rejectedBy: {
            connect: {
              id: rejectedById,
            },
          },

          rejectionReason:
            'Required eligibility document was not valid.',

          rejectedAt:
            expect.any(Date),
        }),
      );

      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: rejectedById,
          action: 'CANDIDATE_REJECTED',
          entityId: candidateId,
          result: 'SUCCESS',
        }),
      );
    },
  );

  // ======================================================
  // 2. Candidate Not Found
  // ======================================================

  it(
    'should throw NotFoundException when candidate does not exist',
    async () => {
      const candidateId =
        '16d19b1c-0ef6-4692-8e8d-31870e900c15';

      const rejectedById =
        '8729d5c3-6bd9-4916-b141-dbbce38293ed';

      const reason =
        'Invalid documentation';

      findById.mockResolvedValue(null);

      await expect(
        service.execute(
          candidateId,
          rejectedById,
          reason,
        ),
      ).rejects.toThrow(
        NotFoundException,
      );

      expect(findById).toHaveBeenCalledWith(
        candidateId,
      );

      expect(
        validateTransition,
      ).not.toHaveBeenCalled();

      expect(update).not.toHaveBeenCalled();
    },
  );

  // ======================================================
  // 3. Invalid Lifecycle Transition
  // ======================================================

  it(
    'should reject an invalid lifecycle transition',
    async () => {
      const candidateId =
        '16d19b1c-0ef6-4692-8e8d-31870e900c15';

      const rejectedById =
        '8729d5c3-6bd9-4916-b141-dbbce38293ed';

      const reason =
        'Invalid documentation';

      const candidate = {
        id: candidateId,
        status: CandidateStatus.APPROVED,
      };

      findById.mockResolvedValue(candidate);

      validateTransition.mockImplementation(
        () => {
          throw new Error(
            'Invalid candidate status transition.',
          );
        },
      );

      await expect(
        service.execute(
          candidateId,
          rejectedById,
          reason,
        ),
      ).rejects.toThrow(
        'Invalid candidate status transition.',
      );

      expect(
        validateTransition,
      ).toHaveBeenCalledWith(
        CandidateStatus.APPROVED,
        CandidateStatus.REJECTED,
      );

      expect(update).not.toHaveBeenCalled();
    },
  );

  // ======================================================
  // 4. Rejection Reason Must Be Trimmed
  // ======================================================

  it(
    'should trim the rejection reason before updating the candidate',
    async () => {
      const candidateId =
        '16d19b1c-0ef6-4692-8e8d-31870e900c15';

      const rejectedById =
        '8729d5c3-6bd9-4916-b141-dbbce38293ed';

      const reason =
        '   Candidate failed eligibility verification.   ';

      const candidate = {
        id: candidateId,
        status: CandidateStatus.VERIFIED,
      };

      findById.mockResolvedValue(candidate);

      validateTransition.mockReturnValue(
        undefined,
      );

      update.mockResolvedValue({
        id: candidateId,
        status: CandidateStatus.REJECTED,
      });

      await service.execute(
        candidateId,
        rejectedById,
        reason,
      );

      expect(update).toHaveBeenCalledWith(
        candidateId,
        expect.objectContaining({
          rejectionReason:
            'Candidate failed eligibility verification.',
        }),
      );
    },
  );
});