import { Role, CandidateStatus } from '@prisma/client';

import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { GetCandidateService } from './get-candidate.service';
import { WithdrawCandidateService } from './withdraw-candidate.service';

import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateProfileCompletenessService } from './candidate-profile-completeness.service';
import { CandidateDocumentCompletenessService } from '../documents/services/candidate-document-completeness.service';
import { CandidateStatusValidator } from '../validators/candidate-status.validator';
import { AuditService } from '../../audit/audit.service';

describe('Candidate Ownership Authorization', () => {
  // ============================================================
  // GET CANDIDATE
  // ============================================================

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

    // ============================================================
    // OWNER ACCESS
    // ============================================================

    it('should allow the candidate owner to view their own candidate record', async () => {
      const candidate = {
        id: 'candidate-1',
        userId: 'user-1',
        status: CandidateStatus.PENDING,
      };

      candidateRepository.findByIdWithDetails.mockResolvedValue(
        candidate,
      );

      candidateProfileCompletenessService.calculate.mockReturnValue(
        80,
      );

      candidateDocumentCompletenessService.calculate.mockResolvedValue(
        60,
      );

      const result = await service.execute(
        'candidate-1',
        'user-1',
        Role.CANDIDATE,
      );

      expect(result).toEqual({
        ...candidate,
        profileCompleteness: 80,
        documentCompleteness: 60,
      });
    });

    // ============================================================
    // SUPER ADMIN ACCESS
    // ============================================================

    it('should allow SUPER_ADMIN to view another user candidate record', async () => {
      const candidate = {
        id: 'candidate-1',
        userId: 'candidate-owner',
        status: CandidateStatus.PENDING,
      };

      candidateRepository.findByIdWithDetails.mockResolvedValue(
        candidate,
      );

      candidateProfileCompletenessService.calculate.mockReturnValue(
        90,
      );

      candidateDocumentCompletenessService.calculate.mockResolvedValue(
        100,
      );

      const result = await service.execute(
        'candidate-1',
        'admin-1',
        Role.SUPER_ADMIN,
      );

      expect(result).toEqual({
        ...candidate,
        profileCompleteness: 90,
        documentCompleteness: 100,
      });
    });

    // ============================================================
    // ELECTION COMMISSIONER ACCESS
    // ============================================================

    it('should allow ELECTION_COMMISSIONER to view another user candidate record', async () => {
      const candidate = {
        id: 'candidate-1',
        userId: 'candidate-owner',
        status: CandidateStatus.VERIFIED,
      };

      candidateRepository.findByIdWithDetails.mockResolvedValue(
        candidate,
      );

      candidateProfileCompletenessService.calculate.mockReturnValue(
        75,
      );

      candidateDocumentCompletenessService.calculate.mockResolvedValue(
        80,
      );

      const result = await service.execute(
        'candidate-1',
        'commissioner-1',
        Role.ELECTION_COMMISSIONER,
      );

      expect(result).toEqual({
        ...candidate,
        profileCompleteness: 75,
        documentCompleteness: 80,
      });
    });

    // ============================================================
    // CROSS-USER ACCESS
    // ============================================================

    it('should reject another candidate from viewing the candidate record', async () => {
      const candidate = {
        id: 'candidate-1',
        userId: 'owner-user',
        status: CandidateStatus.PENDING,
      };

      candidateRepository.findByIdWithDetails.mockResolvedValue(
        candidate,
      );

      await expect(
        service.execute(
          'candidate-1',
          'different-user',
          Role.CANDIDATE,
        ),
      ).rejects.toThrow(
        'You are not authorized to view this candidate record.',
      );

      expect(
        candidateProfileCompletenessService.calculate,
      ).not.toHaveBeenCalled();

      expect(
        candidateDocumentCompletenessService.calculate,
      ).not.toHaveBeenCalled();
    });

    // ============================================================
    // VOTER ACCESS
    // ============================================================

    it('should reject a VOTER from viewing another user candidate record', async () => {
      const candidate = {
        id: 'candidate-1',
        userId: 'candidate-owner',
        status: CandidateStatus.APPROVED,
      };

      candidateRepository.findByIdWithDetails.mockResolvedValue(
        candidate,
      );

      await expect(
        service.execute(
          'candidate-1',
          'voter-1',
          Role.VOTER,
        ),
      ).rejects.toThrow(
        ForbiddenException,
      );

      expect(
        candidateProfileCompletenessService.calculate,
      ).not.toHaveBeenCalled();

      expect(
        candidateDocumentCompletenessService.calculate,
      ).not.toHaveBeenCalled();
    });

    // ============================================================
    // NOT FOUND
    // ============================================================

    it('should reject when the candidate does not exist', async () => {
      candidateRepository.findByIdWithDetails.mockResolvedValue(
        null,
      );

      await expect(
        service.execute(
          'candidate-1',
          'user-1',
          Role.CANDIDATE,
        ),
      ).rejects.toThrow(
        NotFoundException,
      );

      expect(
        candidateProfileCompletenessService.calculate,
      ).not.toHaveBeenCalled();

      expect(
        candidateDocumentCompletenessService.calculate,
      ).not.toHaveBeenCalled();
    });

    // ============================================================
    // COMPLETENESS ONLY AFTER AUTHORIZATION
    // ============================================================

    it('should calculate completeness only after ownership or administrator authorization succeeds', async () => {
      const candidate = {
        id: 'candidate-1',
        userId: 'owner-user',
        status: CandidateStatus.PENDING,
      };

      candidateRepository.findByIdWithDetails.mockResolvedValue(
        candidate,
      );

      candidateProfileCompletenessService.calculate.mockReturnValue(
        50,
      );

      candidateDocumentCompletenessService.calculate.mockResolvedValue(
        50,
      );

      await service.execute(
        'candidate-1',
        'owner-user',
        Role.CANDIDATE,
      );

      expect(
        candidateProfileCompletenessService.calculate,
      ).toHaveBeenCalledWith(candidate);

      expect(
        candidateDocumentCompletenessService.calculate,
      ).toHaveBeenCalledWith('candidate-1');
    });
  });

  // ============================================================
  // WITHDRAW CANDIDATE
  // ============================================================

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
      log: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(() => {
      jest.clearAllMocks();

      service = new WithdrawCandidateService(
        candidateRepository as unknown as CandidateRepository,
        candidateStatusValidator as unknown as CandidateStatusValidator,
        auditService as unknown as AuditService,
      );
    });

    // ============================================================
    // OWNER ACCESS
    // ============================================================

    it('should allow the candidate owner to withdraw their own candidacy', async () => {
      const candidate = {
        id: 'candidate-1',
        userId: 'user-1',
        status: CandidateStatus.APPROVED,
      };

      const updatedCandidate = {
        ...candidate,
        status: CandidateStatus.WITHDRAWN,
      };

      candidateRepository.findById.mockResolvedValue(
        candidate,
      );

      candidateRepository.update.mockResolvedValue(
        updatedCandidate,
      );

      const result = await service.execute(
        'candidate-1',
        'user-1',
        'Personal reasons',
      );

      expect(result).toEqual(
        updatedCandidate,
      );

      expect(
        candidateStatusValidator.validateTransition,
      ).toHaveBeenCalledWith(
        CandidateStatus.APPROVED,
        CandidateStatus.WITHDRAWN,
      );

      expect(
        candidateRepository.update,
      ).toHaveBeenCalledWith(
        'candidate-1',
        expect.objectContaining({
          status: CandidateStatus.WITHDRAWN,
          withdrawalReason: 'Personal reasons',
        }),
      );
    });

    // ============================================================
    // CROSS-USER WITHDRAWAL
    // ============================================================

    it('should reject another user from withdrawing the candidacy', async () => {
      const candidate = {
        id: 'candidate-1',
        userId: 'owner-user',
        status: CandidateStatus.APPROVED,
      };

      candidateRepository.findById.mockResolvedValue(
        candidate,
      );

      await expect(
        service.execute(
          'candidate-1',
          'different-user',
          'Unauthorized attempt',
        ),
      ).rejects.toThrow(
        'You can only withdraw your own candidacy.',
      );

      expect(
        candidateStatusValidator.validateTransition,
      ).not.toHaveBeenCalled();

      expect(
        candidateRepository.update,
      ).not.toHaveBeenCalled();
    });

    // ============================================================
    // ADMIN CANNOT OVERRIDE OWNERSHIP
    // ============================================================

    it('should not allow an administrator userId to withdraw another candidate through this service', async () => {
      const candidate = {
        id: 'candidate-1',
        userId: 'candidate-owner',
        status: CandidateStatus.APPROVED,
      };

      candidateRepository.findById.mockResolvedValue(
        candidate,
      );

      await expect(
        service.execute(
          'candidate-1',
          'admin-user',
          'Administrative withdrawal',
        ),
      ).rejects.toThrow(
        ForbiddenException,
      );

      expect(
        candidateStatusValidator.validateTransition,
      ).not.toHaveBeenCalled();

      expect(
        candidateRepository.update,
      ).not.toHaveBeenCalled();
    });

    // ============================================================
    // NOT FOUND
    // ============================================================

    it('should reject withdrawal when the candidate does not exist', async () => {
      candidateRepository.findById.mockResolvedValue(
        null,
      );

      await expect(
        service.execute(
          'candidate-1',
          'user-1',
          'Personal reasons',
        ),
      ).rejects.toThrow(
        NotFoundException,
      );

      expect(
        candidateStatusValidator.validateTransition,
      ).not.toHaveBeenCalled();

      expect(
        candidateRepository.update,
      ).not.toHaveBeenCalled();
    });

    // ============================================================
    // OWNERSHIP CHECK HAPPENS BEFORE LIFECYCLE CHANGE
    // ============================================================

    it('should check ownership before validating the withdrawal lifecycle transition', async () => {
      const candidate = {
        id: 'candidate-1',
        userId: 'owner-user',
        status: CandidateStatus.PENDING,
      };

      candidateRepository.findById.mockResolvedValue(
        candidate,
      );

      await expect(
        service.execute(
          'candidate-1',
          'different-user',
          'Unauthorized attempt',
        ),
      ).rejects.toThrow(
        ForbiddenException,
      );

      expect(
        candidateStatusValidator.validateTransition,
      ).not.toHaveBeenCalled();
    });
  });
});