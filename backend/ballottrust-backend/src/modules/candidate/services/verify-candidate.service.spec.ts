import {
  NotFoundException,
} from '@nestjs/common';

import {
  CandidateStatus,
} from '@prisma/client';

import {
  describe,
  it,
  beforeEach,
  expect,
  jest,
} from '@jest/globals';

import {
  VerifyCandidateService,
} from './verify-candidate.service';

import {
  CandidateRepository,
} from '../repository/candidate.repository';

import {
  CandidateStatusValidator,
} from '../validators/candidate-status.validator';

describe(
  'VerifyCandidateService',
  () => {
    let service: VerifyCandidateService;

    const findById = jest.fn(
      async (
        _candidateId: string,
      ): Promise<any> => null,
    );

    const update = jest.fn(
      async (
        _candidateId: string,
        _data: any,
      ): Promise<any> => null,
    );

    const validateTransition = jest.fn(
      (
        _currentStatus: CandidateStatus,
        _targetStatus: CandidateStatus,
      ): void => undefined,
    );

    const candidateRepository = {
      findById,
      update,
    };

    const candidateStatusValidator = {
      validateTransition,
    };

    beforeEach(() => {
      jest.clearAllMocks();

      service =
        new VerifyCandidateService(
          candidateRepository as unknown as CandidateRepository,
          candidateStatusValidator as unknown as CandidateStatusValidator,
        );
    });

    // ======================================================
    // 1. Successful Verification
    // ======================================================

    it(
      'should verify an existing candidate',
      async () => {
        const candidateId =
          '16d19b1c-0ef6-4692-8e8d-31870e900c15';

        const verifiedById =
          '8729d5c3-6bd9-4916-b141-dbbce38293ed';

        const candidate = {
          id: candidateId,
          status: CandidateStatus.PENDING,
        };

        const updatedCandidate = {
          id: candidateId,
          status: CandidateStatus.VERIFIED,
          verifiedById,
        };

        findById.mockResolvedValue(
          candidate,
        );

        validateTransition.mockReturnValue(
          undefined,
        );

        update.mockResolvedValue(
          updatedCandidate,
        );

        const result =
          await service.execute(
            candidateId,
            verifiedById,
          );

        expect(result).toEqual(
          updatedCandidate,
        );

        expect(
          findById,
        ).toHaveBeenCalledWith(
          candidateId,
        );

        expect(
          validateTransition,
        ).toHaveBeenCalledWith(
          CandidateStatus.PENDING,
          CandidateStatus.VERIFIED,
        );

        expect(
          update,
        ).toHaveBeenCalledWith(
          candidateId,
          expect.objectContaining({
            status:
              CandidateStatus.VERIFIED,

            verifiedBy: {
              connect: {
                id: verifiedById,
              },
            },

            verifiedAt:
              expect.any(Date),
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

        const verifiedById =
          '8729d5c3-6bd9-4916-b141-dbbce38293ed';

        findById.mockResolvedValue(
          null,
        );

        await expect(
          service.execute(
            candidateId,
            verifiedById,
          ),
        ).rejects.toThrow(
          NotFoundException,
        );

        expect(
          findById,
        ).toHaveBeenCalledWith(
          candidateId,
        );

        expect(
          validateTransition,
        ).not.toHaveBeenCalled();

        expect(
          update,
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

        const verifiedById =
          '8729d5c3-6bd9-4916-b141-dbbce38293ed';

        const candidate = {
          id: candidateId,
          status:
            CandidateStatus.APPROVED,
        };

        findById.mockResolvedValue(
          candidate,
        );

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
            verifiedById,
          ),
        ).rejects.toThrow(
          'Invalid candidate status transition.',
        );

        expect(
          validateTransition,
        ).toHaveBeenCalledWith(
          CandidateStatus.APPROVED,
          CandidateStatus.VERIFIED,
        );

        expect(
          update,
        ).not.toHaveBeenCalled();
      },
    );
  },
);
