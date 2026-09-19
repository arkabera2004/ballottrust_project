import { Test, TestingModule } from '@nestjs/testing';

import { VoteService } from './vote.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CheckVoterEligibilityService } from '../eligibility/services/check-voter-eligibility.service';
import { CheckVoterRollService } from '../voter/services/check-voter-roll.service';

describe('VoteService', () => {
  let service: VoteService;

  const mockTx = {
    voterCredential: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
    },
    vote: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockPrismaService = {
    candidate: {
      findUnique: jest.fn(),
    },

    election: {
      findUnique: jest.fn(),
    },

    $transaction: jest.fn((cb) => cb(mockTx)),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockCheckVoterEligibilityService = {
    execute: jest.fn(),
  };

  const mockCheckVoterRollService = {
    execute: jest.fn(),
  };

  const approvedCandidate = {
    id: 'candidate-1',
    electionId: 'election-1',
    status: 'APPROVED',
  };

  const activeElection = {
    id: 'election-1',
    status: 'ACTIVE',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrismaService.$transaction.mockImplementation((cb) => cb(mockTx));
    // Eligible by default — tests exercising ineligibility override this.
    mockCheckVoterEligibilityService.execute.mockResolvedValue({
      eligible: true,
      explanation: { type: 'AND', passed: true, rules: [] },
      ruleSetId: null,
      ruleSetVersion: 0,
    });
    // Admitted by default — the roll is only authoritative for elections
    // that configure a registration window.
    mockCheckVoterRollService.execute.mockResolvedValue({
      admitted: true,
      rollEnforced: false,
      status: null,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoteService,

        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },

        {
          provide: AuditService,
          useValue: mockAuditService,
        },

        {
          provide: CheckVoterEligibilityService,
          useValue: mockCheckVoterEligibilityService,
        },

        {
          provide: CheckVoterRollService,
          useValue: mockCheckVoterRollService,
        },
      ],
    }).compile();

    service = module.get<VoteService>(VoteService);
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

  it('should cast a vote successfully without storing voter identity', async () => {
    mockPrismaService.candidate.findUnique.mockResolvedValue(approvedCandidate);
    mockPrismaService.election.findUnique.mockResolvedValue(activeElection);

    mockTx.voterCredential.upsert.mockResolvedValue({
      id: 'credential-1',
      hasVoted: false,
    });
    mockTx.voterCredential.updateMany.mockResolvedValue({
      count: 1,
    });
    mockTx.vote.findFirst.mockResolvedValue(null);

    const createdVote = {
      id: 'vote-1',
      candidateId: 'candidate-1',
      electionId: 'election-1',
      hash: 'generated-hash',
      previousHash: 'GENESIS_BLOCK',
    };
    mockTx.vote.create.mockResolvedValue(createdVote);

    const data = {
      candidateId: 'candidate-1',
      electionId: 'election-1',
    };

    const result = await service.castVote('user-1', data);

    expect(result).toEqual(createdVote);

    expect(mockPrismaService.candidate.findUnique).toHaveBeenCalledWith({
      where: { id: 'candidate-1' },
    });

    expect(mockPrismaService.election.findUnique).toHaveBeenCalledWith({
      where: { id: 'election-1' },
    });

    // Credential issued/consumed for the voter+election, never the choice.
    expect(mockTx.voterCredential.upsert).toHaveBeenCalledWith({
      where: {
        userId_electionId: {
          userId: 'user-1',
          electionId: 'election-1',
        },
      },
      update: {},
      create: {
        userId: 'user-1',
        electionId: 'election-1',
      },
    });

    expect(mockTx.voterCredential.updateMany).toHaveBeenCalledWith({
      where: { id: 'credential-1', hasVoted: false },
      data: expect.objectContaining({ hasVoted: true }),
    });

    expect(mockTx.vote.create).toHaveBeenCalled();

    const createCall = mockTx.vote.create.mock.calls[0][0];

    // No voterId anywhere in the Vote row — only an anonymous token.
    expect(createCall.data).not.toHaveProperty('voterId');
    expect(createCall.data).toEqual(
      expect.objectContaining({
        anonymousToken: expect.any(String),
        candidateId: 'candidate-1',
        electionId: 'election-1',
        previousHash: 'GENESIS_BLOCK',
      }),
    );
    expect(createCall.data.hash).toEqual(expect.any(String));

    // Audit trail records that user-1 voted in this election, but never
    // which candidate — that link must never exist next to a userId.
    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        action: 'VOTE_CAST',
        entityId: 'election-1',
        result: 'SUCCESS',
      }),
    );

    const auditCall = mockAuditService.log.mock.calls[0][0];
    expect(auditCall).not.toHaveProperty('candidateId');
    expect(JSON.stringify(auditCall)).not.toContain('candidate-1');
  });

  // ============================================================
  // CANDIDATE NOT FOUND / NOT APPROVED / WRONG ELECTION
  // ============================================================

  it('should reject when candidate does not exist', async () => {
    mockPrismaService.candidate.findUnique.mockResolvedValue(null);

    await expect(
      service.castVote('user-1', {
        candidateId: 'candidate-1',
        electionId: 'election-1',
      }),
    ).rejects.toThrow('Candidate not found');

    expect(mockPrismaService.election.findUnique).not.toHaveBeenCalled();
    expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
  });

  it('should reject when candidate belongs to a different election', async () => {
    mockPrismaService.candidate.findUnique.mockResolvedValue({
      id: 'candidate-1',
      electionId: 'some-other-election',
      status: 'APPROVED',
    });

    await expect(
      service.castVote('user-1', {
        candidateId: 'candidate-1',
        electionId: 'election-1',
      }),
    ).rejects.toThrow('Candidate not found');

    expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
  });

  it('should reject when candidate is not approved', async () => {
    mockPrismaService.candidate.findUnique.mockResolvedValue({
      id: 'candidate-1',
      electionId: 'election-1',
      status: 'PENDING',
    });

    await expect(
      service.castVote('user-1', {
        candidateId: 'candidate-1',
        electionId: 'election-1',
      }),
    ).rejects.toThrow('Candidate not found');

    expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
  });

  // ============================================================
  // ELECTION NOT FOUND / INACTIVE
  // ============================================================

  it('should reject when election does not exist', async () => {
    mockPrismaService.candidate.findUnique.mockResolvedValue(approvedCandidate);
    mockPrismaService.election.findUnique.mockResolvedValue(null);

    await expect(
      service.castVote('user-1', {
        candidateId: 'candidate-1',
        electionId: 'election-1',
      }),
    ).rejects.toThrow('Election not found');

    expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
  });

  it('should reject voting in an inactive election', async () => {
    mockPrismaService.candidate.findUnique.mockResolvedValue(approvedCandidate);
    mockPrismaService.election.findUnique.mockResolvedValue({
      id: 'election-1',
      status: 'PUBLISHED',
    });

    await expect(
      service.castVote('user-1', {
        candidateId: 'candidate-1',
        electionId: 'election-1',
      }),
    ).rejects.toThrow('Election is not active');

    expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
  });

  // ============================================================
  // INELIGIBLE VOTER (Sec4)
  // ============================================================

  it('should reject a voter the eligibility engine marks ineligible, without touching the ledger', async () => {
    mockPrismaService.candidate.findUnique.mockResolvedValue(approvedCandidate);
    mockPrismaService.election.findUnique.mockResolvedValue(activeElection);

    mockCheckVoterEligibilityService.execute.mockResolvedValue({
      eligible: false,
      explanation: { type: 'AND', passed: false, rules: [] },
      ruleSetId: 'ruleset-1',
      ruleSetVersion: 2,
    });

    await expect(
      service.castVote('user-1', {
        candidateId: 'candidate-1',
        electionId: 'election-1',
      }),
    ).rejects.toThrow('You are not eligible to vote in this election');

    expect(mockCheckVoterEligibilityService.execute).toHaveBeenCalledWith(
      'user-1',
      'election-1',
    );

    expect(mockPrismaService.$transaction).not.toHaveBeenCalled();

    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        action: 'VOTE_CAST_REJECTED',
        entityId: 'election-1',
        result: 'FAILURE',
      }),
    );
  });

  // ============================================================
  // DUPLICATE VOTE
  // ============================================================

  it('should reject when the credential shows the voter already voted', async () => {
    mockPrismaService.candidate.findUnique.mockResolvedValue(approvedCandidate);
    mockPrismaService.election.findUnique.mockResolvedValue(activeElection);

    mockTx.voterCredential.upsert.mockResolvedValue({
      id: 'credential-1',
      hasVoted: true,
    });

    await expect(
      service.castVote('user-1', {
        candidateId: 'candidate-1',
        electionId: 'election-1',
      }),
    ).rejects.toThrow('You have already voted');

    expect(mockTx.voterCredential.updateMany).not.toHaveBeenCalled();
    expect(mockTx.vote.create).not.toHaveBeenCalled();

    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        action: 'VOTE_CAST_REJECTED',
        entityId: 'election-1',
        result: 'FAILURE',
      }),
    );
  });

  it('should reject a concurrent duplicate that loses the conditional update race', async () => {
    mockPrismaService.candidate.findUnique.mockResolvedValue(approvedCandidate);
    mockPrismaService.election.findUnique.mockResolvedValue(activeElection);

    mockTx.voterCredential.upsert.mockResolvedValue({
      id: 'credential-1',
      hasVoted: false,
    });

    // Another concurrent request already flipped hasVoted to true between
    // the read and this write — the conditional update matches 0 rows.
    mockTx.voterCredential.updateMany.mockResolvedValue({
      count: 0,
    });

    await expect(
      service.castVote('user-1', {
        candidateId: 'candidate-1',
        electionId: 'election-1',
      }),
    ).rejects.toThrow('You have already voted');

    expect(mockTx.vote.create).not.toHaveBeenCalled();
  });

  // ============================================================
  // PER-ELECTION HASH CHAIN
  // ============================================================

  it('should chain off the latest vote hash scoped to the election', async () => {
    mockPrismaService.candidate.findUnique.mockResolvedValue({
      id: 'candidate-2',
      electionId: 'election-1',
      status: 'APPROVED',
    });
    mockPrismaService.election.findUnique.mockResolvedValue(activeElection);

    mockTx.voterCredential.upsert.mockResolvedValue({
      id: 'credential-2',
      hasVoted: false,
    });
    mockTx.voterCredential.updateMany.mockResolvedValue({
      count: 1,
    });

    mockTx.vote.findFirst.mockResolvedValue({
      id: 'previous-vote',
      hash: 'previous-hash-123',
    });

    mockTx.vote.create.mockResolvedValue({ id: 'vote-2' });

    await service.castVote('user-2', {
      candidateId: 'candidate-2',
      electionId: 'election-1',
    });

    expect(mockTx.vote.findFirst).toHaveBeenCalledWith({
      where: { electionId: 'election-1' },
      orderBy: { createdAt: 'desc' },
    });

    const createCall = mockTx.vote.create.mock.calls[0][0];
    expect(createCall.data.previousHash).toBe('previous-hash-123');
  });
});
