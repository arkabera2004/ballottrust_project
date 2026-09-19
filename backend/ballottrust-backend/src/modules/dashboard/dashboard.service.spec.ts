import { Test, TestingModule } from '@nestjs/testing';

import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockPrismaService = {
    election: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },

    candidate: {
      count: jest.fn(),
      findMany: jest.fn(),
    },

    vote: {
      count: jest.fn(),
    },

    user: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  // ============================================================
  // DEFINITION
  // ============================================================

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // GET STATS
  // ============================================================

  it('should return dashboard statistics', async () => {
    mockPrismaService.election.count
      .mockResolvedValueOnce(10) // elections
      .mockResolvedValueOnce(3) // active elections
      .mockResolvedValueOnce(2) // closed elections
      .mockResolvedValueOnce(4); // draft elections

    mockPrismaService.candidate.count.mockResolvedValue(25);

    mockPrismaService.vote.count.mockResolvedValue(40);

    mockPrismaService.election.findMany.mockResolvedValue([
      {
        id: 'election-1',
        title: 'Latest Election',
      },
    ]);

    mockPrismaService.user.count
      .mockResolvedValueOnce(100) // registered voters
      .mockResolvedValueOnce(20); // pending voters

    const result = await service.getStats();

    expect(result).toEqual({
      elections: 10,
      candidates: 25,
      votes: 40,

      activeElections: 3,
      closedElections: 2,
      draftElections: 4,

      registeredVoters: 100,
      pendingVoters: 20,

      turnout: 40,

      recentElections: [
        {
          id: 'election-1',
          title: 'Latest Election',
        },
      ],
    });

    expect(mockPrismaService.election.count).toHaveBeenNthCalledWith(1, {
      where: {
        deletedAt: null,
      },
    });

    expect(mockPrismaService.candidate.count).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
      },
    });

    expect(mockPrismaService.vote.count).toHaveBeenCalledWith();

    expect(mockPrismaService.user.count).toHaveBeenNthCalledWith(1, {
      where: {
        role: 'VOTER',
        deletedAt: null,
      },
    });
  });

  // ============================================================
  // ZERO VOTERS
  // ============================================================

  it('should return zero turnout when there are no registered voters', async () => {
    mockPrismaService.election.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    mockPrismaService.candidate.count.mockResolvedValue(0);

    mockPrismaService.vote.count.mockResolvedValue(0);

    mockPrismaService.election.findMany.mockResolvedValue([]);

    mockPrismaService.user.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const result = await service.getStats();

    expect(result.turnout).toBe(0);
  });

  // ============================================================
  // WINNER SUMMARY - NO ELECTION
  // ============================================================

  it('should return no elections message when no election exists', async () => {
    mockPrismaService.election.findFirst.mockResolvedValue(null);

    const result = await service.getWinnerSummary();

    expect(result).toEqual({
      message: 'No elections found',
    });

    expect(mockPrismaService.candidate.findMany).not.toHaveBeenCalled();
  });

  // ============================================================
  // WINNER SUMMARY - NO CANDIDATES
  // ============================================================

  it('should return no candidates message when latest election has no candidates', async () => {
    mockPrismaService.election.findFirst.mockResolvedValue({
      id: 'election-1',
      title: 'Student Election',
    });

    mockPrismaService.candidate.findMany.mockResolvedValue([]);

    const result = await service.getWinnerSummary();

    expect(result).toEqual({
      message: 'No candidates found',
    });
  });

  // ============================================================
  // WINNER SUMMARY
  // ============================================================

  it('should return the candidate with the highest vote count as winner', async () => {
    mockPrismaService.election.findFirst.mockResolvedValue({
      id: 'election-1',
      title: 'Student Council Election',
    });

    mockPrismaService.candidate.findMany.mockResolvedValue([
      {
        id: 'candidate-1',
        candidateNumber: 1,
        user: {
          id: 'user-1',
          fullName: 'Candidate One',
        },
        votes: [{ id: 'vote-1' }, { id: 'vote-2' }, { id: 'vote-3' }],
      },
      {
        id: 'candidate-2',
        candidateNumber: 2,
        user: {
          id: 'user-2',
          fullName: 'Candidate Two',
        },
        votes: [{ id: 'vote-4' }],
      },
    ]);

    const result = await service.getWinnerSummary();

    expect(result).toEqual({
      electionId: 'election-1',
      election: 'Student Council Election',
      winner: {
        candidateId: 'candidate-1',
        candidateName: 'Candidate One',
        candidateNumber: 1,
        votes: 3,
      },
    });

    expect(mockPrismaService.candidate.findMany).toHaveBeenCalledWith({
      where: {
        electionId: 'election-1',
        deletedAt: null,
        status: 'APPROVED',
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
        votes: true,
      },
    });
  });

  // ============================================================
  // RESULTS CHART
  // ============================================================

  it('should return election results chart data', async () => {
    mockPrismaService.candidate.findMany.mockResolvedValue([
      {
        id: 'candidate-1',
        candidateNumber: 1,
        user: {
          fullName: 'Candidate One',
        },
        votes: [{ id: 'vote-1' }, { id: 'vote-2' }],
      },
      {
        id: 'candidate-2',
        candidateNumber: 2,
        user: {
          fullName: 'Candidate Two',
        },
        votes: [{ id: 'vote-3' }],
      },
    ]);

    const result = await service.getResultsChart('election-1');

    expect(result).toEqual([
      {
        candidateId: 'candidate-1',
        candidateNumber: 1,
        name: 'Candidate One',
        votes: 2,
      },
      {
        candidateId: 'candidate-2',
        candidateNumber: 2,
        name: 'Candidate Two',
        votes: 1,
      },
    ]);

    expect(mockPrismaService.candidate.findMany).toHaveBeenCalledWith({
      where: {
        electionId: 'election-1',
        deletedAt: null,
        status: 'APPROVED',
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
        votes: true,
      },
    });
  });

  // ============================================================
  // CURRENT ELECTION - NONE
  // ============================================================

  it('should return null when there is no active election', async () => {
    mockPrismaService.election.findFirst.mockResolvedValue(null);

    const result = await service.getCurrentElection();

    expect(result).toBeNull();
  });

  // ============================================================
  // CURRENT ELECTION
  // ============================================================

  it('should return the current active election summary', async () => {
    mockPrismaService.election.findFirst.mockResolvedValue({
      id: 'election-1',
      title: 'Student Council Election',
      electionCode: 'BT-2026-SC-001',
      status: 'ACTIVE',

      candidates: [
        {
          id: 'candidate-1',
        },
        {
          id: 'candidate-2',
        },
      ],

      votes: [
        {
          id: 'vote-1',
        },
        {
          id: 'vote-2',
        },
        {
          id: 'vote-3',
        },
      ],
    });

    const result = await service.getCurrentElection();

    expect(result).toEqual({
      id: 'election-1',
      title: 'Student Council Election',
      electionCode: 'BT-2026-SC-001',
      status: 'ACTIVE',
      candidates: 2,
      votes: 3,
    });

    expect(mockPrismaService.election.findFirst).toHaveBeenCalledWith({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: {
        candidates: {
          where: {
            status: 'APPROVED',
            deletedAt: null,
          },
        },
        votes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });
});
