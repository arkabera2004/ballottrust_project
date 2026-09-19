import { describe, it, beforeEach, expect, jest } from '@jest/globals';

import { RejectCandidateDocumentService } from '../documents/services/reject-candidate-document.service';

import { CandidateDocumentRepository } from '../documents/candidate-document.repository';

import { CandidateDocumentStatusValidator } from '../documents/validators/candidate-document-status.validator';
import { AuditService } from '../../audit/audit.service';

describe('RejectCandidateDocumentService', () => {
  let service: RejectCandidateDocumentService;

  const candidateDocumentRepository = {
    findById: jest.fn(),
    rejectDocument: jest.fn(),
  };

  const candidateDocumentStatusValidator = {
    validateTransition: jest.fn(),
  };

  const auditService = {
    log: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new RejectCandidateDocumentService(
      candidateDocumentRepository as unknown as CandidateDocumentRepository,
      candidateDocumentStatusValidator as unknown as CandidateDocumentStatusValidator,
      auditService as unknown as AuditService,
    );
  });

  // ======================================================
  // 1. Missing Document
  // ======================================================

  it('should reject a missing document', async () => {
    candidateDocumentRepository.findById.mockResolvedValue(null as never);

    await expect(
      service.execute(
        'candidate-1',
        'document-1',
        'admin-1',
        'Unreadable document',
      ),
    ).rejects.toThrow('Candidate document not found.');

    expect(candidateDocumentRepository.findById).toHaveBeenCalledWith(
      'document-1',
    );

    expect(
      candidateDocumentStatusValidator.validateTransition,
    ).not.toHaveBeenCalled();

    expect(candidateDocumentRepository.rejectDocument).not.toHaveBeenCalled();
  });

  // ======================================================
  // 2. Service Definition
  // ======================================================

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
