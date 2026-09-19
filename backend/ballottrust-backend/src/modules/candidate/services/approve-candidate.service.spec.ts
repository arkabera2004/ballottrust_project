import { NotFoundException } from '@nestjs/common';
import { CandidateStatus } from '@prisma/client';
import { describe, it, beforeEach, expect, jest } from '@jest/globals';

import { ApproveCandidateService } from './approve-candidate.service';
import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateStatusValidator } from '../validators/candidate-status.validator';
import { AuditService } from '../../audit/audit.service';

describe('ApproveCandidateService', () => {
  let service: ApproveCandidateService;

  const candidateRepository = {
    findById: jest.fn<(...args: any[]) => any>(),
    update: jest.fn<(...args: any[]) => any>(),
  };

  const candidateStatusValidator = {
    validateTransition: jest.fn<(...args: any[]) => any>(),
  };

  const auditService = {
    log: jest.fn<(...args: any[]) => any>(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new ApproveCandidateService(
      candidateRepository as unknown as CandidateRepository,
      candidateStatusValidator as unknown as CandidateStatusValidator,
      auditService as unknown as AuditService,
    );
  });

  // ======================================================
  // 1. Successful Approval
  // ======================================================

  it('should approve an existing candidate', async () => {
    const candidateId = '16d19b1c-0ef6-4692-8e8d-31870e900c15';

    const approvedById = '8729d5c3-6bd9-4916-b141-dbbce38293ed';

    const candidate = {
      id: candidateId,
      status: CandidateStatus.VERIFIED,
    };

    const updatedCandidate = {
      id: candidateId,
      status: CandidateStatus.APPROVED,
      approvedById,
    };

    candidateRepository.findById.mockResolvedValue(candidate);

    candidateStatusValidator.validateTransition.mockReturnValue(undefined);

    candidateRepository.update.mockResolvedValue(updatedCandidate);

    const result = await service.execute(candidateId, approvedById);

    expect(result).toEqual(updatedCandidate);

    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: approvedById,
        action: 'CANDIDATE_APPROVED',
        entityId: candidateId,
        result: 'SUCCESS',
      }),
    );

    expect(candidateRepository.findById).toHaveBeenCalledWith(candidateId);

    expect(candidateStatusValidator.validateTransition).toHaveBeenCalledWith(
      CandidateStatus.VERIFIED,
      CandidateStatus.APPROVED,
    );

    expect(candidateRepository.update).toHaveBeenCalledWith(
      candidateId,
      expect.objectContaining({
        status: CandidateStatus.APPROVED,
        approvedBy: {
          connect: {
            id: approvedById,
          },
        },
        approvedAt: expect.any(Date),
      }),
    );
  });

  // ======================================================
  // 2. Candidate Not Found
  // ======================================================

  it('should throw NotFoundException when candidate does not exist', async () => {
    const candidateId = '16d19b1c-0ef6-4692-8e8d-31870e900c15';

    const approvedById = '8729d5c3-6bd9-4916-b141-dbbce38293ed';

    candidateRepository.findById.mockResolvedValue(null);

    await expect(service.execute(candidateId, approvedById)).rejects.toThrow(
      NotFoundException,
    );

    expect(candidateRepository.findById).toHaveBeenCalledWith(candidateId);

    expect(candidateStatusValidator.validateTransition).not.toHaveBeenCalled();

    expect(candidateRepository.update).not.toHaveBeenCalled();
  });

  // ======================================================
  // 3. Invalid Lifecycle Transition
  // ======================================================

  it('should reject an invalid lifecycle transition', async () => {
    const candidateId = '16d19b1c-0ef6-4692-8e8d-31870e900c15';

    const approvedById = '8729d5c3-6bd9-4916-b141-dbbce38293ed';

    const candidate = {
      id: candidateId,
      status: CandidateStatus.PENDING,
    };

    candidateRepository.findById.mockResolvedValue(candidate);

    candidateStatusValidator.validateTransition.mockImplementation(() => {
      throw new Error('Invalid candidate status transition.');
    });

    await expect(service.execute(candidateId, approvedById)).rejects.toThrow(
      'Invalid candidate status transition.',
    );

    expect(candidateStatusValidator.validateTransition).toHaveBeenCalledWith(
      CandidateStatus.PENDING,
      CandidateStatus.APPROVED,
    );

    expect(candidateRepository.update).not.toHaveBeenCalled();
  });
});
