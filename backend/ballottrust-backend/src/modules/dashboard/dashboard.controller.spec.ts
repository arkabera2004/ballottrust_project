import { Test, TestingModule } from '@nestjs/testing';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;

  const mockDashboardService = {
    getStats: jest.fn(),
    getWinnerSummary: jest.fn(),
    getResultsChart: jest.fn(),
    getCurrentElection: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],

      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  // ============================================================
  // DEFINITION
  // ============================================================

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ============================================================
  // GET STATS
  // ============================================================

  it('should return dashboard statistics', async () => {
    const stats = {
      elections: 10,
      candidates: 25,
      votes: 40,
      activeElections: 3,
      closedElections: 2,
      draftElections: 4,
      registeredVoters: 100,
      pendingVoters: 20,
      turnout: 40,
      recentElections: [],
    };

    mockDashboardService.getStats.mockResolvedValue(stats);

    const result = await controller.getStats();

    expect(result).toEqual(stats);

    expect(mockDashboardService.getStats).toHaveBeenCalledTimes(1);
  });

  // ============================================================
  // WINNER SUMMARY
  // ============================================================

  it('should return winner summary', async () => {
    const summary = {
      electionId: 'election-1',
      election: 'Student Council Election',
      winner: {
        candidateId: 'candidate-1',
        candidateName: 'Candidate One',
        candidateNumber: 1,
        votes: 10,
      },
    };

    mockDashboardService.getWinnerSummary.mockResolvedValue(summary);

    const result = await controller.getWinnerSummary();

    expect(result).toEqual(summary);

    expect(mockDashboardService.getWinnerSummary).toHaveBeenCalledTimes(1);
  });

  // ============================================================
  // RESULTS CHART
  // ============================================================

  it('should return results chart data', async () => {
    const chart = [
      {
        candidateId: 'candidate-1',
        candidateNumber: 1,
        name: 'Candidate One',
        votes: 10,
      },
    ];

    mockDashboardService.getResultsChart.mockResolvedValue(chart);

    const result = await controller.getResultsChart('election-1');

    expect(result).toEqual(chart);

    expect(mockDashboardService.getResultsChart).toHaveBeenCalledWith(
      'election-1',
    );
  });

  // ============================================================
  // CURRENT ELECTION
  // ============================================================

  it('should return the current active election', async () => {
    const election = {
      id: 'election-1',
      title: 'Student Council Election',
      electionCode: 'BT-2026-SC-001',
      status: 'ACTIVE',
      candidates: 5,
      votes: 20,
    };

    mockDashboardService.getCurrentElection.mockResolvedValue(election);

    const result = await controller.getCurrentElection();

    expect(result).toEqual(election);

    expect(mockDashboardService.getCurrentElection).toHaveBeenCalledTimes(1);
  });
});
