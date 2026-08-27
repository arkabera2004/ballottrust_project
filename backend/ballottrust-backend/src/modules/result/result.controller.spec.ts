import { Test, TestingModule } from '@nestjs/testing';

import { ResultController } from './result.controller';
import { ResultService } from './result.service';

describe('ResultController', () => {
  let controller: ResultController;

  const mockResultService = {
    getResults: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [
          ResultController,
        ],

        providers: [
          {
            provide: ResultService,
            useValue: mockResultService,
          },
        ],
      }).compile();

    controller =
      module.get<ResultController>(
        ResultController,
      );
  });

  // ============================================================
  // DEFINITION
  // ============================================================

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ============================================================
  // GET RESULTS
  // ============================================================

  it('should return election results', async () => {
    const results = {
      election: {
        id: 'election-1',
        title: 'Student Council Election',
      },

      totalCandidates: 2,

      totalVotes: 10,

      results: [
        {
          candidateId: 'candidate-1',
          userId: 'user-1',
          candidateName: 'Candidate One',
          candidateNumber: 1,
          candidateType: 'INDEPENDENT',
          party: null,
          votes: 6,
        },

        {
          candidateId: 'candidate-2',
          userId: 'user-2',
          candidateName: 'Candidate Two',
          candidateNumber: 2,
          candidateType: 'PARTY',
          party: {
            id: 'party-1',
            name: 'Student Unity Party',
            abbreviation: 'SUP',
            symbol: '🌟',
          },
          votes: 4,
        },
      ],

      winner: {
        candidateId: 'candidate-1',
        userId: 'user-1',
        candidateName: 'Candidate One',
        candidateNumber: 1,
        candidateType: 'INDEPENDENT',
        party: null,
        votes: 6,
      },
    };

    mockResultService.getResults
      .mockResolvedValue(results);

    const result =
      await controller.getResults(
        'election-1',
      );

    expect(result).toEqual(results);

    expect(
      mockResultService.getResults,
    ).toHaveBeenCalledWith(
      'election-1',
    );
  });
});