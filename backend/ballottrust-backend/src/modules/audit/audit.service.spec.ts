import { Test, TestingModule } from '@nestjs/testing';

import { AuditService } from './audit.service';
import { PrismaService } from '../../prisma/prisma.service';

import * as crypto from 'crypto';

describe('AuditService', () => {
  let service: AuditService;

  const mockTx = {
    auditLog: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockPrismaService = {
    $transaction: jest.fn((cb) => cb(mockTx)),
    auditLog: {
      findMany: jest.fn(),
    },
  };

  const hashOf = (
    previousHash: string,
    userId: string | null,
    action: string,
    module: string,
    entityType: string | undefined,
    entityId: string | undefined,
    result: string,
    createdAt: Date,
  ) =>
    crypto
      .createHash('sha256')
      .update(
        previousHash +
          (userId ?? '') +
          action +
          module +
          (entityType ?? '') +
          (entityId ?? '') +
          result +
          createdAt.toISOString(),
      )
      .digest('hex');

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrismaService.$transaction.mockImplementation((cb) => cb(mockTx));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // WRITE
  // ============================================================

  describe('log', () => {
    it('chains off GENESIS_BLOCK for the first record', async () => {
      mockTx.auditLog.findFirst.mockResolvedValue(null);
      mockTx.auditLog.create.mockResolvedValue({});

      await service.log({
        userId: 'user-1',
        action: 'LOGIN_SUCCESS',
        module: 'auth',
        result: 'SUCCESS',
      });

      const createCall = mockTx.auditLog.create.mock.calls[0][0];

      expect(createCall.data.previousHash).toBe('GENESIS_BLOCK');
      expect(createCall.data.hash).toEqual(expect.any(String));
    });

    it('chains off the previous record hash', async () => {
      mockTx.auditLog.findFirst.mockResolvedValue({
        hash: 'previous-hash-abc',
      });
      mockTx.auditLog.create.mockResolvedValue({});

      await service.log({
        userId: 'user-1',
        action: 'ELECTION_APPROVED',
        module: 'election',
        entityType: 'Election',
        entityId: 'election-1',
        result: 'SUCCESS',
      });

      const createCall = mockTx.auditLog.create.mock.calls[0][0];

      expect(createCall.data.previousHash).toBe('previous-hash-abc');
    });

    it('does not throw when the write fails after retries (fail-safe, not silent)', async () => {
      mockPrismaService.$transaction.mockRejectedValue(
        new Error('serialization_failure'),
      );

      await expect(
        service.log({
          action: 'VOTE_CAST',
          module: 'vote',
          result: 'SUCCESS',
        }),
      ).resolves.toBeUndefined();

      // One initial attempt + 2 retries.
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(3);
    });
  });

  // ============================================================
  // VERIFY
  // ============================================================

  describe('verifyChain', () => {
    it('reports valid when no records exist', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([]);

      const result = await service.verifyChain();

      expect(result).toEqual({
        valid: true,
        message: 'No audit records found',
      });
    });

    it('validates an intact chain', async () => {
      const createdAt1 = new Date('2026-01-01T00:00:00.000Z');
      const hash1 = hashOf(
        'GENESIS_BLOCK',
        'user-1',
        'LOGIN_SUCCESS',
        'auth',
        undefined,
        undefined,
        'SUCCESS',
        createdAt1,
      );

      const createdAt2 = new Date('2026-01-01T00:01:00.000Z');
      const hash2 = hashOf(
        hash1,
        'user-1',
        'ELECTION_APPROVED',
        'election',
        'Election',
        'election-1',
        'SUCCESS',
        createdAt2,
      );

      mockPrismaService.auditLog.findMany.mockResolvedValue([
        {
          id: 'log-1',
          userId: 'user-1',
          action: 'LOGIN_SUCCESS',
          module: 'auth',
          entityType: null,
          entityId: null,
          result: 'SUCCESS',
          createdAt: createdAt1,
          previousHash: 'GENESIS_BLOCK',
          hash: hash1,
        },
        {
          id: 'log-2',
          userId: 'user-1',
          action: 'ELECTION_APPROVED',
          module: 'election',
          entityType: 'Election',
          entityId: 'election-1',
          result: 'SUCCESS',
          createdAt: createdAt2,
          previousHash: hash1,
          hash: hash2,
        },
      ]);

      const result = await service.verifyChain();

      expect(result).toEqual({
        valid: true,
        message: 'Audit chain integrity verified',
        totalRecords: 2,
      });
    });

    it('detects a hash mismatch (tampered content)', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([
        {
          id: 'log-1',
          userId: 'user-1',
          action: 'LOGIN_SUCCESS',
          module: 'auth',
          entityType: null,
          entityId: null,
          result: 'SUCCESS',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          previousHash: 'GENESIS_BLOCK',
          hash: 'TAMPERED_HASH',
        },
      ]);

      const result = await service.verifyChain();

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Hash mismatch at audit record log-1');
    });

    it('detects a broken chain link', async () => {
      const createdAt1 = new Date('2026-01-01T00:00:00.000Z');
      const hash1 = hashOf(
        'GENESIS_BLOCK',
        'user-1',
        'LOGIN_SUCCESS',
        'auth',
        undefined,
        undefined,
        'SUCCESS',
        createdAt1,
      );

      const createdAt2 = new Date('2026-01-01T00:01:00.000Z');
      const wrongPreviousHash = 'DOES_NOT_MATCH_HASH1';
      const hash2 = hashOf(
        wrongPreviousHash,
        'user-1',
        'ELECTION_APPROVED',
        'election',
        'Election',
        'election-1',
        'SUCCESS',
        createdAt2,
      );

      mockPrismaService.auditLog.findMany.mockResolvedValue([
        {
          id: 'log-1',
          userId: 'user-1',
          action: 'LOGIN_SUCCESS',
          module: 'auth',
          entityType: null,
          entityId: null,
          result: 'SUCCESS',
          createdAt: createdAt1,
          previousHash: 'GENESIS_BLOCK',
          hash: hash1,
        },
        {
          id: 'log-2',
          userId: 'user-1',
          action: 'ELECTION_APPROVED',
          module: 'election',
          entityType: 'Election',
          entityId: 'election-1',
          result: 'SUCCESS',
          createdAt: createdAt2,
          previousHash: wrongPreviousHash,
          hash: hash2,
        },
      ]);

      const result = await service.verifyChain();

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Broken chain at audit record log-2');
    });
  });
});
