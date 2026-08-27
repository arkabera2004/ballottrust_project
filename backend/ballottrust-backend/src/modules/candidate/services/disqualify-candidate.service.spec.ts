import { NotFoundException } from '@nestjs/common';
import { CandidateStatus } from '@prisma/client';

import {
  describe,
  it,
  beforeEach,
  expect,
  jest,
} from '@jest/globals';

import { DisqualifyCandidateService } from './disqualify-candidate.service';

import { CandidateRepository } from '../repository/candidate.repository';

import { CandidateStatusValidator } from '../validators/candidate-status.validator';
import { AuditService } from '../../audit/audit.service';

describe('DisqualifyCandidateService', () => {
  let service: DisqualifyCandidateService;

  const candidateRepository = {
    findById: jest.fn<
      (
        candidateId: string,
      ) => Promise<{
        id: string;
        status: CandidateStatus;
      } | null>
    >(),

    update: jest.fn<
      (
        candidateId: string,
        data: unknown,
      ) => Promise<unknown>
    >(),
  };

  const candidateStatusValidator = {
    validateTransition: jest.fn<
      (
        currentStatus: CandidateStatus,
        targetStatus: CandidateStatus,
      ) => void
    >(),
  };

  const auditService = {
    log: jest.fn<(...args: any[]) => any>(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service =
      new DisqualifyCandidateService(
        candidateRepository as unknown as CandidateRepository,
        candidateStatusValidator as unknown as CandidateStatusValidator,
        auditService as unknown as AuditService,
      );
  });

  // ======================================================
  // 1. Successful Disqualification
  // ======================================================

  it(
    'should disqualify an existing candidate',
    async () => {
      const candidateId =
        '16d19b1c-0ef6-4692-8e8d-31870e900c15';

      const disqualifiedById =
        '8729d5c3-6bd9-4916-b141-dbbce38293ed';

      const reason =
        '  Candidate violated election rules.  ';

      const candidate = {
        id: candidateId,
        status: CandidateStatus.APPROVED,
      };

      const updatedCandidate = {
        id: candidateId,
        status:
          CandidateStatus.DISQUALIFIED,
        disqualifiedById,
        disqualificationReason:
          'Candidate violated election rules.',
      };

      candidateRepository.findById
        .mockResolvedValue(candidate);

      candidateStatusValidator
        .validateTransition
        .mockReturnValue(undefined);

      candidateRepository.update
        .mockResolvedValue(
          updatedCandidate,
        );

      const result =
        await service.execute(
          candidateId,
          disqualifiedById,
          reason,
        );

      expect(result).toEqual(
        updatedCandidate,
      );

      expect(
        candidateRepository.findById,
      ).toHaveBeenCalledWith(
        candidateId,
      );

      expect(
        candidateStatusValidator
          .validateTransition,
      ).toHaveBeenCalledWith(
        CandidateStatus.APPROVED,
        CandidateStatus.DISQUALIFIED,
      );

      expect(
        candidateRepository.update,
      ).toHaveBeenCalledWith(
        candidateId,
        expect.objectContaining({
          status:
            CandidateStatus.DISQUALIFIED,

          disqualifiedBy: {
            connect: {
              id: disqualifiedById,
            },
          },

          disqualifiedAt:
            expect.any(Date),

          disqualificationReason:
            'Candidate violated election rules.',
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

      const disqualifiedById =
        '8729d5c3-6bd9-4916-b141-dbbce38293ed';

      const reason =
        'Election rule violation';

      candidateRepository.findById
        .mockResolvedValue(null);

      await expect(
        service.execute(
          candidateId,
          disqualifiedById,
          reason,
        ),
      ).rejects.toThrow(
        NotFoundException,
      );

      expect(
        candidateRepository.findById,
      ).toHaveBeenCalledWith(
        candidateId,
      );

      expect(
        candidateStatusValidator
          .validateTransition,
      ).not.toHaveBeenCalled();

      expect(
        candidateRepository.update,
      ).not.toHaveBeenCalled();
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

      const disqualifiedById =
        '8729d5c3-6bd9-4916-b141-dbbce38293ed';

      const reason =
        'Election rule violation';

      const candidate = {
        id: candidateId,
        status:
          CandidateStatus.REJECTED,
      };

      candidateRepository.findById
        .mockResolvedValue(candidate);

      candidateStatusValidator
        .validateTransition
        .mockImplementation(() => {
          throw new Error(
            'Invalid candidate status transition.',
          );
        });

      await expect(
        service.execute(
          candidateId,
          disqualifiedById,
          reason,
        ),
      ).rejects.toThrow(
        'Invalid candidate status transition.',
      );

      expect(
        candidateStatusValidator
          .validateTransition,
      ).toHaveBeenCalledWith(
        CandidateStatus.REJECTED,
        CandidateStatus.DISQUALIFIED,
      );

      expect(
        candidateRepository.update,
      ).not.toHaveBeenCalled();
    },
  );

  // ======================================================
  // 4. Disqualification Reason Must Be Trimmed
  // ======================================================

  it(
    'should trim the disqualification reason before updating the candidate',
    async () => {
      const candidateId =
        '16d19b1c-0ef6-4692-8e8d-31870e900c15';

      const disqualifiedById =
        '8729d5c3-6bd9-4916-b141-dbbce38293ed';

      const reason =
        '   Candidate violated campaign rules.   ';

      const candidate = {
        id: candidateId,
        status:
          CandidateStatus.APPROVED,
      };

      candidateRepository.findById
        .mockResolvedValue(candidate);

      candidateStatusValidator
        .validateTransition
        .mockReturnValue(undefined);

      candidateRepository.update
        .mockResolvedValue({
          id: candidateId,
          status:
            CandidateStatus.DISQUALIFIED,
        });

      await service.execute(
        candidateId,
        disqualifiedById,
        reason,
      );

      expect(
        candidateRepository.update,
      ).toHaveBeenCalledWith(
        candidateId,
        expect.objectContaining({
          disqualificationReason:
            'Candidate violated campaign rules.',
        }),
      );
    },
  );
});