import { ListCandidatesService } from './list-candidates.service';
import { CandidateRepository } from '../repository/candidate.repository';

describe('ListCandidatesService', () => {
  let service: ListCandidatesService;

  const candidateRepository = {
    findAllPaginated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new ListCandidatesService(
      candidateRepository as unknown as CandidateRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated candidates', async () => {
    const mockResult = {
      data: [
        {
          id: 'candidate-1',
          position: 'President',
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    candidateRepository.findAllPaginated.mockResolvedValue(
      mockResult,
    );

    const result = await service.execute({
      page: 1,
      limit: 10,
    } as any);

    expect(result).toEqual(mockResult);

    expect(
      candidateRepository.findAllPaginated,
    ).toHaveBeenCalled();
  });
});