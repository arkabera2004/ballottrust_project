import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { Role } from '@prisma/client';

import { GetCandidateService } from './get-candidate.service';
import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateProfileCompletenessService } from './candidate-profile-completeness.service';
import { CandidateDocumentCompletenessService } from '../documents/services/candidate-document-completeness.service';

describe('GetCandidateService', () => {
  let service: GetCandidateService;

  const candidateRepository = {
    findByIdWithDetails: jest.fn(),
  };

  const candidateProfileCompletenessService = {
    calculate: jest.fn(),
  };

  const candidateDocumentCompletenessService = {
    calculate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new GetCandidateService(
      candidateRepository as unknown as CandidateRepository,
      candidateProfileCompletenessService as unknown as CandidateProfileCompletenessService,
      candidateDocumentCompletenessService as unknown as CandidateDocumentCompletenessService,
    );
  });

  // ======================================================
  // 1. Administrator Access
  // ======================================================

  it('should allow a SUPER_ADMIN to view any candidate', async () => {
    const candidateId =
      '16d19b1c-0ef6-4692-8e8d-31870e900c15';

    const adminUserId =
      '8729d5c3-6bd9-4916-b141-dbbce38293ed';

    const candidate = {
      id: candidateId,
      userId:
        'f6688bb1-a3e4-4d49-8fe6-3c2549288298',
      status: 'APPROVED',
      position: 'Security Test Representative',
    };

    const profileCompleteness = {
      percentage: 80,
      completed: 8,
      total: 10,
    };

    const documentCompleteness = {
      percentage: 100,
      completed: 4,
      total: 4,
    };

    candidateRepository.findByIdWithDetails.mockResolvedValue(
      candidate,
    );

    candidateProfileCompletenessService.calculate.mockReturnValue(
      profileCompleteness,
    );

    candidateDocumentCompletenessService.calculate.mockResolvedValue(
      documentCompleteness,
    );

    const result = await service.execute(
      candidateId,
      adminUserId,
      Role.SUPER_ADMIN,
    );

    expect(result).toEqual({
      ...candidate,
      profileCompleteness,
      documentCompleteness,
    });

    expect(
      candidateRepository.findByIdWithDetails,
    ).toHaveBeenCalledWith(candidateId);

    expect(
      candidateProfileCompletenessService.calculate,
    ).toHaveBeenCalledWith(candidate);

    expect(
      candidateDocumentCompletenessService.calculate,
    ).toHaveBeenCalledWith(candidate.id);
  });

  // ======================================================
  // 2. Election Commissioner Access
  // ======================================================

  it('should allow an ELECTION_COMMISSIONER to view any candidate', async () => {
    const candidateId =
      '16d19b1c-0ef6-4692-8e8d-31870e900c15';

    const commissionerId =
      '8729d5c3-6bd9-4916-b141-dbbce38293ed';

    const candidate = {
      id: candidateId,
      userId:
        'f6688bb1-a3e4-4d49-8fe6-3c2549288298',
      status: 'APPROVED',
    };

    const profileCompleteness = {
      percentage: 90,
    };

    const documentCompleteness = {
      percentage: 75,
    };

    candidateRepository.findByIdWithDetails.mockResolvedValue(
      candidate,
    );

    candidateProfileCompletenessService.calculate.mockReturnValue(
      profileCompleteness,
    );

    candidateDocumentCompletenessService.calculate.mockResolvedValue(
      documentCompleteness,
    );

    const result = await service.execute(
      candidateId,
      commissionerId,
      Role.ELECTION_COMMISSIONER,
    );

    expect(result).toEqual({
      ...candidate,
      profileCompleteness,
      documentCompleteness,
    });

    expect(
      candidateProfileCompletenessService.calculate,
    ).toHaveBeenCalledWith(candidate);

    expect(
      candidateDocumentCompletenessService.calculate,
    ).toHaveBeenCalledWith(candidate.id);
  });

  // ======================================================
  // 3. Candidate Owner Access
  // ======================================================

  it('should allow the candidate owner to view their own candidate record', async () => {
    const candidateId =
      '16d19b1c-0ef6-4692-8e8d-31870e900c15';

    const ownerUserId =
      'f6688bb1-a3e4-4d49-8fe6-3c2549288298';

    const candidate = {
      id: candidateId,
      userId: ownerUserId,
      status: 'APPROVED',
    };

    const profileCompleteness = {
      percentage: 100,
    };

    const documentCompleteness = {
      percentage: 100,
    };

    candidateRepository.findByIdWithDetails.mockResolvedValue(
      candidate,
    );

    candidateProfileCompletenessService.calculate.mockReturnValue(
      profileCompleteness,
    );

    candidateDocumentCompletenessService.calculate.mockResolvedValue(
      documentCompleteness,
    );

    const result = await service.execute(
      candidateId,
      ownerUserId,
      Role.CANDIDATE,
    );

    expect(result).toEqual({
      ...candidate,
      profileCompleteness,
      documentCompleteness,
    });

    expect(
      candidateRepository.findByIdWithDetails,
    ).toHaveBeenCalledWith(candidateId);
  });

  // ======================================================
  // 4. Unauthorized Access
  // ======================================================

  it('should reject a non-owner non-administrator', async () => {
    const candidateId =
      '16d19b1c-0ef6-4692-8e8d-31870e900c15';

    const candidateOwnerId =
      'f6688bb1-a3e4-4d49-8fe6-3c2549288298';

    const otherUserId =
      'b66ce850-ca5b-4314-98c2-0f645b77176a';

    const candidate = {
      id: candidateId,
      userId: candidateOwnerId,
      status: 'APPROVED',
    };

    candidateRepository.findByIdWithDetails.mockResolvedValue(
      candidate,
    );

    await expect(
      service.execute(
        candidateId,
        otherUserId,
        Role.CANDIDATE,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(
      candidateRepository.findByIdWithDetails,
    ).toHaveBeenCalledWith(candidateId);

    expect(
      candidateProfileCompletenessService.calculate,
    ).not.toHaveBeenCalled();

    expect(
      candidateDocumentCompletenessService.calculate,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 5. Candidate Not Found
  // ======================================================

  it('should throw NotFoundException when candidate does not exist', async () => {
    const candidateId =
      '16d19b1c-0ef6-4692-8e8d-31870e900c15';

    const userId =
      'f6688bb1-a3e4-4d49-8fe6-3c2549288298';

    candidateRepository.findByIdWithDetails.mockResolvedValue(
      null,
    );

    await expect(
      service.execute(
        candidateId,
        userId,
        Role.CANDIDATE,
      ),
    ).rejects.toThrow(NotFoundException);

    expect(
      candidateRepository.findByIdWithDetails,
    ).toHaveBeenCalledWith(candidateId);

    expect(
      candidateProfileCompletenessService.calculate,
    ).not.toHaveBeenCalled();

    expect(
      candidateDocumentCompletenessService.calculate,
    ).not.toHaveBeenCalled();
  });
});