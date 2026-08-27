import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

import { CandidateStatus, ElectionStatus, Prisma } from '@prisma/client';

import { AutoAssignCandidateNumberService } from './auto-assign-candidate-number.service';

import { CandidateRepository } from '../repository/candidate.repository';

import { BallotLifecycleValidator } from '../validators/ballot-lifecycle.validator';

describe('AutoAssignCandidateNumberService', () => {
  let service: AutoAssignCandidateNumberService;

  const candidateRepository = {
    findById: jest.fn(),
    findElectionBallotState: jest.fn(),
    getHighestCandidateNumber: jest.fn(),
    update: jest.fn(),
  };

  const ballotLifecycleValidator = {
    validateModification: jest.fn(),
  };

  beforeEach(() => {
  jest.resetAllMocks();

  service =
    new AutoAssignCandidateNumberService(
      candidateRepository as unknown as CandidateRepository,
      ballotLifecycleValidator as unknown as BallotLifecycleValidator,
    );
});

  // ======================================================
  // 1. Successful Automatic Assignment
  // ======================================================

  it('should automatically assign the next candidate number', async () => {
    const candidate = {
      id: 'candidate-1',
      electionId: 'election-1',
      status: CandidateStatus.APPROVED,
      candidateNumber: null,
    };

    const updatedCandidate = {
      id: 'candidate-1',
      candidateNumber: 5,
    };

    candidateRepository.findById.mockResolvedValue(
      candidate,
    );

    candidateRepository.findElectionBallotState
      .mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
      });

    candidateRepository.getHighestCandidateNumber
      .mockResolvedValue(4);

    candidateRepository.update
      .mockResolvedValue(updatedCandidate);

    const result =
      await service.execute(
        'candidate-1',
      );

    expect(result).toEqual(
      updatedCandidate,
    );

    expect(
      candidateRepository.findById,
    ).toHaveBeenCalledWith(
      'candidate-1',
    );

    expect(
      candidateRepository.findElectionBallotState,
    ).toHaveBeenCalledWith(
      'election-1',
    );

    expect(
      ballotLifecycleValidator
        .validateModification,
    ).toHaveBeenCalledWith(
      ElectionStatus.PUBLISHED,
      null,
    );

    expect(
      candidateRepository
        .getHighestCandidateNumber,
    ).toHaveBeenCalledWith(
      'election-1',
    );

    expect(
      candidateRepository.update,
    ).toHaveBeenCalledWith(
      'candidate-1',
      {
        candidateNumber: 5,
      },
    );
  });

  // ======================================================
  // 2. Candidate Not Found
  // ======================================================

  it('should reject when the candidate does not exist', async () => {
    candidateRepository.findById
      .mockResolvedValue(null);

    await expect(
      service.execute(
        'candidate-1',
      ),
    ).rejects.toThrow(
      NotFoundException,
    );

    expect(
      candidateRepository
        .findElectionBallotState,
    ).not.toHaveBeenCalled();

    expect(
      candidateRepository
        .getHighestCandidateNumber,
    ).not.toHaveBeenCalled();

    expect(
      candidateRepository.update,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 3. Candidate Must Be Approved
  // ======================================================

  it('should reject an unapproved candidate', async () => {
    candidateRepository.findById
      .mockResolvedValue({
        id: 'candidate-1',
        electionId: 'election-1',
        status: CandidateStatus.PENDING,
        candidateNumber: null,
      });

    await expect(
      service.execute(
        'candidate-1',
      ),
    ).rejects.toThrow(
      'Candidate number can only be assigned to an approved candidate.',
    );

    expect(
      candidateRepository
        .findElectionBallotState,
    ).not.toHaveBeenCalled();

    expect(
      candidateRepository
        .getHighestCandidateNumber,
    ).not.toHaveBeenCalled();

    expect(
      candidateRepository.update,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 4. Prevent Reassignment
  // ======================================================

  it('should reject a candidate who already has a number', async () => {
    candidateRepository.findById
      .mockResolvedValue({
        id: 'candidate-1',
        electionId: 'election-1',
        status: CandidateStatus.APPROVED,
        candidateNumber: 3,
      });

    await expect(
      service.execute(
        'candidate-1',
      ),
    ).rejects.toThrow(
      'Candidate number has already been assigned.',
    );

    expect(
      candidateRepository
        .findElectionBallotState,
    ).not.toHaveBeenCalled();

    expect(
      candidateRepository
        .getHighestCandidateNumber,
    ).not.toHaveBeenCalled();

    expect(
      candidateRepository.update,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 5. Election Not Found
  // ======================================================

  it('should reject when the election does not exist', async () => {
    candidateRepository.findById
      .mockResolvedValue({
        id: 'candidate-1',
        electionId: 'election-1',
        status: CandidateStatus.APPROVED,
        candidateNumber: null,
      });

    candidateRepository.findElectionBallotState
      .mockResolvedValue(null);

    await expect(
      service.execute(
        'candidate-1',
      ),
    ).rejects.toThrow(
      'Election not found.',
    );

    expect(
      ballotLifecycleValidator
        .validateModification,
    ).not.toHaveBeenCalled();

    expect(
      candidateRepository
        .getHighestCandidateNumber,
    ).not.toHaveBeenCalled();

    expect(
      candidateRepository.update,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 6. Ballot Lifecycle Protection
  // ======================================================

  it('should reject automatic assignment after ballot finalization', async () => {
    candidateRepository.findById
      .mockResolvedValue({
        id: 'candidate-1',
        electionId: 'election-1',
        status: CandidateStatus.APPROVED,
        candidateNumber: null,
      });

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
        'candidate-1',
      ),
    ).rejects.toThrow(
      'The ballot has been finalized and can no longer be modified.',
    );

    expect(
      candidateRepository
        .getHighestCandidateNumber,
    ).not.toHaveBeenCalled();

    expect(
      candidateRepository.update,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 7. Locked Election Status
  // ======================================================

  it('should reject automatic assignment when the election is ACTIVE', async () => {
    candidateRepository.findById
      .mockResolvedValue({
        id: 'candidate-1',
        electionId: 'election-1',
        status: CandidateStatus.APPROVED,
        candidateNumber: null,
      });

    candidateRepository.findElectionBallotState
      .mockResolvedValue({
        status: ElectionStatus.ACTIVE,
        ballotFinalizedAt: null,
      });

    ballotLifecycleValidator
      .validateModification
      .mockImplementation(() => {
        throw new BadRequestException(
          'Ballot ordering cannot be modified while the election is in ACTIVE status.',
        );
      });

    await expect(
      service.execute(
        'candidate-1',
      ),
    ).rejects.toThrow(
      'Ballot ordering cannot be modified while the election is in ACTIVE status.',
    );

    expect(
      candidateRepository
        .getHighestCandidateNumber,
    ).not.toHaveBeenCalled();

    expect(
      candidateRepository.update,
    ).not.toHaveBeenCalled();
  });

  // ======================================================
  // 8. Database Conflict
  // ======================================================

  it('should convert a candidate number unique constraint conflict into ConflictException', async () => {
    const candidate = {
      id: 'candidate-1',
      electionId: 'election-1',
      status: CandidateStatus.APPROVED,
      candidateNumber: null,
    };

    candidateRepository.findById
      .mockResolvedValue(candidate);

    candidateRepository.findElectionBallotState
      .mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
      });

    candidateRepository.getHighestCandidateNumber
      .mockResolvedValue(4);

    const prismaError =
      new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: 'test',
        },
      );

    candidateRepository.update
      .mockRejectedValue(prismaError);

    await expect(
      service.execute(
        'candidate-1',
      ),
    ).rejects.toThrow(
      ConflictException,
    );

    expect(
      candidateRepository.update,
    ).toHaveBeenCalledWith(
      'candidate-1',
      {
        candidateNumber: 5,
      },
    );
  });
});