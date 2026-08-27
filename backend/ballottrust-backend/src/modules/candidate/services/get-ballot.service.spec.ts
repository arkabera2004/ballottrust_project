import { GetBallotService } from './get-ballot.service';
import { CandidateRepository } from '../repository/candidate.repository';

describe('GetBallotService', () => {
  let service: GetBallotService;

  const candidateRepository = {
    findElectionBallotState: jest.fn(),
    findOrderedBallot: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new GetBallotService(
      candidateRepository as unknown as CandidateRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the ordered ballot', async () => {
    const ballot = [
      {
        id: 'candidate-1',
        candidateNumber: 1,
        ballotOrder: 1,
        position: 'President',
      },
      {
        id: 'candidate-2',
        candidateNumber: 2,
        ballotOrder: 2,
        position: 'President',
      },
    ];

    candidateRepository.findElectionBallotState.mockResolvedValue({
      id: 'election-1',
      status: 'PUBLISHED',
      ballotOrderMethod: 'CANDIDATE_NUMBER',
      ballotFinalizedAt: new Date(),
    });

    candidateRepository.findOrderedBallot.mockResolvedValue(
      ballot,
    );

    const result = await service.execute(
      'election-1',
    );

    expect(result).toBeDefined();

    expect(
      candidateRepository.findOrderedBallot,
    ).toHaveBeenCalledWith('election-1');
  });
});