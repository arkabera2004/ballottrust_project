import { UploadCandidateDocumentService } from '../documents/services/upload-candidate-document.service';
import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateDocumentRepository } from '../documents/candidate-document.repository';

describe('UploadCandidateDocumentService', () => {
  it('should reject a missing file', async () => {
    const service = new UploadCandidateDocumentService(
      {} as CandidateRepository,
      {} as CandidateDocumentRepository,
    );

    await expect(
      service.execute(
        'candidate-1',
        'user-1',
        { documentType: 'STUDENT_ID' } as any,
        undefined as any,
      ),
    ).rejects.toThrow(
      'Candidate document file is required.',
    );
  });

  it('should be defined', () => {
    const service = new UploadCandidateDocumentService(
      {} as CandidateRepository,
      {} as CandidateDocumentRepository,
    );

    expect(service).toBeDefined();
  });

    it('should reject another user from uploading a candidate document', async () => {
  const candidateRepository = {
    findById: jest.fn().mockResolvedValue({
      id: 'candidate-1',
      userId: 'owner-user',
      status: 'PENDING',
    }),
  };

  const candidateDocumentRepository = {
    findActiveByType: jest.fn(),
    create: jest.fn(),
  };

  const service =
    new UploadCandidateDocumentService(
      candidateRepository as unknown as CandidateRepository,
      candidateDocumentRepository as unknown as CandidateDocumentRepository,
    );

  const file = {
    originalname: 'identity.pdf',
    filename: 'identity-123.pdf',
    mimetype: 'application/pdf',
    size: 1000,
    path: '',
  } as Express.Multer.File;

  await expect(
    service.execute(
      'candidate-1',
      'different-user',
      {
        documentType: 'STUDENT_ID',
      } as any,
      file,
    ),
  ).rejects.toThrow(
    'You can only upload documents for your own candidacy.',
  );

  expect(
    candidateDocumentRepository.findActiveByType,
  ).not.toHaveBeenCalled();

  expect(
    candidateDocumentRepository.create,
  ).not.toHaveBeenCalled();
});


});
