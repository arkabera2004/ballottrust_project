import { FinalizeBallotService } from './finalize-ballot.service';
import { CandidateRepository } from '../repository/candidate.repository';
import { ElectionStatus } from '@prisma/client';

describe('FinalizeBallotService', () => {
  it('should finalize a ready ballot', async () => {
    const finalizedElection = {
      id: 'election-1',
      ballotFinalizedAt: new Date(),
    };

    const repository = {
      findElectionBallotState: jest.fn().mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
        ballotOrderMethod: 'CANDIDATE_NUMBER',
      }),
      getBallotReadiness: jest.fn().mockResolvedValue({
        totalApprovedCandidates: 2,
        readyCandidates: 2,
      }),
      finalizeBallot: jest.fn().mockResolvedValue(finalizedElection),
    };

    const service = new FinalizeBallotService(
      repository as unknown as CandidateRepository,
    );

    const result = await service.execute('election-1', 'admin-1');

    expect(result.message).toBe('Ballot finalized successfully.');

    expect(repository.finalizeBallot).toHaveBeenCalledWith(
      'election-1',
      'admin-1',
    );
  });
});
