import { Test, TestingModule } from '@nestjs/testing';

import { BlockchainService } from './blockchain.service';
import { PrismaService } from '../../prisma/prisma.service';

import * as crypto from 'crypto';

describe('BlockchainService', () => {
  let service: BlockchainService;

  const mockPrismaService = {
    election: {
      findMany: jest.fn(),
    },
    vote: {
      findMany: jest.fn(),
    },
  };

  const hashOf = (
    anonymousToken: string,
    candidateId: string,
    electionId: string,
    previousHash: string,
  ) =>
    crypto
      .createHash('sha256')
      .update(
        anonymousToken +
          candidateId +
          electionId +
          previousHash,
      )
      .digest('hex');

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
  // SINGLE-ELECTION VERIFICATION (electionId provided)
  // ============================================================

  describe('single election', () => {
    it('should return valid when no votes exist', async () => {
      mockPrismaService.vote.findMany.mockResolvedValue([]);

      const result = await service.verifyChain('election-1');

      expect(result).toEqual({
        electionId: 'election-1',
        valid: true,
        message: 'No votes found',
      });

      expect(mockPrismaService.vote.findMany).toHaveBeenCalledWith({
        where: { electionId: 'election-1' },
        orderBy: { createdAt: 'asc' },
      });

      // Scoped lookup never needs to enumerate every election.
      expect(mockPrismaService.election.findMany).not.toHaveBeenCalled();
    });

    it('should validate a chain using anonymousToken, not voterId', async () => {
      const previousHash = 'GENESIS_BLOCK';
      const hash = hashOf(
        'anon-token-1',
        'candidate-1',
        'election-1',
        previousHash,
      );

      mockPrismaService.vote.findMany.mockResolvedValue([
        {
          id: 'vote-1',
          anonymousToken: 'anon-token-1',
          candidateId: 'candidate-1',
          electionId: 'election-1',
          previousHash,
          hash,
        },
      ]);

      const result = await service.verifyChain('election-1');

      expect(result).toEqual({
        electionId: 'election-1',
        valid: true,
        message: 'Blockchain integrity verified',
        totalVotes: 1,
      });
    });

    it('should detect a hash mismatch', async () => {
      mockPrismaService.vote.findMany.mockResolvedValue([
        {
          id: 'vote-1',
          anonymousToken: 'anon-token-1',
          candidateId: 'candidate-1',
          electionId: 'election-1',
          previousHash: 'GENESIS_BLOCK',
          hash: 'INVALID_HASH',
        },
      ]);

      const result = await service.verifyChain('election-1');

      expect(result).toEqual({
        electionId: 'election-1',
        valid: false,
        message: 'Hash mismatch at vote vote-1',
        totalVotes: 1,
      });
    });

    it('should detect a broken chain', async () => {
      const firstPreviousHash = 'GENESIS_BLOCK';
      const firstHash = hashOf(
        'anon-token-1',
        'candidate-1',
        'election-1',
        firstPreviousHash,
      );

      // Deliberately wrong previousHash on the second vote.
      const secondPreviousHash = 'BROKEN_PREVIOUS_HASH';
      const secondHash = hashOf(
        'anon-token-2',
        'candidate-2',
        'election-1',
        secondPreviousHash,
      );

      mockPrismaService.vote.findMany.mockResolvedValue([
        {
          id: 'vote-1',
          anonymousToken: 'anon-token-1',
          candidateId: 'candidate-1',
          electionId: 'election-1',
          previousHash: firstPreviousHash,
          hash: firstHash,
        },
        {
          id: 'vote-2',
          anonymousToken: 'anon-token-2',
          candidateId: 'candidate-2',
          electionId: 'election-1',
          previousHash: secondPreviousHash,
          hash: secondHash,
        },
      ]);

      const result = await service.verifyChain('election-1');

      expect(result).toEqual({
        electionId: 'election-1',
        valid: false,
        message: 'Broken chain at vote vote-2',
        totalVotes: 2,
      });
    });

    it('should validate a complete multi-vote chain', async () => {
      const hash1 = hashOf(
        'anon-token-1',
        'candidate-1',
        'election-1',
        'GENESIS_BLOCK',
      );

      const hash2 = hashOf(
        'anon-token-2',
        'candidate-2',
        'election-1',
        hash1,
      );

      mockPrismaService.vote.findMany.mockResolvedValue([
        {
          id: 'vote-1',
          anonymousToken: 'anon-token-1',
          candidateId: 'candidate-1',
          electionId: 'election-1',
          previousHash: 'GENESIS_BLOCK',
          hash: hash1,
        },
        {
          id: 'vote-2',
          anonymousToken: 'anon-token-2',
          candidateId: 'candidate-2',
          electionId: 'election-1',
          previousHash: hash1,
          hash: hash2,
        },
      ]);

      const result = await service.verifyChain('election-1');

      expect(result).toEqual({
        electionId: 'election-1',
        valid: true,
        message: 'Blockchain integrity verified',
        totalVotes: 2,
      });
    });
  });

  // ============================================================
  // ALL-ELECTIONS VERIFICATION (no electionId)
  // ============================================================

  describe('all elections', () => {
    it('enumerates elections and verifies each chain independently', async () => {
      mockPrismaService.election.findMany.mockResolvedValue([
        { id: 'election-1' },
        { id: 'election-2' },
      ]);

      const hash1 = hashOf(
        'anon-token-1',
        'candidate-1',
        'election-1',
        'GENESIS_BLOCK',
      );

      mockPrismaService.vote.findMany
        .mockResolvedValueOnce([
          {
            id: 'vote-1',
            anonymousToken: 'anon-token-1',
            candidateId: 'candidate-1',
            electionId: 'election-1',
            previousHash: 'GENESIS_BLOCK',
            hash: hash1,
          },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.verifyChain();

      expect(result).toEqual({
        valid: true,
        elections: [
          {
            electionId: 'election-1',
            valid: true,
            message: 'Blockchain integrity verified',
            totalVotes: 1,
          },
          {
            electionId: 'election-2',
            valid: true,
            message: 'No votes found',
          },
        ],
      });
    });

    it('is invalid overall if any single election chain is invalid', async () => {
      mockPrismaService.election.findMany.mockResolvedValue([
        { id: 'election-1' },
      ]);

      mockPrismaService.vote.findMany.mockResolvedValue([
        {
          id: 'vote-1',
          anonymousToken: 'anon-token-1',
          candidateId: 'candidate-1',
          electionId: 'election-1',
          previousHash: 'GENESIS_BLOCK',
          hash: 'INVALID_HASH',
        },
      ]);

      const result = await service.verifyChain();

      expect(result.valid).toBe(false);
    });
  });
});
