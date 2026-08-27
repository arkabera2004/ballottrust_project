import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { CandidateStatus } from '@prisma/client';

import { WithdrawCandidateService } from './withdraw-candidate.service';
import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateStatusValidator } from '../validators/candidate-status.validator';
import { AuditService } from '../../audit/audit.service';

describe('WithdrawCandidateService', () => {
  let service: WithdrawCandidateService;

  const candidateRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const candidateStatusValidator = {
    validateTransition: jest.fn(),
  };

  const auditService = {
    log: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new WithdrawCandidateService(
      candidateRepository as unknown as CandidateRepository,
      candidateStatusValidator as unknown as CandidateStatusValidator,
      auditService as unknown as AuditService,
    );
  });

  // ======================================================
  // 1. Successful Withdrawal
  // ======================================================

  it('should withdraw an existing candidate owned by the user', async () => {
    const candidateId =
      '16d19b1c-0ef6-4692-8e8d-31870e900c15';

    const userId =
      'f6688bb1-a3e4-4d49-8fe6-3c2549288298';

    const reason =
      '  I am withdrawing my nomination voluntarily.  ';

    const candidate = {
      id: candidateId,
      userId,
      status: CandidateStatus.APPROVED,
    };

    const updatedCandidate = {
      id: candidateId,
      status: CandidateStatus.WITHDRAWN,
      withdrawalReason:
        'I am withdrawing my nomination voluntarily.',
    };

    candidateRepository.findById.mockResolvedValue(
      candidate,
    );

    candidateStatusValidator.validateTransition.mockReturnValue(
      undefined,
    );

    candidateRepository.update.mockResolvedValue(
      updatedCandidate,
    );

    const result = await service.execute(
      candidateId,
      userId,
      reason,
    );

    expect(result).toEqual(updatedCandidate);

    expect(
      candidateRepository.findById,
    ).toHaveBeenCalledWith(candidateId);

    expect(
      candidateStatusValidator.validateTransition,
    ).toHaveBeenCalledWith(
      CandidateStatus.APPROVED,
      CandidateStatus.WITHDRAWN,
    );

    expect(
      candidateRepository.update,
    ).toHaveBeenCalledWith(
      candidateId,
      expect.objectContaining({
        status: CandidateStatus.WITHDRAWN,
        withdrawnAt: expect.any(Date),
        withdrawalReason:
          'I am withdrawing my nomination voluntarily.',
      }),
    );
  });

  // ======================================================
  // 2. Candidate Not Found
  // ======================================================

  it('should throw NotFoundException when candidate does not exist', async () => {
    const candidateId =
      '16d19b1c-0ef6-4692-8e8d-31870e900c15';

    const userId =
      'f6688bb1-a3e4-4d49-8fe6-3c2549288298';

    const reason = 'Voluntary withdrawal';

    candidateRepository.findById.mockResolvedValue(
      null,
    );

    await expect(
      service.execute(
        candidateId,
        userId,
        reason,
      ),
    ).rejects.toThrow(NotFoundException);

    expect(
      candidateRepository.findById,
    ).toHaveBeenCalledWith(candidateId);

    expect(
      candidateStatusValidator.validateTransition,
    ).not.toHaveBeenCalled();

    expect(
      candidateRepository.update,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 3. Ownership Validation
  // ======================================================

  it('should reject withdrawal when the candidate belongs to another user', async () => {
    const candidateId =
      '16d19b1c-0ef6-4692-8e8d-31870e900c15';

    const ownerUserId =
      'f6688bb1-a3e4-4d49-8fe6-3c2549288298';

    const requestingUserId =
      'b66ce850-ca5b-4314-98c2-0f645b77176a';

    const reason = 'Voluntary withdrawal';

    const candidate = {
      id: candidateId,
      userId: ownerUserId,
      status: CandidateStatus.APPROVED,
    };

    candidateRepository.findById.mockResolvedValue(
      candidate,
    );

    await expect(
      service.execute(
        candidateId,
        requestingUserId,
        reason,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(
      candidateRepository.findById,
    ).toHaveBeenCalledWith(candidateId);

    expect(
      candidateStatusValidator.validateTransition,
    ).not.toHaveBeenCalled();

    expect(
      candidateRepository.update,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 4. Invalid Lifecycle Transition
  // ======================================================

  it('should reject an invalid lifecycle transition', async () => {
    const candidateId =
      '16d19b1c-0ef6-4692-8e8d-31870e900c15';

    const userId =
      'f6688bb1-a3e4-4d49-8fe6-3c2549288298';

    const reason = 'Voluntary withdrawal';

    const candidate = {
      id: candidateId,
      userId,
      status: CandidateStatus.REJECTED,
    };

    candidateRepository.findById.mockResolvedValue(
      candidate,
    );

    candidateStatusValidator.validateTransition.mockImplementation(
      () => {
        throw new Error(
          'Invalid candidate status transition.',
        );
      },
    );

    await expect(
      service.execute(
        candidateId,
        userId,
        reason,
      ),
    ).rejects.toThrow(
      'Invalid candidate status transition.',
    );

    expect(
      candidateStatusValidator.validateTransition,
    ).toHaveBeenCalledWith(
      CandidateStatus.REJECTED,
      CandidateStatus.WITHDRAWN,
    );

    expect(
      candidateRepository.update,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 5. Withdrawal Reason Must Be Trimmed
  // ======================================================

  it('should trim the withdrawal reason before updating the candidate', async () => {
    const candidateId =
      '16d19b1c-0ef6-4692-8e8d-31870e900c15';

    const userId =
      'f6688bb1-a3e4-4d49-8fe6-3c2549288298';

    const reason =
      '   Personal circumstances require withdrawal.   ';

    const candidate = {
      id: candidateId,
      userId,
      status: CandidateStatus.APPROVED,
    };

    candidateRepository.findById.mockResolvedValue(
      candidate,
    );

    candidateStatusValidator.validateTransition.mockReturnValue(
      undefined,
    );

    candidateRepository.update.mockResolvedValue({
      id: candidateId,
      status: CandidateStatus.WITHDRAWN,
    });

    await service.execute(
      candidateId,
      userId,
      reason,
    );

    expect(
      candidateRepository.update,
    ).toHaveBeenCalledWith(
      candidateId,
      expect.objectContaining({
        withdrawalReason:
          'Personal circumstances require withdrawal.',
      }),
    );
  });
});