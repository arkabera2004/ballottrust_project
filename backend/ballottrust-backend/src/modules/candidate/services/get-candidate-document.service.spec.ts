import { Role } from '@prisma/client';

import { GetCandidateDocumentService } from '../documents/services/get-candidate-document.service';

import { CandidateDocumentRepository } from '../documents/candidate-document.repository';

describe('GetCandidateDocumentService', () => {
  let service: GetCandidateDocumentService;

  let candidateDocumentRepository: {
    findById: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    candidateDocumentRepository = {
      findById: jest.fn(),
    };

    service = new GetCandidateDocumentService(
      candidateDocumentRepository as unknown as CandidateDocumentRepository,
    );
  });

  // ============================================================
  // SUCCESS
  // ============================================================

  it('should return a document to its owner', async () => {
    const document = {
      id: 'document-1',

      candidateId: 'candidate-1',

      candidate: {
        userId: 'user-1',
      },

      documentType: 'IDENTITY_PROOF',

      fileName: 'identity.pdf',
      fileUrl: 'uploads/identity.pdf',

      status: 'PENDING',

      replacedAt: null,
      deletedAt: null,
    };

    candidateDocumentRepository.findById.mockResolvedValue(document);

    const result = await service.execute(
      'candidate-1',
      'document-1',
      'user-1',
      Role.CANDIDATE,
    );

    expect(result).toEqual(document);

    expect(candidateDocumentRepository.findById).toHaveBeenCalledWith(
      'document-1',
    );
  });

  // ============================================================
  // ADMIN ACCESS
  // ============================================================

  it('should allow SUPER_ADMIN to view the document', async () => {
    const document = {
      id: 'document-1',

      candidateId: 'candidate-1',

      candidate: {
        userId: 'candidate-owner',
      },

      documentType: 'IDENTITY_PROOF',

      fileName: 'identity.pdf',
      fileUrl: 'uploads/identity.pdf',

      status: 'PENDING',

      replacedAt: null,
      deletedAt: null,
    };

    candidateDocumentRepository.findById.mockResolvedValue(document);

    const result = await service.execute(
      'candidate-1',
      'document-1',
      'admin-user',
      Role.SUPER_ADMIN,
    );

    expect(result).toEqual(document);
  });

  // ============================================================
  // ELECTION COMMISSIONER ACCESS
  // ============================================================

  it('should allow ELECTION_COMMISSIONER to view the document', async () => {
    const document = {
      id: 'document-1',

      candidateId: 'candidate-1',

      candidate: {
        userId: 'candidate-owner',
      },

      documentType: 'IDENTITY_PROOF',

      fileName: 'identity.pdf',
      fileUrl: 'uploads/identity.pdf',

      status: 'PENDING',

      replacedAt: null,
      deletedAt: null,
    };

    candidateDocumentRepository.findById.mockResolvedValue(document);

    const result = await service.execute(
      'candidate-1',
      'document-1',
      'commissioner-user',
      Role.ELECTION_COMMISSIONER,
    );

    expect(result).toEqual(document);
  });

  // ============================================================
  // NOT FOUND
  // ============================================================

  it('should reject when the document does not exist', async () => {
    candidateDocumentRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute('candidate-1', 'document-1', 'user-1', Role.CANDIDATE),
    ).rejects.toThrow('Candidate document not found.');

    expect(candidateDocumentRepository.findById).toHaveBeenCalledWith(
      'document-1',
    );
  });

  // ============================================================
  // CANDIDATE RELATIONSHIP
  // ============================================================

  it('should reject when the document belongs to another candidate', async () => {
    const document = {
      id: 'document-1',

      candidateId: 'different-candidate',

      candidate: {
        userId: 'user-1',
      },

      documentType: 'IDENTITY_PROOF',

      fileName: 'identity.pdf',
      fileUrl: 'uploads/identity.pdf',

      status: 'PENDING',

      replacedAt: null,
      deletedAt: null,
    };

    candidateDocumentRepository.findById.mockResolvedValue(document);

    await expect(
      service.execute('candidate-1', 'document-1', 'user-1', Role.CANDIDATE),
    ).rejects.toThrow('Candidate document not found.');
  });

  // ============================================================
  // UNAUTHORIZED ACCESS
  // ============================================================

  it('should reject unauthorized users', async () => {
    const document = {
      id: 'document-1',

      candidateId: 'candidate-1',

      candidate: {
        userId: 'owner-user',
      },

      documentType: 'IDENTITY_PROOF',

      fileName: 'identity.pdf',
      fileUrl: 'uploads/identity.pdf',

      status: 'PENDING',

      replacedAt: null,
      deletedAt: null,
    };

    candidateDocumentRepository.findById.mockResolvedValue(document);

    await expect(
      service.execute(
        'candidate-1',
        'document-1',
        'different-user',
        Role.CANDIDATE,
      ),
    ).rejects.toThrow(
      'You are not authorized to view this candidate document.',
    );
  });

  // ============================================================
  // REPOSITORY CALL
  // ============================================================

  it('should fetch the document using the document id', async () => {
    const document = {
      id: 'document-123',

      candidateId: 'candidate-1',

      candidate: {
        userId: 'user-1',
      },
    };

    candidateDocumentRepository.findById.mockResolvedValue(document);

    await service.execute(
      'candidate-1',
      'document-123',
      'user-1',
      Role.CANDIDATE,
    );

    expect(candidateDocumentRepository.findById).toHaveBeenCalledTimes(1);

    expect(candidateDocumentRepository.findById).toHaveBeenCalledWith(
      'document-123',
    );
  });

  // ============================================================
  // ADMIN CANNOT BYPASS CANDIDATE RELATIONSHIP
  // ============================================================

  it('should reject an administrator when the document does not belong to the requested candidate', async () => {
    const document = {
      id: 'document-1',

      candidateId: 'different-candidate',

      candidate: {
        userId: 'candidate-owner',
      },

      documentType: 'IDENTITY_PROOF',

      fileName: 'identity.pdf',
      fileUrl: 'uploads/identity.pdf',

      status: 'PENDING',

      replacedAt: null,
      deletedAt: null,
    };

    candidateDocumentRepository.findById.mockResolvedValue(document);

    await expect(
      service.execute(
        'candidate-1',
        'admin-user',
        'document-1',
        Role.SUPER_ADMIN,
      ),
    ).rejects.toThrow('Candidate document not found.');
  });

  // ============================================================
  // SAME USER BUT DIFFERENT CANDIDATE
  // ============================================================

  it('should reject access when the user owns a different candidate', async () => {
    const document = {
      id: 'document-1',

      candidateId: 'candidate-1',

      candidate: {
        userId: 'different-candidate-owner',
      },

      documentType: 'IDENTITY_PROOF',

      fileName: 'identity.pdf',
      fileUrl: 'uploads/identity.pdf',

      status: 'PENDING',

      replacedAt: null,
      deletedAt: null,
    };

    candidateDocumentRepository.findById.mockResolvedValue(document);

    await expect(
      service.execute('candidate-1', 'user-1', 'document-1', Role.CANDIDATE),
    ).rejects.toThrow(
      'You are not authorized to view this candidate document.',
    );
  });
});
