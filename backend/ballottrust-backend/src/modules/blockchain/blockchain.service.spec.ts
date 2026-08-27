import { Test, TestingModule } from '@nestjs/testing';

import { BlockchainService } from './blockchain.service';
import { PrismaService } from '../../prisma/prisma.service';

import * as crypto from 'crypto';

describe('BlockchainService', () => {
  let service: BlockchainService;

  const mockPrismaService = {
    vote: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          BlockchainService,
          {
            provide: PrismaService,
            useValue: mockPrismaService,
          },
        ],
      }).compile();

    service =
      module.get<BlockchainService>(
        BlockchainService,
      );
  });

  // ============================================================
  // DEFINITION
  // ============================================================

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // EMPTY BLOCKCHAIN
  // ============================================================

  it('should return valid when no votes exist', async () => {
    mockPrismaService.vote.findMany
      .mockResolvedValue([]);

    const result =
      await service.verifyChain();

    expect(result).toEqual({
      valid: true,
      message: 'No votes found',
    });

    expect(
      mockPrismaService.vote.findMany,
    ).toHaveBeenCalledWith({
      orderBy: {
        createdAt: 'asc',
      },
    });
  });

  // ============================================================
  // VALID SINGLE VOTE
  // ============================================================

  it('should validate a single vote with a correct hash', async () => {
    const voterId = 'voter-1';
    const candidateId = 'candidate-1';
    const electionId = 'election-1';
    const previousHash = 'GENESIS_BLOCK';

    const hash = crypto
      .createHash('sha256')
      .update(
        voterId +
          candidateId +
          electionId +
          previousHash,
      )
      .digest('hex');

    mockPrismaService.vote.findMany
      .mockResolvedValue([
        {
          id: 'vote-1',
          voterId,
          candidateId,
          electionId,
          previousHash,
          hash,
        },
      ]);

    const result =
      await service.verifyChain();

    expect(result).toEqual({
      valid: true,
      message:
        'Blockchain integrity verified',
      totalVotes: 1,
    });
  });

  // ============================================================
  // HASH MISMATCH
  // ============================================================

  it('should detect a hash mismatch', async () => {
    mockPrismaService.vote.findMany
      .mockResolvedValue([
        {
          id: 'vote-1',
          voterId: 'voter-1',
          candidateId: 'candidate-1',
          electionId: 'election-1',
          previousHash: 'GENESIS_BLOCK',
          hash: 'INVALID_HASH',
        },
      ]);

    const result =
      await service.verifyChain();

    expect(result).toEqual({
      valid: false,
      message:
        'Hash mismatch at vote vote-1',
    });
  });

  // ============================================================
  // BROKEN CHAIN
  // ============================================================

  it('should detect a broken blockchain chain', async () => {
    const firstVote = {
      id: 'vote-1',
      voterId: 'voter-1',
      candidateId: 'candidate-1',
      electionId: 'election-1',
      previousHash: 'GENESIS_BLOCK',
    };

    const firstHash = crypto
      .createHash('sha256')
      .update(
        firstVote.voterId +
          firstVote.candidateId +
          firstVote.electionId +
          firstVote.previousHash,
      )
      .digest('hex');

    const secondVote = {
      id: 'vote-2',
      voterId: 'voter-2',
      candidateId: 'candidate-2',
      electionId: 'election-1',

      // Deliberately incorrect previous hash.
      previousHash: 'BROKEN_PREVIOUS_HASH',

      hash: '',
    };

    const secondHash = crypto
      .createHash('sha256')
      .update(
        secondVote.voterId +
          secondVote.candidateId +
          secondVote.electionId +
          secondVote.previousHash,
      )
      .digest('hex');

    secondVote.hash = secondHash;

    mockPrismaService.vote.findMany
      .mockResolvedValue([
        {
          ...firstVote,
          hash: firstHash,
        },
        secondVote,
      ]);

    const result =
      await service.verifyChain();

    expect(result).toEqual({
      valid: false,
      message:
        'Broken chain at vote vote-2',
    });
  });

  // ============================================================
  // VALID MULTIPLE VOTE CHAIN
  // ============================================================

  it('should validate a complete multi-vote chain', async () => {
    const vote1 = {
      id: 'vote-1',
      voterId: 'voter-1',
      candidateId: 'candidate-1',
      electionId: 'election-1',
      previousHash: 'GENESIS_BLOCK',
    };

    const hash1 = crypto
      .createHash('sha256')
      .update(
        vote1.voterId +
          vote1.candidateId +
          vote1.electionId +
          vote1.previousHash,
      )
      .digest('hex');

    const vote2 = {
      id: 'vote-2',
      voterId: 'voter-2',
      candidateId: 'candidate-2',
      electionId: 'election-1',
      previousHash: hash1,
    };

    const hash2 = crypto
      .createHash('sha256')
      .update(
        vote2.voterId +
          vote2.candidateId +
          vote2.electionId +
          vote2.previousHash,
      )
      .digest('hex');

    mockPrismaService.vote.findMany
      .mockResolvedValue([
        {
          ...vote1,
          hash: hash1,
        },
        {
          ...vote2,
          hash: hash2,
        },
      ]);

    const result =
      await service.verifyChain();

    expect(result).toEqual({
      valid: true,
      message:
        'Blockchain integrity verified',
      totalVotes: 2,
    });
  });
});