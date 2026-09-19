import { DeleteCandidateDocumentService } from '../documents/services/delete-candidate-document.service';
import { CandidateDocumentRepository } from '../documents/candidate-document.repository';
import { CandidateDocumentStatus, CandidateStatus } from '@prisma/client';

describe('DeleteCandidateDocumentService', () => {
  it('should reject a missing document', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue(null),
    };

    const service = new DeleteCandidateDocumentService(
      repository as unknown as CandidateDocumentRepository,
    );

    await expect(
      service.execute('candidate-1', 'document-1', 'user-1'),
    ).rejects.toThrow('Candidate document not found.');
  });

  it('should be defined', () => {
    const service = new DeleteCandidateDocumentService(
      {} as CandidateDocumentRepository,
    );

    expect(service).toBeDefined();
  });

  it('should reject another user from deleting a candidate document', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue({
        id: 'document-1',
        candidateId: 'candidate-1',

        candidate: {
          userId: 'owner-user',
          status: CandidateStatus.PENDING,
        },

        documentType: 'STUDENT_ID',
        status: CandidateDocumentStatus.PENDING,
        replacedAt: null,
      }),

      softDelete: jest.fn(),
    };

    const service = new DeleteCandidateDocumentService(
      repository as unknown as CandidateDocumentRepository,
    );

    await expect(
      service.execute('candidate-1', 'document-1', 'different-user'),
    ).rejects.toThrow('You can only delete your own candidate documents.');

    expect(repository.softDelete).not.toHaveBeenCalled();
  });
});
