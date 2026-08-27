import { Test, TestingModule } from '@nestjs/testing';

import { VoteService } from './vote.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('VoteService', () => {
  let service: VoteService;

  const mockPrismaService = {
    candidate: {
      findUnique: jest.fn(),
    },

    election: {
      findUnique: jest.fn(),
    },

    vote: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          VoteService,

          {
            provide: PrismaService,
            useValue: mockPrismaService,
          },
        ],
      }).compile();

    service =
      module.get<VoteService>(VoteService);
  });

  // ============================================================
  // SERVICE DEFINITION
  // ============================================================

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // SUCCESSFUL VOTE
  // ============================================================

  it('should cast a vote successfully', async () => {
    const candidate = {
      id: 'candidate-1',
      electionId: 'election-1',
    };

    const election = {
      id: 'election-1',
      status: 'ACTIVE',
    };

    const createdVote = {
      id: 'vote-1',
      voterId: 'user-1',
      candidateId: 'candidate-1',
      electionId: 'election-1',
      hash: 'generated-hash',
      previousHash: 'GENESIS_BLOCK',
    };

    mockPrismaService.candidate.findUnique.mockResolvedValue(
      candidate,
    );

    mockPrismaService.election.findUnique.mockResolvedValue(
      election,
    );

    // No existing vote
    mockPrismaService.vote.findFirst
      .mockResolvedValueOnce(null)
      // No previous vote / genesis block
      .mockResolvedValueOnce(null);

    mockPrismaService.vote.create.mockResolvedValue(
      createdVote,
    );

    const data = {
      candidateId: 'candidate-1',
      electionId: 'election-1',
    };

    const result = await service.castVote(
      'user-1',
      data,
    );

    expect(result).toEqual(createdVote);

    expect(
      mockPrismaService.candidate.findUnique,
    ).toHaveBeenCalledWith({
      where: {
        id: 'candidate-1',
      },
    });

    expect(
      mockPrismaService.election.findUnique,
    ).toHaveBeenCalledWith({
      where: {
        id: 'election-1',
      },
    });

    expect(
      mockPrismaService.vote.create,
    ).toHaveBeenCalled();

    const createCall =
      mockPrismaService.vote.create.mock.calls[0][0];

    expect(createCall.data).toEqual(
      expect.objectContaining({
        voterId: 'user-1',
        candidateId: 'candidate-1',
        electionId: 'election-1',
        previousHash: 'GENESIS_BLOCK',
      }),
    );

    expect(createCall.data.hash).toEqual(
      expect.any(String),
    );
  });

  // ============================================================
  // CANDIDATE NOT FOUND
  // ============================================================

  it('should reject when candidate does not exist', async () => {
    mockPrismaService.candidate.findUnique.mockResolvedValue(
      null,
    );

    const data = {
      candidateId: 'candidate-1',
      electionId: 'election-1',
    };

    await expect(
      service.castVote('user-1', data),
    ).rejects.toThrow(
      'Candidate not found',
    );

    expect(
      mockPrismaService.election.findUnique,
    ).not.toHaveBeenCalled();

    expect(
      mockPrismaService.vote.create,
    ).not.toHaveBeenCalled();
  });

  // ============================================================
  // ELECTION NOT FOUND
  // ============================================================

  it('should reject when election does not exist', async () => {
    mockPrismaService.candidate.findUnique.mockResolvedValue(
      {
        id: 'candidate-1',
        electionId: 'election-1',
      },
    );

    mockPrismaService.election.findUnique.mockResolvedValue(
      null,
    );

    const data = {
      candidateId: 'candidate-1',
      electionId: 'election-1',
    };

    await expect(
      service.castVote('user-1', data),
    ).rejects.toThrow(
      'Election not found',
    );

    expect(
      mockPrismaService.vote.create,
    ).not.toHaveBeenCalled();
  });

  // ============================================================
  // INACTIVE ELECTION
  // ============================================================

  it('should reject voting in an inactive election', async () => {
    mockPrismaService.candidate.findUnique.mockResolvedValue(
      {
        id: 'candidate-1',
        electionId: 'election-1',
      },
    );

    mockPrismaService.election.findUnique.mockResolvedValue(
      {
        id: 'election-1',
        status: 'PUBLISHED',
      },
    );

    const data = {
      candidateId: 'candidate-1',
      electionId: 'election-1',
    };

    await expect(
      service.castVote('user-1', data),
    ).rejects.toThrow(
      'Election is not active',
    );

    expect(
      mockPrismaService.vote.create,
    ).not.toHaveBeenCalled();
  });

  // ============================================================
  // DUPLICATE VOTE
  // ============================================================

  it('should reject when the user has already voted', async () => {
    mockPrismaService.candidate.findUnique.mockResolvedValue(
      {
        id: 'candidate-1',
        electionId: 'election-1',
      },
    );

    mockPrismaService.election.findUnique.mockResolvedValue(
      {
        id: 'election-1',
        status: 'ACTIVE',
      },
    );

    mockPrismaService.vote.findFirst.mockResolvedValueOnce(
      {
        id: 'existing-vote',
        voterId: 'user-1',
        electionId: 'election-1',
      },
    );

    const data = {
      candidateId: 'candidate-1',
      electionId: 'election-1',
    };

    await expect(
      service.castVote('user-1', data),
    ).rejects.toThrow(
      'You have already voted',
    );

    expect(
      mockPrismaService.vote.create,
    ).not.toHaveBeenCalled();
  });

  // ============================================================
  // PREVIOUS HASH
  // ============================================================

  it('should use the previous vote hash when creating a new vote', async () => {
    mockPrismaService.candidate.findUnique.mockResolvedValue(
      {
        id: 'candidate-2',
        electionId: 'election-1',
      },
    );

    mockPrismaService.election.findUnique.mockResolvedValue(
      {
        id: 'election-1',
        status: 'ACTIVE',
      },
    );

    // First call: check duplicate vote
    mockPrismaService.vote.findFirst.mockResolvedValueOnce(
      null,
    );

    // Second call: get latest vote
    mockPrismaService.vote.findFirst.mockResolvedValueOnce(
      {
        id: 'previous-vote',
        hash: 'previous-hash-123',
      },
    );

    mockPrismaService.vote.create.mockResolvedValue(
      {
        id: 'vote-2',
      },
    );

    const data = {
      candidateId: 'candidate-2',
      electionId: 'election-1',
    };

    await service.castVote(
      'user-2',
      data,
    );

    const createCall =
      mockPrismaService.vote.create.mock.calls[0][0];

    expect(createCall.data.previousHash).toBe(
      'previous-hash-123',
    );
  });

  // ============================================================
  // LATEST VOTE QUERY
  // ============================================================

  it('should retrieve the latest vote by createdAt', async () => {
    mockPrismaService.candidate.findUnique.mockResolvedValue(
      {
        id: 'candidate-1',
        electionId: 'election-1',
      },
    );

    mockPrismaService.election.findUnique.mockResolvedValue(
      {
        id: 'election-1',
        status: 'ACTIVE',
      },
    );

    mockPrismaService.vote.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        hash: 'previous-hash',
      });

    mockPrismaService.vote.create.mockResolvedValue(
      {
        id: 'vote-1',
      },
    );

    await service.castVote(
      'user-1',
      {
        candidateId: 'candidate-1',
        electionId: 'election-1',
      },
    );

    expect(
      mockPrismaService.vote.findFirst,
    ).toHaveBeenNthCalledWith(
      2,
      {
        orderBy: {
          createdAt: 'desc',
        },
      },
    );
  });
});