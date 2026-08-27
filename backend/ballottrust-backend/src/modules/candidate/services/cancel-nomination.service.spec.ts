import { CancelNominationService } from './cancel-nomination.service';
import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateValidator } from '../validators/candidate.validator';
import { CandidateStatus } from '@prisma/client';

describe('CancelNominationService', () => {
  it('should be defined', () => {
    const service = new CancelNominationService(
      {} as CandidateRepository,
      {} as CandidateValidator,
    );

    expect(service).toBeDefined();
  });

  it('should reject cancellation of a non-pending nomination', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue({
        id: 'candidate-1',
        userId: 'user-1',
        status: CandidateStatus.APPROVED,
      }),
    };

    const service = new CancelNominationService(
      repository as unknown as CandidateRepository,
      {} as CandidateValidator,
    );

    await expect(
      service.execute('candidate-1', 'user-1'),
    ).rejects.toThrow(
      'Only pending nominations can be cancelled.',
    );
  });

  it('should reject another user from cancelling the nomination', async () => {
  const repository = {
    findById: jest.fn().mockResolvedValue({
      id: 'candidate-1',
      userId: 'owner-user',
      electionId: 'election-1',
      status: CandidateStatus.PENDING,
    }),
    softDelete: jest.fn(),
  };

  const candidateValidator = {
    validateElectionExists: jest.fn(),
    validateNominationWindow: jest.fn(),
  };

  const service = new CancelNominationService(
    repository as unknown as CandidateRepository,
    candidateValidator as unknown as CandidateValidator,
  );

  await expect(
    service.execute(
      'candidate-1',
      'different-user',
    ),
  ).rejects.toThrow(
    'You can only cancel your own nomination.',
  );

  expect(
    candidateValidator.validateElectionExists,
  ).not.toHaveBeenCalled();

  expect(
    candidateValidator.validateNominationWindow,
  ).not.toHaveBeenCalled();

  expect(
    repository.softDelete,
  ).not.toHaveBeenCalled();
});
});
