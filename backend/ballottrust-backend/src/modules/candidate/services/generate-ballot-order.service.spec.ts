import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import {
  BallotOrderMethod,
  CandidateType,
  ElectionStatus,
} from '@prisma/client';

import { GenerateBallotOrderService } from './generate-ballot-order.service';

import { CandidateRepository } from '../repository/candidate.repository';

import { BallotLifecycleValidator } from '../validators/ballot-lifecycle.validator';

describe('GenerateBallotOrderService', () => {
  let service: GenerateBallotOrderService;

  const candidateRepository = {
    findElectionBallotState: jest.fn(),
    findEligibleForBallot: jest.fn(),
    replaceBallotOrders: jest.fn(),
  };

  const ballotLifecycleValidator = {
    validateModification: jest.fn(),
  };

  const eligibleCandidates = [
    {
      id: 'c1',
      candidateNumber: 2,
      candidateType: CandidateType.INDEPENDENT,
      position: 'President',
      party: null,
      user: {
        fullName: 'Charlie Candidate',
      },
    },
    {
      id: 'c2',
      candidateNumber: 1,
      candidateType: CandidateType.INDEPENDENT,
      position: 'President',
      party: null,
      user: {
        fullName: 'Alice Candidate',
      },
    },
    {
      id: 'c3',
      candidateNumber: 3,
      candidateType: CandidateType.INDEPENDENT,
      position: 'President',
      party: null,
      user: {
        fullName: 'Bob Candidate',
      },
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();

    candidateRepository.findElectionBallotState
      .mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
      });

    candidateRepository.findEligibleForBallot
      .mockResolvedValue(
        eligibleCandidates,
      );

    candidateRepository.replaceBallotOrders
      .mockResolvedValue(undefined);

    service =
      new GenerateBallotOrderService(
        candidateRepository as unknown as CandidateRepository,
        ballotLifecycleValidator as unknown as BallotLifecycleValidator,
      );
  });

  // ======================================================
  // 1. Candidate Number Ordering
  // ======================================================

  it('should generate ballot order by candidate number', async () => {
    const result =
      await service.execute(
        'election-1',
        BallotOrderMethod.CANDIDATE_NUMBER,
      );

    expect(result.map(
      (candidate) => candidate.id,
    )).toEqual([
      'c2',
      'c1',
      'c3',
    ]);

    expect(result.map(
      (candidate) => candidate.ballotOrder,
    )).toEqual([
      1,
      2,
      3,
    ]);

    expect(
      candidateRepository.replaceBallotOrders,
    ).toHaveBeenCalledWith(
      'election-1',
      BallotOrderMethod.CANDIDATE_NUMBER,
      [
        {
          candidateId: 'c2',
          ballotOrder: 1,
        },
        {
          candidateId: 'c1',
          ballotOrder: 2,
        },
        {
          candidateId: 'c3',
          ballotOrder: 3,
        },
      ],
    );
  });

  // ======================================================
  // 2. Alphabetical Ordering
  // ======================================================

  it('should generate ballot order alphabetically by candidate name', async () => {
    const result =
      await service.execute(
        'election-1',
        BallotOrderMethod.ALPHABETICAL,
      );

    expect(result.map(
      (candidate) => candidate.fullName,
    )).toEqual([
      'Alice Candidate',
      'Bob Candidate',
      'Charlie Candidate',
    ]);

    expect(result.map(
      (candidate) => candidate.ballotOrder,
    )).toEqual([
      1,
      2,
      3,
    ]);

    expect(
      candidateRepository.replaceBallotOrders,
    ).toHaveBeenCalledWith(
      'election-1',
      BallotOrderMethod.ALPHABETICAL,
      [
        {
          candidateId: 'c2',
          ballotOrder: 1,
        },
        {
          candidateId: 'c3',
          ballotOrder: 2,
        },
        {
          candidateId: 'c1',
          ballotOrder: 3,
        },
      ],
    );
  });

  // ======================================================
  // 3. Random Ordering
  // ======================================================

  it('should generate and persist a valid random ballot order', async () => {
    // Force a deterministic Fisher-Yates shuffle.
    jest
      .spyOn(Math, 'random')
      .mockReturnValue(0);

    const result =
      await service.execute(
        'election-1',
        BallotOrderMethod.RANDOM,
      );

    expect(result).toHaveLength(3);

    expect(
      result.map(
        (candidate) => candidate.ballotOrder,
      ),
    ).toEqual([
      1,
      2,
      3,
    ]);

    expect(
      new Set(
        result.map(
          (candidate) => candidate.id,
        ),
      ).size,
    ).toBe(3);

    expect(
      candidateRepository.replaceBallotOrders,
    ).toHaveBeenCalledWith(
      'election-1',
      BallotOrderMethod.RANDOM,
      expect.arrayContaining([
        expect.objectContaining({
          ballotOrder: 1,
        }),
        expect.objectContaining({
          ballotOrder: 2,
        }),
        expect.objectContaining({
          ballotOrder: 3,
        }),
      ]),
    );

    jest.restoreAllMocks();
  });

  // ======================================================
  // 4. Manual Method Must Use Manual Endpoint
  // ======================================================

  it('should reject manual ballot ordering through the automatic endpoint', async () => {
    await expect(
      service.execute(
        'election-1',
        BallotOrderMethod.MANUAL,
      ),
    ).rejects.toThrow(
      'Manual ballot ordering must use the manual ballot ordering endpoint.',
    );

    expect(
      candidateRepository.replaceBallotOrders,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 5. Election Not Found
  // ======================================================

  it('should reject when the election does not exist', async () => {
    candidateRepository.findElectionBallotState
      .mockResolvedValue(null);

    await expect(
      service.execute(
        'election-1',
        BallotOrderMethod.CANDIDATE_NUMBER,
      ),
    ).rejects.toThrow(
      NotFoundException,
    );

    expect(
      candidateRepository.findEligibleForBallot,
    ).not.toHaveBeenCalled();

    expect(
      candidateRepository.replaceBallotOrders,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 6. No Eligible Candidates
  // ======================================================

  it('should reject when no eligible candidates exist', async () => {
    candidateRepository.findEligibleForBallot
      .mockResolvedValue([]);

    await expect(
      service.execute(
        'election-1',
        BallotOrderMethod.CANDIDATE_NUMBER,
      ),
    ).rejects.toThrow(
      'No eligible candidates are available for ballot ordering.',
    );

    expect(
      candidateRepository.replaceBallotOrders,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 7. Ballot Lifecycle Protection
  // ======================================================

  it('should reject ballot generation after finalization', async () => {
    candidateRepository.findElectionBallotState
      .mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: new Date(),
      });

    ballotLifecycleValidator
      .validateModification
      .mockImplementation(() => {
        throw new BadRequestException(
          'The ballot has been finalized and can no longer be modified.',
        );
      });

    await expect(
      service.execute(
        'election-1',
        BallotOrderMethod.CANDIDATE_NUMBER,
      ),
    ).rejects.toThrow(
      'The ballot has been finalized and can no longer be modified.',
    );

    expect(
      candidateRepository.findEligibleForBallot,
    ).not.toHaveBeenCalled();

    expect(
      candidateRepository.replaceBallotOrders,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 8. Lifecycle Validator Must Be Called
  // ======================================================

  it('should validate the ballot lifecycle before generating an order', async () => {
    await service.execute(
      'election-1',
      BallotOrderMethod.CANDIDATE_NUMBER,
    );

    expect(
      ballotLifecycleValidator
        .validateModification,
    ).toHaveBeenCalledWith(
      ElectionStatus.PUBLISHED,
      null,
    );
  });

  // ======================================================
  // 9. Persistence Failure
  // ======================================================

  it('should propagate ballot order persistence errors', async () => {
    candidateRepository
      .replaceBallotOrders
      .mockRejectedValue(
        new Error(
          'Failed to persist ballot order.',
        ),
      );

    await expect(
      service.execute(
        'election-1',
        BallotOrderMethod.CANDIDATE_NUMBER,
      ),
    ).rejects.toThrow(
      'Failed to persist ballot order.',
    );
  });
});