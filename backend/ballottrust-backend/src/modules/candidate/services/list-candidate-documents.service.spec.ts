import { ListCandidateDocumentsService } from '../documents/services/list-candidate-documents.service';
import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateDocumentRepository } from '../documents/candidate-document.repository';
import { Role } from '@prisma/client';

describe('ListCandidateDocumentsService', () => {
  it('should list documents for the candidate owner', async () => {
    const documents = [{ id: 'document-1' }];

    const candidateRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'candidate-1',
        userId: 'user-1',
      }),
    };

    const documentRepository = {
      findByCandidateId: jest.fn().mockResolvedValue(documents),
    };

    const service = new ListCandidateDocumentsService(
      candidateRepository as unknown as CandidateRepository,
      documentRepository as unknown as CandidateDocumentRepository,
    );

    const result = await service.execute(
      'candidate-1',
      'user-1',
      Role.CANDIDATE,
    );

    expect(result).toEqual(documents);
    expect(documentRepository.findByCandidateId)
      .toHaveBeenCalledWith('candidate-1');
  });

    it('should reject an unauthorized user from listing candidate documents', async () => {
    const candidateRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'candidate-1',
        userId: 'owner-user',
      }),
    };

    const documentRepository = {
      findByCandidateId: jest.fn(),
    };

    const service = new ListCandidateDocumentsService(
      candidateRepository as unknown as CandidateRepository,
      documentRepository as unknown as CandidateDocumentRepository,
    );

    await expect(
      service.execute(
        'candidate-1',
        'different-user',
        Role.CANDIDATE,
      ),
    ).rejects.toThrow(
      'You are not authorized to view these candidate documents.',
    );

    expect(
      documentRepository.findByCandidateId,
    ).not.toHaveBeenCalled();
  });

  it('should allow SUPER_ADMIN to list candidate documents', async () => {
    const documents = [{ id: 'document-1' }];

    const candidateRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'candidate-1',
        userId: 'candidate-owner',
      }),
    };

    const documentRepository = {
      findByCandidateId: jest.fn().mockResolvedValue(documents),
    };

    const service = new ListCandidateDocumentsService(
      candidateRepository as unknown as CandidateRepository,
      documentRepository as unknown as CandidateDocumentRepository,
    );

    const result = await service.execute(
      'candidate-1',
      'admin-user',
      Role.SUPER_ADMIN,
    );

    expect(result).toEqual(documents);

    expect(
      documentRepository.findByCandidateId,
    ).toHaveBeenCalledWith('candidate-1');
  });

  it('should allow ELECTION_COMMISSIONER to list candidate documents', async () => {
    const documents = [{ id: 'document-1' }];

    const candidateRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'candidate-1',
        userId: 'candidate-owner',
      }),
    };

    const documentRepository = {
      findByCandidateId: jest.fn().mockResolvedValue(documents),
    };

    const service = new ListCandidateDocumentsService(
      candidateRepository as unknown as CandidateRepository,
      documentRepository as unknown as CandidateDocumentRepository,
    );

    const result = await service.execute(
      'candidate-1',
      'commissioner-user',
      Role.ELECTION_COMMISSIONER,
    );

    expect(result).toEqual(documents);

    expect(
      documentRepository.findByCandidateId,
    ).toHaveBeenCalledWith('candidate-1');
  });
});
