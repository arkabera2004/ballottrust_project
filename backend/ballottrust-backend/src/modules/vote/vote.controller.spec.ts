import { Test, TestingModule } from '@nestjs/testing';

import { VoteController } from './vote.controller';
import { VoteService } from './vote.service';

describe('VoteController', () => {
  let controller: VoteController;

  const mockVoteService = {
    castVote: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [VoteController],

        providers: [
          {
            provide: VoteService,
            useValue: mockVoteService,
          },
        ],
      }).compile();

    controller =
      module.get<VoteController>(
        VoteController,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call VoteService.castVote with the authenticated user and vote data', async () => {
    const request = {
      user: {
        userId: 'user-1',
      },
    };

    const voteData = {
      candidateId: 'candidate-1',
      electionId: 'election-1',
    };

    const expectedResult = {
      id: 'vote-1',
      voterId: 'user-1',
      candidateId: 'candidate-1',
      electionId: 'election-1',
    };

    mockVoteService.castVote.mockResolvedValue(
      expectedResult,
    );

    const result =
      await controller.castVote(
        request,
        voteData,
      );

    expect(result).toEqual(
      expectedResult,
    );

    expect(
      mockVoteService.castVote,
    ).toHaveBeenCalledWith(
      'user-1',
      voteData,
    );
  });
});