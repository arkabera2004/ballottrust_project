import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import {
  BallotOrderMethod,
  CandidateType,
  ElectionStatus,
} from '@prisma/client';

import { ManualBallotOrderService } from './manual-ballot-order.service';

import { CandidateRepository } from '../repository/candidate.repository';

import { BallotLifecycleValidator } from '../validators/ballot-lifecycle.validator';

describe('ManualBallotOrderService', () => {
  let service: ManualBallotOrderService;

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
      candidateNumber: 1,
      candidateType: CandidateType.INDEPENDENT,
      position: 'President',
      party: null,
      user: {
        fullName: 'Candidate One',
      },
    },
    {
      id: 'c2',
      candidateNumber: 2,
      candidateType: CandidateType.INDEPENDENT,
      position: 'President',
      party: null,
      user: {
        fullName: 'Candidate Two',
      },
    },
    {
      id: 'c3',
      candidateNumber: 3,
      candidateType: CandidateType.INDEPENDENT,
      position: 'President',
      party: null,
      user: {
        fullName: 'Candidate Three',
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
      new ManualBallotOrderService(
        candidateRepository as unknown as CandidateRepository,
        ballotLifecycleValidator as unknown as BallotLifecycleValidator,
      );
  });

  // ======================================================
  // 1. Successful Manual Ordering
  // ======================================================

  it('should persist the submitted ballot order', async () => {
    const result =
      await service.execute(
        'election-1',
        ['c3', 'c1', 'c2'],
      );

    expect(result[0].id).toBe('c3');
    expect(result[0].ballotOrder).toBe(1);

    expect(result[1].id).toBe('c1');
    expect(result[1].ballotOrder).toBe(2);

    expect(result[2].id).toBe('c2');
    expect(result[2].ballotOrder).toBe(3);

    expect(
      candidateRepository.replaceBallotOrders,
    ).toHaveBeenCalledWith(
      'election-1',
      BallotOrderMethod.MANUAL,
      [
        {
          candidateId: 'c3',
          ballotOrder: 1,
        },
        {
          candidateId: 'c1',
          ballotOrder: 2,
        },
        {
          candidateId: 'c2',
          ballotOrder: 3,
        },
      ],
    );
  });

  // ======================================================
  // 2. Election Not Found
  // ======================================================

  it('should reject when the election does not exist', async () => {
    candidateRepository.findElectionBallotState
      .mockResolvedValue(null);

    await expect(
      service.execute(
        'election-1',
        ['c1', 'c2', 'c3'],
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
  // 3. Ballot Lifecycle Protection
  // ======================================================

  it('should reject manual ordering after ballot finalization', async () => {
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
        ['c1', 'c2', 'c3'],
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
  // 4. No Eligible Candidates
  // ======================================================

  it('should reject when no eligible candidates exist', async () => {
    candidateRepository.findEligibleForBallot
      .mockResolvedValue([]);

    await expect(
      service.execute(
        'election-1',
        [],
      ),
    ).rejects.toThrow(
      'No eligible candidates are available for ballot ordering.',
    );

    expect(
      candidateRepository.replaceBallotOrders,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 5. Incomplete Candidate List
  // ======================================================

  it('should reject when the submitted order does not contain every eligible candidate', async () => {
    await expect(
      service.execute(
        'election-1',
        ['c1', 'c2'],
      ),
    ).rejects.toThrow(
      'Manual ballot order must include every eligible candidate exactly once.',
    );

    expect(
      candidateRepository.replaceBallotOrders,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 6. Ineligible Candidate
  // ======================================================

  it('should reject a candidate who is not eligible for the election', async () => {
    await expect(
      service.execute(
        'election-1',
        ['c1', 'c2', 'unknown-candidate'],
      ),
    ).rejects.toThrow(
      'Manual ballot order contains a candidate who is not eligible for this election.',
    );

    expect(
      candidateRepository.replaceBallotOrders,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 7. Duplicate Candidate
  // ======================================================

  it('should reject duplicate candidate IDs', async () => {
    await expect(
      service.execute(
        'election-1',
        ['c1', 'c2', 'c2'],
      ),
    ).rejects.toThrow(
      'Manual ballot order cannot contain duplicate candidates.',
    );

    expect(
      candidateRepository.replaceBallotOrders,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 8. Persistence Failure
  // ======================================================

  it('should propagate an error when ballot order persistence fails', async () => {
    const databaseError =
      new Error(
        'Failed to persist ballot order.',
      );

    candidateRepository
      .replaceBallotOrders
      .mockRejectedValue(
        databaseError,
      );

    await expect(
      service.execute(
        'election-1',
        ['c1', 'c2', 'c3'],
      ),
    ).rejects.toThrow(
      'Failed to persist ballot order.',
    );
  });

  // ======================================================
  // 9. Lifecycle Validator Must Be Called
  // ======================================================

  it('should validate the ballot lifecycle before modifying the order', async () => {
    await service.execute(
      'election-1',
      ['c1', 'c2', 'c3'],
    );

    expect(
      ballotLifecycleValidator
        .validateModification,
    ).toHaveBeenCalledWith(
      ElectionStatus.PUBLISHED,
      null,
    );
  });
});