import { MyCandidatesService } from './my-candidates.service';
import { CandidateRepository } from '../repository/candidate.repository';

describe('MyCandidatesService', () => {
  it('should be defined', () => {
    const repository = {} as CandidateRepository;
    const service = new MyCandidatesService(repository);

    expect(service).toBeDefined();
  });

  it('should return candidate records for the user', async () => {
    const candidates = [
      {
        id: 'candidate-1',
        userId: 'user-1',
      },
    ];

    const repository = {
      findMany: jest.fn().mockResolvedValue(candidates),
    };

    const service = new MyCandidatesService(
      repository as unknown as CandidateRepository,
    );

    const result = await service.execute('user-1');

    expect(result).toBeDefined();
    expect(repository.findMany).toHaveBeenCalled();
  });
});
