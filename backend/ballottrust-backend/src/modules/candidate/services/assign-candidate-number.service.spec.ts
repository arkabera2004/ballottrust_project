import { AssignCandidateNumberService } from './assign-candidate-number.service';
import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateValidator } from '../validators/candidate.validator';
import { BallotLifecycleValidator } from '../validators/ballot-lifecycle.validator';
import { CandidateStatus } from '@prisma/client';

describe('AssignCandidateNumberService', () => {
  const candidateRepository = {
    findById: jest.fn(),
    findElectionBallotState: jest.fn(),
    update: jest.fn(),
  };

  const candidateValidator = {
    validateCandidateNumber: jest.fn(),
  };

  const ballotLifecycleValidator = {
    validateModification: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should assign a candidate number to an approved candidate', async () => {
    const candidate = {
      id: 'candidate-1',
      electionId: 'election-1',
      status: CandidateStatus.APPROVED,
      candidateNumber: null,
    };

    const updated = {
      ...candidate,
      candidateNumber: 7,
    };

    candidateRepository.findById.mockResolvedValue(candidate);
    candidateRepository.findElectionBallotState.mockResolvedValue({
      status: 'PUBLISHED',
      ballotFinalizedAt: null,
    });
    candidateRepository.update.mockResolvedValue(updated);

    const service = new AssignCandidateNumberService(
      candidateRepository as unknown as CandidateRepository,
      candidateValidator as unknown as CandidateValidator,
      ballotLifecycleValidator as unknown as BallotLifecycleValidator,
    );

    const result = await service.execute('candidate-1', 7);

    expect(result).toEqual(updated);
    expect(candidateValidator.validateCandidateNumber)
      .toHaveBeenCalledWith('election-1', 7);
    expect(candidateRepository.update)
      .toHaveBeenCalledWith('candidate-1', {
        candidateNumber: 7,
      });
  });
});
