import { Test, TestingModule } from '@nestjs/testing';

import { ResultService } from './result.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ResultService', () => {
  let service: ResultService;

  const mockPrismaService = {
    election: {
      findFirst: jest.fn(),
    },

    candidate: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          ResultService,
          {
            provide: PrismaService,
            useValue: mockPrismaService,
          },
        ],
      }).compile();

    service =
      module.get<ResultService>(
        ResultService,
      );
  });

  // ============================================================
  // DEFINITION
  // ============================================================

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // ELECTION NOT FOUND
  // ============================================================

  it('should throw NotFoundException when election does not exist', async () => {
    mockPrismaService.election.findFirst
      .mockResolvedValue(null);

    await expect(
      service.getResults('election-1'),
    ).rejects.toThrow(
      'Election not found.',
    );

    expect(
      mockPrismaService.election.findFirst,
    ).toHaveBeenCalledWith({
      where: {
        id: 'election-1',
        deletedAt: null,
      },
    });

    expect(
      mockPrismaService.candidate.findMany,
    ).not.toHaveBeenCalled();
  });

  // ============================================================
  // NO CANDIDATES
  // ============================================================

  it('should return empty results when the election has no approved candidates', async () => {
    const election = {
      id: 'election-1',
      title: 'Student Council Election',
      status: 'VOTING_CLOSED',
      deletedAt: null,
    };

    mockPrismaService.election.findFirst
      .mockResolvedValue(election);

    mockPrismaService.candidate.findMany
      .mockResolvedValue([]);

    const result =
      await service.getResults(
        'election-1',
      );

    expect(result).toEqual({
      election,

      totalCandidates: 0,

      totalVotes: 0,

      results: [],

      winner: null,
    });

    expect(
      mockPrismaService.candidate.findMany,
    ).toHaveBeenCalledWith({
      where: {
        electionId: 'election-1',
        status: 'APPROVED',
        deletedAt: null,
      },

      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },

        party: {
          select: {
            id: true,
            name: true,
            abbreviation: true,
            symbol: true,
          },
        },

        votes: true,
      },
    });
  });

  // ============================================================
  // RESULTS + WINNER
  // ============================================================

  it('should calculate results, total votes and winner correctly', async () => {
    const election = {
      id: 'election-1',
      title: 'Student Council Election',
      status: 'VOTING_CLOSED',
      deletedAt: null,
    };

    mockPrismaService.election.findFirst
      .mockResolvedValue(election);

    mockPrismaService.candidate.findMany
      .mockResolvedValue([
        {
          id: 'candidate-1',
          candidateNumber: 1,
          candidateType: 'INDEPENDENT',

          user: {
            id: 'user-1',
            fullName: 'Candidate One',
          },

          party: null,

          votes: [
            { id: 'vote-1' },
            { id: 'vote-2' },
            { id: 'vote-3' },
          ],
        },

        {
          id: 'candidate-2',
          candidateNumber: 2,
          candidateType: 'PARTY',

          user: {
            id: 'user-2',
            fullName: 'Candidate Two',
          },

          party: {
            id: 'party-1',
            name: 'Student Unity Party',
            abbreviation: 'SUP',
            symbol: '🌟',
          },

          votes: [
            { id: 'vote-4' },
          ],
        },
      ]);

    const result =
      await service.getResults(
        'election-1',
      );

    expect(result.election).toEqual(
      election,
    );

    expect(
      result.totalCandidates,
    ).toBe(2);

    expect(
      result.totalVotes,
    ).toBe(4);

    expect(result.results).toEqual([
      {
        candidateId: 'candidate-1',
        userId: 'user-1',
        candidateName: 'Candidate One',
        candidateNumber: 1,
        candidateType: 'INDEPENDENT',
        party: null,
        votes: 3,
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
        votes: 1,
      },
    ]);

    expect(result.winner).toEqual({
      candidateId: 'candidate-1',
      userId: 'user-1',
      candidateName: 'Candidate One',
      candidateNumber: 1,
      candidateType: 'INDEPENDENT',
      party: null,
      votes: 3,
    });
  });

  // ============================================================
  // SORTING
  // ============================================================

  it('should sort candidates by descending vote count', async () => {
    mockPrismaService.election.findFirst
      .mockResolvedValue({
        id: 'election-1',
        title: 'Election',
      });

    mockPrismaService.candidate.findMany
      .mockResolvedValue([
        {
          id: 'candidate-1',
          candidateNumber: 1,
          candidateType: 'INDEPENDENT',
          user: {
            id: 'user-1',
            fullName: 'Candidate One',
          },
          party: null,
          votes: [
            { id: 'vote-1' },
          ],
        },

        {
          id: 'candidate-2',
          candidateNumber: 2,
          candidateType: 'INDEPENDENT',
          user: {
            id: 'user-2',
            fullName: 'Candidate Two',
          },
          party: null,
          votes: [
            { id: 'vote-2' },
            { id: 'vote-3' },
            { id: 'vote-4' },
          ],
        },
      ]);

    const result =
      await service.getResults(
        'election-1',
      );

    expect(
      result.results[0].candidateId,
    ).toBe('candidate-2');

    expect(
      result.results[0].votes,
    ).toBe(3);

    expect(
      result.winner?.candidateId,
    ).toBe('candidate-2');
  });
});