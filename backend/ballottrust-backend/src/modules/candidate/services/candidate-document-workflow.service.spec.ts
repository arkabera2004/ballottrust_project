import { CandidateStatus, Role } from '@prisma/client';

import { UploadCandidateDocumentService } from '../documents/services/upload-candidate-document.service';
import { GetCandidateDocumentService } from '../documents/services/get-candidate-document.service';
import { ListCandidateDocumentsService } from '../documents/services/list-candidate-documents.service';
import { VerifyCandidateDocumentService } from '../documents/services/verify-candidate-document.service';
import { RejectCandidateDocumentService } from '../documents/services/reject-candidate-document.service';
import { ReplaceCandidateDocumentService } from '../documents/services/replace-candidate-document.service';
import { DeleteCandidateDocumentService } from '../documents/services/delete-candidate-document.service';

import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateDocumentRepository } from '../documents/candidate-document.repository';
import { CandidateDocumentStatusValidator } from '../documents/validators/candidate-document-status.validator';

describe('Candidate Document Workflow - 6.4', () => {
  let candidateRepository: any;
  let candidateDocumentRepository: any;
  let candidateDocumentStatusValidator: any;

  let uploadService: UploadCandidateDocumentService;
  let getService: GetCandidateDocumentService;
  let listService: ListCandidateDocumentsService;
  let verifyService: VerifyCandidateDocumentService;
  let rejectService: RejectCandidateDocumentService;
  let replaceService: ReplaceCandidateDocumentService;
  let deleteService: DeleteCandidateDocumentService;

  const candidate = {
    id: 'candidate-1',
    userId: 'user-1',
    status: CandidateStatus.PENDING,
  };

  const document = {
    id: 'document-1',
    candidateId: 'candidate-1',
    candidate: {
      userId: 'user-1',
      status: CandidateStatus.PENDING,
    },
    documentType: 'IDENTITY_PROOF',
    originalFileName: 'identity.pdf',
    fileUrl: '/uploads/identity.pdf',
    mimeType: 'application/pdf',
    fileSize: 1000,
    status: 'PENDING',
    replacedAt: null,
    deletedAt: null,
  };

  const file = {
    originalname: 'identity.pdf',
    filename: 'identity-123.pdf',
    mimetype: 'application/pdf',
    size: 1000,
    path: '',
  } as Express.Multer.File;

  beforeEach(() => {
    jest.clearAllMocks();

    candidateRepository = {
      findById: jest.fn(),
    };

    candidateDocumentRepository = {
      findById: jest.fn(),
      findActiveByType: jest.fn(),
      findByCandidateId: jest.fn(),
      create: jest.fn(),
      verifyDocument: jest.fn(),
      rejectDocument: jest.fn(),
      replaceDocument: jest.fn(),
      softDelete: jest.fn(),
    };

    candidateDocumentStatusValidator = {
      validateTransition: jest.fn(),
    };

    uploadService = new UploadCandidateDocumentService(
      candidateRepository as CandidateRepository,
      candidateDocumentRepository as CandidateDocumentRepository,
    );

    getService = new GetCandidateDocumentService(
      candidateDocumentRepository as CandidateDocumentRepository,
    );

    listService = new ListCandidateDocumentsService(
      candidateRepository as CandidateRepository,
      candidateDocumentRepository as CandidateDocumentRepository,
    );

    verifyService = new VerifyCandidateDocumentService(
      candidateDocumentRepository as CandidateDocumentRepository,
      candidateDocumentStatusValidator as CandidateDocumentStatusValidator,
    );

    rejectService = new RejectCandidateDocumentService(
      candidateDocumentRepository as CandidateDocumentRepository,
      candidateDocumentStatusValidator as CandidateDocumentStatusValidator,
    );

    replaceService = new ReplaceCandidateDocumentService(
      candidateDocumentRepository as CandidateDocumentRepository,
    );

    deleteService = new DeleteCandidateDocumentService(
      candidateDocumentRepository as CandidateDocumentRepository,
    );
  });

  // ============================================================
  // 1. UPLOAD
  // ============================================================

  it('should upload a document for an owned pending candidate', async () => {
    candidateRepository.findById.mockResolvedValue(candidate);

    candidateDocumentRepository.findActiveByType.mockResolvedValue(
      null,
    );

    candidateDocumentRepository.create.mockResolvedValue(
      document,
    );

    const result = await uploadService.execute(
      'candidate-1',
      'user-1',
      {
        documentType: 'IDENTITY_PROOF',
      } as any,
      file,
    );

    expect(result).toEqual(document);

    expect(
      candidateRepository.findById,
    ).toHaveBeenCalledWith('candidate-1');

    expect(
      candidateDocumentRepository.findActiveByType,
    ).toHaveBeenCalledWith(
      'candidate-1',
      'IDENTITY_PROOF',
    );

    expect(
      candidateDocumentRepository.create,
    ).toHaveBeenCalled();

    const createArgument =
      candidateDocumentRepository.create.mock.calls[0][0];

    expect(createArgument.documentType).toBe(
      'IDENTITY_PROOF',
    );

    expect(
      createArgument.candidate.connect.id,
    ).toBe('candidate-1');
  });

  // ============================================================
  // 2. DUPLICATE ACTIVE DOCUMENT
  // ============================================================

  it('should reject uploading a duplicate active document', async () => {
    candidateRepository.findById.mockResolvedValue(candidate);

    candidateDocumentRepository.findActiveByType.mockResolvedValue(
      document,
    );

    await expect(
      uploadService.execute(
        'candidate-1',
        'user-1',
        {
          documentType: 'IDENTITY_PROOF',
        } as any,
        file,
      ),
    ).rejects.toThrow(
      'An active document of this type already exists. Use the document replacement workflow instead.',
    );

    expect(
      candidateDocumentRepository.create,
    ).not.toHaveBeenCalled();
  });

  // ============================================================
  // 3. GET - OWNER
  // ============================================================

  it('should allow the candidate owner to view the document', async () => {
    candidateDocumentRepository.findById.mockResolvedValue(
      document,
    );

    const result = await getService.execute(
      'candidate-1',
      'document-1',
      'user-1',
      Role.CANDIDATE,
    );

    expect(result).toEqual(document);

    expect(
      candidateDocumentRepository.findById,
    ).toHaveBeenCalledWith('document-1');
  });

  // ============================================================
  // 4. GET - ADMIN
  // ============================================================

  it('should allow an election administrator to view the document', async () => {
    candidateDocumentRepository.findById.mockResolvedValue(
      document,
    );

    const result = await getService.execute(
      'candidate-1',
      'document-1',
      'admin-1',
      Role.SUPER_ADMIN,
    );

    expect(result).toEqual(document);
  });

  // ============================================================
  // 5. GET - UNAUTHORIZED USER
  // ============================================================

  it('should reject an unauthorized user from viewing the document', async () => {
    candidateDocumentRepository.findById.mockResolvedValue(
      document,
    );

    await expect(
      getService.execute(
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
  // 6. LIST DOCUMENTS
  // ============================================================

  it('should list all documents belonging to the candidate', async () => {
    const documents = [
      document,
      {
        ...document,
        id: 'document-2',
        documentType: 'ADDRESS_PROOF',
      },
    ];

    candidateRepository.findById.mockResolvedValue(
      candidate,
    );

    candidateDocumentRepository.findByCandidateId.mockResolvedValue(
      documents,
    );

    const result = await listService.execute(
      'candidate-1',
      'user-1',
      Role.CANDIDATE,
    );

    expect(result).toEqual(documents);

    expect(
      candidateDocumentRepository.findByCandidateId,
    ).toHaveBeenCalledWith('candidate-1');
  });

  // ============================================================
  // 7. VERIFY
  // ============================================================

  it('should verify a pending document', async () => {
    candidateDocumentRepository.findById.mockResolvedValue(
      document,
    );

    candidateDocumentStatusValidator.validateTransition.mockImplementation(
      () => undefined,
    );

    const verifiedDocument = {
      ...document,
      status: 'VERIFIED',
    };

    candidateDocumentRepository.verifyDocument.mockResolvedValue(
      verifiedDocument,
    );

    const result = await verifyService.execute(
      'candidate-1',
      'document-1',
      'reviewer-1',
    );

    expect(result).toEqual(
      verifiedDocument,
    );

    expect(
      candidateDocumentStatusValidator.validateTransition,
    ).toHaveBeenCalled();

    expect(
      candidateDocumentRepository.verifyDocument,
    ).toHaveBeenCalledWith(
      'document-1',
      'reviewer-1',
    );
  });

  // ============================================================
  // 8. REJECT
  // ============================================================

  it('should reject a pending document', async () => {
  candidateDocumentRepository.findById.mockResolvedValue({
    ...document,
    candidateId: 'candidate-1',
    candidate: {
      userId: 'user-1',
      status: CandidateStatus.PENDING,
    },
    status: 'PENDING',
    replacedAt: null,
    deletedAt: null,
  });

  candidateDocumentStatusValidator.validateTransition.mockImplementation(
    () => undefined,
  );

  const rejectedDocument = {
    ...document,
    status: 'REJECTED',
  };

  candidateDocumentRepository.rejectDocument.mockResolvedValue(
    rejectedDocument,
  );

  const result =
    await rejectService.execute(
      'candidate-1',
      'document-1',
      'reviewer-1',
      'Document is unreadable',
    );

  expect(result).toEqual(
    rejectedDocument,
  );

  expect(
    candidateDocumentStatusValidator.validateTransition,
  ).toHaveBeenCalledWith(
    'PENDING',
    'REJECTED',
  );

  expect(
    candidateDocumentRepository.rejectDocument,
  ).toHaveBeenCalledWith(
    'document-1',
    'reviewer-1',
    'Document is unreadable',
  );
});

  // ============================================================
  // 9. REPLACE
  // ============================================================

  it('should replace an active candidate document', async () => {
    candidateDocumentRepository.findById.mockResolvedValue(
      document,
    );

    const replacementFile = {
      originalname: 'identity-new.pdf',
      filename: 'identity-new-123.pdf',
      mimetype: 'application/pdf',
      size: 2000,
      path: '',
    } as Express.Multer.File;

    const replacedDocument = {
      ...document,
      originalFileName: 'identity-new.pdf',
      fileUrl:
        '/uploads/identity-new-123.pdf',
    };

    candidateDocumentRepository.replaceDocument.mockResolvedValue(
      replacedDocument,
    );

    const result =
      await replaceService.execute(
        'candidate-1',
        'document-1',
        'user-1',
        replacementFile,
      );

    expect(result).toEqual(
      replacedDocument,
    );

    expect(
      candidateDocumentRepository.replaceDocument,
    ).toHaveBeenCalledWith(
      'document-1',
      expect.objectContaining({
        documentType:
          document.documentType,
        originalFileName:
          'identity-new.pdf',
        mimeType:
          'application/pdf',
        fileSize: 2000,
      }),
    );
  });

  // ============================================================
  // 10. REPLACE - OWNERSHIP
  // ============================================================

  it('should reject replacement by another user', async () => {
    candidateDocumentRepository.findById.mockResolvedValue(
      document,
    );

    await expect(
      replaceService.execute(
        'candidate-1',
        'document-1',
        'different-user',
        file,
      ),
    ).rejects.toThrow(
      'You can only replace your own candidate documents.',
    );

    expect(
      candidateDocumentRepository.replaceDocument,
    ).not.toHaveBeenCalled();
  });

  // ============================================================
  // 11. REPLACE - FINAL CANDIDATE STATE
  // ============================================================

  it('should reject document replacement when candidate is no longer editable', async () => {
    candidateDocumentRepository.findById.mockResolvedValue({
      ...document,
      candidate: {
        userId: 'user-1',
        status: CandidateStatus.APPROVED,
      },
    });

    await expect(
      replaceService.execute(
        'candidate-1',
        'document-1',
        'user-1',
        file,
      ),
    ).rejects.toThrow(
      'Candidate documents cannot be replaced in the current candidate status.',
    );

    expect(
      candidateDocumentRepository.replaceDocument,
    ).not.toHaveBeenCalled();
  });

  // ============================================================
  // 12. DELETE
  // ============================================================

  it('should delete an owned pending candidate document', async () => {
  const deletedDocument = {
    ...document,
    deletedAt: new Date(),
  };

  candidateDocumentRepository.findById.mockResolvedValue({
    ...document,
    candidateId: 'candidate-1',
    candidate: {
      userId: 'user-1',
      status: CandidateStatus.PENDING,
    },
    status: 'PENDING',
    replacedAt: null,
    deletedAt: null,
  });

  candidateDocumentRepository.softDelete.mockResolvedValue(
    deletedDocument,
  );

  const result =
    await deleteService.execute(
      'candidate-1',
      'document-1',
      'user-1',
    );

  expect(result).toEqual({
    id: deletedDocument.id,
    candidateId:
      deletedDocument.candidateId,
    documentType:
      deletedDocument.documentType,
    deletedAt:
      deletedDocument.deletedAt,
    message:
      'Candidate document deleted successfully.',
  });

  expect(
    candidateDocumentRepository.softDelete,
  ).toHaveBeenCalledWith(
    'document-1',
  );
});

  // ============================================================
  // 13. VERIFY CANNOT VERIFY REPLACED DOCUMENT
  // ============================================================

  it('should reject verification of a replaced document', async () => {
    candidateDocumentRepository.findById.mockResolvedValue({
      ...document,
      replacedAt: new Date(),
    });

    await expect(
      verifyService.execute(
        'candidate-1',
        'document-1',
        'reviewer-1',
      ),
    ).rejects.toThrow(
      'Replaced candidate documents cannot be verified.',
    );

    expect(
      candidateDocumentRepository.verifyDocument,
    ).not.toHaveBeenCalled();
  });

  // ============================================================
  // 14. VERIFY CANNOT VERIFY DELETED DOCUMENT
  // ============================================================

  it('should reject verification of a deleted document', async () => {
    candidateDocumentRepository.findById.mockResolvedValue({
      ...document,
      deletedAt: new Date(),
    });

    await expect(
      verifyService.execute(
        'candidate-1',
        'document-1',
        'reviewer-1',
      ),
    ).rejects.toThrow(
      'Deleted candidate documents cannot be verified.',
    );

    expect(
      candidateDocumentRepository.verifyDocument,
    ).not.toHaveBeenCalled();
  });
});