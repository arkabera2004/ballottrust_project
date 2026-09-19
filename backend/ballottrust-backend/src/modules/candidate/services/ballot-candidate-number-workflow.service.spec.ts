import {
  BallotOrderMethod,
  CandidateStatus,
  CandidateType,
  ElectionStatus,
} from '@prisma/client';

import { AssignCandidateNumberService } from './assign-candidate-number.service';
import { AutoAssignCandidateNumberService } from './auto-assign-candidate-number.service';
import { GenerateBallotOrderService } from './generate-ballot-order.service';
import { ManualBallotOrderService } from './manual-ballot-order.service';
import { FinalizeBallotService } from './finalize-ballot.service';
import { GetBallotService } from './get-ballot.service';

import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateValidator } from '../validators/candidate.validator';
import { BallotLifecycleValidator } from '../validators/ballot-lifecycle.validator';

describe('Ballot & Candidate Number Workflow - 6.5', () => {
  // ============================================================
  // COMMON CANDIDATE DATA
  // ============================================================

  const candidateOne = {
    id: 'candidate-1',
    electionId: 'election-1',
    status: CandidateStatus.APPROVED,
    candidateNumber: null,
    candidateType: CandidateType.INDEPENDENT,
    position: 'President',
    party: null,
    user: {
      fullName: 'Candidate One',
    },
  };

  const candidateTwo = {
    id: 'candidate-2',
    electionId: 'election-1',
    status: CandidateStatus.APPROVED,
    candidateNumber: null,
    candidateType: CandidateType.INDEPENDENT,
    position: 'President',
    party: null,
    user: {
      fullName: 'Candidate Two',
    },
  };

  // ============================================================
  // 6.5.1 ASSIGN CANDIDATE NUMBER
  // ============================================================

  describe('Assign Candidate Number', () => {
    let candidateRepository: any;
    let candidateValidator: any;
    let ballotLifecycleValidator: any;
    let service: AssignCandidateNumberService;

    beforeEach(() => {
      candidateRepository = {
        findById: jest.fn(),
        findElectionBallotState: jest.fn(),
        update: jest.fn(),
      };

      candidateValidator = {
        validateCandidateNumber: jest.fn(),
      };

      ballotLifecycleValidator = {
        validateModification: jest.fn(),
      };

      service = new AssignCandidateNumberService(
        candidateRepository as CandidateRepository,
        candidateValidator as CandidateValidator,
        ballotLifecycleValidator as BallotLifecycleValidator,
      );
    });

    it('should assign a number to an approved candidate', async () => {
      candidateRepository.findById.mockResolvedValue(candidateOne);

      candidateRepository.findElectionBallotState.mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
      });

      candidateRepository.update.mockResolvedValue({
        ...candidateOne,
        candidateNumber: 1,
      });

      const result = await service.execute('candidate-1', 1);

      expect(result.candidateNumber).toBe(1);

      expect(candidateValidator.validateCandidateNumber).toHaveBeenCalledWith(
        'election-1',
        1,
      );

      expect(candidateRepository.update).toHaveBeenCalledWith('candidate-1', {
        candidateNumber: 1,
      });
    });

    it('should reject when candidate does not exist', async () => {
      candidateRepository.findById.mockResolvedValue(null);

      await expect(service.execute('candidate-404', 1)).rejects.toThrow(
        'Candidate not found.',
      );

      expect(candidateRepository.update).not.toHaveBeenCalled();
    });

    it('should reject a candidate that is not approved', async () => {
      candidateRepository.findById.mockResolvedValue({
        ...candidateOne,
        status: CandidateStatus.PENDING,
      });

      await expect(service.execute('candidate-1', 1)).rejects.toThrow(
        'Candidate number can only be assigned to an approved candidate.',
      );

      expect(
        candidateRepository.findElectionBallotState,
      ).not.toHaveBeenCalled();

      expect(candidateRepository.update).not.toHaveBeenCalled();
    });

    it('should reject reassignment when a candidate already has a number', async () => {
      candidateRepository.findById.mockResolvedValue({
        ...candidateOne,
        candidateNumber: 5,
      });

      candidateRepository.findElectionBallotState.mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
      });

      await expect(service.execute('candidate-1', 7)).rejects.toThrow(
        'Candidate number has already been assigned.',
      );

      expect(candidateValidator.validateCandidateNumber).not.toHaveBeenCalled();

      expect(candidateRepository.update).not.toHaveBeenCalled();
    });

    it('should reject when the election does not exist', async () => {
      candidateRepository.findById.mockResolvedValue(candidateOne);

      candidateRepository.findElectionBallotState.mockResolvedValue(null);

      await expect(service.execute('candidate-1', 1)).rejects.toThrow(
        'Election not found.',
      );

      expect(candidateRepository.update).not.toHaveBeenCalled();
    });

    it('should validate ballot lifecycle before assigning the number', async () => {
      candidateRepository.findById.mockResolvedValue(candidateOne);

      candidateRepository.findElectionBallotState.mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
      });

      candidateRepository.update.mockResolvedValue({
        ...candidateOne,
        candidateNumber: 3,
      });

      await service.execute('candidate-1', 3);

      expect(
        ballotLifecycleValidator.validateModification,
      ).toHaveBeenCalledWith(ElectionStatus.PUBLISHED, null);
    });
  });

  // ============================================================
  // 6.5.2 AUTO ASSIGN CANDIDATE NUMBER
  // ============================================================

  describe('Auto Assign Candidate Number', () => {
    let candidateRepository: any;
    let ballotLifecycleValidator: any;
    let service: AutoAssignCandidateNumberService;

    beforeEach(() => {
      candidateRepository = {
        findById: jest.fn(),
        findElectionBallotState: jest.fn(),
        getHighestCandidateNumber: jest.fn(),
        update: jest.fn(),
      };

      ballotLifecycleValidator = {
        validateModification: jest.fn(),
      };

      service = new AutoAssignCandidateNumberService(
        candidateRepository as CandidateRepository,
        ballotLifecycleValidator as BallotLifecycleValidator,
      );
    });

    it('should assign the next available number', async () => {
      candidateRepository.findById.mockResolvedValue(candidateOne);

      candidateRepository.findElectionBallotState.mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
      });

      ballotLifecycleValidator.validateModification.mockReturnValue(undefined);

      candidateRepository.getHighestCandidateNumber.mockResolvedValue(5);

      candidateRepository.update.mockResolvedValue({
        ...candidateOne,
        candidateNumber: 6,
      });

      const result = await service.execute('candidate-1');

      expect(result.candidateNumber).toBe(6);

      expect(candidateRepository.findElectionBallotState).toHaveBeenCalledWith(
        'election-1',
      );

      expect(
        ballotLifecycleValidator.validateModification,
      ).toHaveBeenCalledWith(ElectionStatus.PUBLISHED, null);

      expect(
        candidateRepository.getHighestCandidateNumber,
      ).toHaveBeenCalledWith('election-1');

      expect(candidateRepository.update).toHaveBeenCalledWith('candidate-1', {
        candidateNumber: 6,
      });
    });

    it('should start at 1 when no candidate number exists', async () => {
      candidateRepository.findById.mockResolvedValue(candidateOne);

      candidateRepository.findElectionBallotState.mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
      });

      ballotLifecycleValidator.validateModification.mockReturnValue(undefined);

      candidateRepository.getHighestCandidateNumber.mockResolvedValue(0);

      candidateRepository.update.mockResolvedValue({
        ...candidateOne,
        candidateNumber: 1,
      });

      const result = await service.execute('candidate-1');

      expect(result.candidateNumber).toBe(1);
    });

    it('should reject auto assignment for a non-approved candidate', async () => {
      candidateRepository.findById.mockResolvedValue({
        ...candidateOne,
        status: CandidateStatus.PENDING,
      });

      await expect(service.execute('candidate-1')).rejects.toThrow(
        'Candidate number can only be assigned to an approved candidate.',
      );

      expect(
        candidateRepository.findElectionBallotState,
      ).not.toHaveBeenCalled();

      expect(
        candidateRepository.getHighestCandidateNumber,
      ).not.toHaveBeenCalled();

      expect(candidateRepository.update).not.toHaveBeenCalled();
    });

    it('should reject auto assignment when number already exists', async () => {
      candidateRepository.findById.mockResolvedValue({
        ...candidateOne,
        candidateNumber: 4,
      });

      await expect(service.execute('candidate-1')).rejects.toThrow(
        'Candidate number has already been assigned.',
      );

      expect(
        candidateRepository.findElectionBallotState,
      ).not.toHaveBeenCalled();

      expect(
        candidateRepository.getHighestCandidateNumber,
      ).not.toHaveBeenCalled();

      expect(candidateRepository.update).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // 6.5.3 BALLOT GENERATION
  // ============================================================

  describe('Generate Ballot Order', () => {
    let candidateRepository: any;
    let ballotLifecycleValidator: any;
    let service: GenerateBallotOrderService;

    beforeEach(() => {
      candidateRepository = {
        findElectionBallotState: jest.fn(),
        findEligibleForBallot: jest.fn(),
        replaceBallotOrders: jest.fn(),
      };

      ballotLifecycleValidator = {
        validateModification: jest.fn(),
      };

      service = new GenerateBallotOrderService(
        candidateRepository as CandidateRepository,
        ballotLifecycleValidator as BallotLifecycleValidator,
      );
    });

    it('should generate candidate-number ordering', async () => {
      candidateRepository.findElectionBallotState.mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
      });

      candidateRepository.findEligibleForBallot.mockResolvedValue([
        {
          ...candidateTwo,
          candidateNumber: 2,
        },
        {
          ...candidateOne,
          candidateNumber: 1,
        },
      ]);

      candidateRepository.replaceBallotOrders.mockResolvedValue(undefined);

      const result = await service.execute(
        'election-1',
        BallotOrderMethod.CANDIDATE_NUMBER,
      );

      expect(result[0].id).toBe('candidate-1');

      expect(result[1].id).toBe('candidate-2');

      expect(candidateRepository.replaceBallotOrders).toHaveBeenCalledWith(
        'election-1',
        BallotOrderMethod.CANDIDATE_NUMBER,
        [
          {
            candidateId: 'candidate-1',
            ballotOrder: 1,
          },
          {
            candidateId: 'candidate-2',
            ballotOrder: 2,
          },
        ],
      );
    });

    it('should generate alphabetical ordering', async () => {
      candidateRepository.findElectionBallotState.mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
      });

      candidateRepository.findEligibleForBallot.mockResolvedValue([
        candidateTwo,
        candidateOne,
      ]);

      candidateRepository.replaceBallotOrders.mockResolvedValue(undefined);

      const result = await service.execute(
        'election-1',
        BallotOrderMethod.ALPHABETICAL,
      );

      expect(result[0].fullName).toBe('Candidate One');

      expect(result[1].fullName).toBe('Candidate Two');
    });

    it('should reject manual ordering through automatic generation', async () => {
      candidateRepository.findElectionBallotState.mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
      });

      candidateRepository.findEligibleForBallot.mockResolvedValue([
        candidateOne,
      ]);

      await expect(
        service.execute('election-1', BallotOrderMethod.MANUAL),
      ).rejects.toThrow(
        'Manual ballot ordering must use the manual ballot ordering endpoint.',
      );

      expect(candidateRepository.replaceBallotOrders).not.toHaveBeenCalled();
    });

    it('should reject ballot generation when there are no eligible candidates', async () => {
      candidateRepository.findElectionBallotState.mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
      });

      candidateRepository.findEligibleForBallot.mockResolvedValue([]);

      await expect(
        service.execute('election-1', BallotOrderMethod.CANDIDATE_NUMBER),
      ).rejects.toThrow(
        'No eligible candidates are available for ballot ordering.',
      );

      expect(candidateRepository.replaceBallotOrders).not.toHaveBeenCalled();
    });

    it('should reject generation when election does not exist', async () => {
      candidateRepository.findElectionBallotState.mockResolvedValue(null);

      await expect(
        service.execute('election-404', BallotOrderMethod.CANDIDATE_NUMBER),
      ).rejects.toThrow('Election not found.');

      expect(candidateRepository.findEligibleForBallot).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // 6.5.4 MANUAL BALLOT ORDER
  // ============================================================

  describe('Manual Ballot Order', () => {
    let candidateRepository: any;
    let ballotLifecycleValidator: any;
    let service: ManualBallotOrderService;

    beforeEach(() => {
      candidateRepository = {
        findElectionBallotState: jest.fn(),
        findEligibleForBallot: jest.fn(),
        replaceBallotOrders: jest.fn(),
      };

      ballotLifecycleValidator = {
        validateModification: jest.fn(),
      };

      service = new ManualBallotOrderService(
        candidateRepository as CandidateRepository,
        ballotLifecycleValidator as BallotLifecycleValidator,
      );
    });

    beforeEach(() => {
      candidateRepository.findElectionBallotState.mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
      });

      candidateRepository.findEligibleForBallot.mockResolvedValue([
        candidateOne,
        candidateTwo,
      ]);

      candidateRepository.replaceBallotOrders.mockResolvedValue(undefined);
    });

    it('should persist a complete manual ballot order', async () => {
      const result = await service.execute('election-1', [
        'candidate-2',
        'candidate-1',
      ]);

      expect(result[0].id).toBe('candidate-2');

      expect(result[0].ballotOrder).toBe(1);

      expect(result[1].id).toBe('candidate-1');

      expect(candidateRepository.replaceBallotOrders).toHaveBeenCalledWith(
        'election-1',
        BallotOrderMethod.MANUAL,
        [
          {
            candidateId: 'candidate-2',
            ballotOrder: 1,
          },
          {
            candidateId: 'candidate-1',
            ballotOrder: 2,
          },
        ],
      );
    });

    it('should reject an incomplete manual ballot', async () => {
      await expect(
        service.execute('election-1', ['candidate-1']),
      ).rejects.toThrow(
        'Manual ballot order must include every eligible candidate exactly once.',
      );

      expect(candidateRepository.replaceBallotOrders).not.toHaveBeenCalled();
    });

    it('should reject a candidate that is not eligible', async () => {
      await expect(
        service.execute('election-1', ['candidate-1', 'candidate-999']),
      ).rejects.toThrow(
        'Manual ballot order contains a candidate who is not eligible for this election.',
      );

      expect(candidateRepository.replaceBallotOrders).not.toHaveBeenCalled();
    });

    it('should reject manual ordering when there are no eligible candidates', async () => {
      candidateRepository.findEligibleForBallot.mockResolvedValue([]);

      await expect(service.execute('election-1', [])).rejects.toThrow(
        'No eligible candidates are available for ballot ordering.',
      );
    });
  });

  // ============================================================
  // 6.5.5 FINALIZE BALLOT
  // ============================================================

  describe('Finalize Ballot', () => {
    let candidateRepository: any;
    let service: FinalizeBallotService;

    beforeEach(() => {
      candidateRepository = {
        findElectionBallotState: jest.fn(),
        getBallotReadiness: jest.fn(),
        finalizeBallot: jest.fn(),
      };

      service = new FinalizeBallotService(
        candidateRepository as CandidateRepository,
      );
    });

    it('should finalize a ready published ballot', async () => {
      candidateRepository.findElectionBallotState.mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
        ballotOrderMethod: BallotOrderMethod.CANDIDATE_NUMBER,
      });

      candidateRepository.getBallotReadiness.mockResolvedValue({
        totalApprovedCandidates: 2,
        readyCandidates: 2,
      });

      candidateRepository.finalizeBallot.mockResolvedValue({
        id: 'election-1',
        ballotFinalizedAt: new Date(),
      });

      const result = await service.execute('election-1', 'admin-1');

      expect(result.message).toBe('Ballot finalized successfully.');

      expect(candidateRepository.finalizeBallot).toHaveBeenCalledWith(
        'election-1',
        'admin-1',
      );
    });

    it('should reject finalization when election does not exist', async () => {
      candidateRepository.findElectionBallotState.mockResolvedValue(null);

      await expect(service.execute('election-404', 'admin-1')).rejects.toThrow(
        'Election not found.',
      );

      expect(candidateRepository.getBallotReadiness).not.toHaveBeenCalled();
    });

    it('should reject finalization of an unpublished election', async () => {
      candidateRepository.findElectionBallotState.mockResolvedValue({
        status: ElectionStatus.DRAFT,
        ballotFinalizedAt: null,
        ballotOrderMethod: BallotOrderMethod.CANDIDATE_NUMBER,
      });

      await expect(service.execute('election-1', 'admin-1')).rejects.toThrow(
        'Only published elections can have their ballot finalized.',
      );
    });

    it('should reject a ballot that is already finalized', async () => {
      candidateRepository.findElectionBallotState.mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: new Date(),
        ballotOrderMethod: BallotOrderMethod.CANDIDATE_NUMBER,
      });

      await expect(service.execute('election-1', 'admin-1')).rejects.toThrow(
        'The ballot has already been finalized.',
      );
    });

    it('should reject finalization when ballot order was not generated', async () => {
      candidateRepository.findElectionBallotState.mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
        ballotOrderMethod: null,
      });

      await expect(service.execute('election-1', 'admin-1')).rejects.toThrow(
        'The ballot must be generated before it can be finalized.',
      );
    });

    it('should reject a ballot with no approved candidates', async () => {
      candidateRepository.findElectionBallotState.mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
        ballotOrderMethod: BallotOrderMethod.CANDIDATE_NUMBER,
      });

      candidateRepository.getBallotReadiness.mockResolvedValue({
        totalApprovedCandidates: 0,
        readyCandidates: 0,
      });

      await expect(service.execute('election-1', 'admin-1')).rejects.toThrow(
        'The ballot cannot be finalized without approved candidates.',
      );
    });

    it('should reject an incomplete ballot', async () => {
      candidateRepository.findElectionBallotState.mockResolvedValue({
        status: ElectionStatus.PUBLISHED,
        ballotFinalizedAt: null,
        ballotOrderMethod: BallotOrderMethod.CANDIDATE_NUMBER,
      });

      candidateRepository.getBallotReadiness.mockResolvedValue({
        totalApprovedCandidates: 3,
        readyCandidates: 2,
      });

      await expect(service.execute('election-1', 'admin-1')).rejects.toThrow(
        'The ballot cannot be finalized because it is incomplete.',
      );
    });
  });

  // ============================================================
  // 6.5.6 GET FINALIZED BALLOT
  // ============================================================

  describe('Get Ballot', () => {
    let candidateRepository: any;
    let service: GetBallotService;

    beforeEach(() => {
      candidateRepository = {
        findElectionBallotState: jest.fn(),
        findOrderedBallot: jest.fn(),
      };

      service = new GetBallotService(
        candidateRepository as CandidateRepository,
      );
    });

    it('should return a finalized public ballot', async () => {
      const finalizedAt = new Date();

      candidateRepository.findElectionBallotState.mockResolvedValue({
        id: 'election-1',
        status: ElectionStatus.ACTIVE,
        ballotOrderMethod: BallotOrderMethod.CANDIDATE_NUMBER,
        ballotFinalizedAt: finalizedAt,
      });

      candidateRepository.findOrderedBallot.mockResolvedValue([
        {
          id: 'candidate-1',
          candidateNumber: 1,
          ballotOrder: 1,
          position: 'President',
        },
      ]);

      const result = await service.execute('election-1');

      expect(result.electionId).toBe('election-1');

      expect(result.status).toBe(ElectionStatus.ACTIVE);

      expect(result.totalCandidates).toBe(1);

      expect(result.candidates).toHaveLength(1);
    });

    it('should reject when election does not exist', async () => {
      candidateRepository.findElectionBallotState.mockResolvedValue(null);

      await expect(service.execute('election-404')).rejects.toThrow(
        'Election not found.',
      );
    });

    it('should reject when ballot has not been finalized', async () => {
      candidateRepository.findElectionBallotState.mockResolvedValue({
        id: 'election-1',
        status: ElectionStatus.PUBLISHED,
        ballotOrderMethod: BallotOrderMethod.CANDIDATE_NUMBER,
        ballotFinalizedAt: null,
      });

      await expect(service.execute('election-1')).rejects.toThrow(
        'The ballot has not been finalized for this election.',
      );

      expect(candidateRepository.findOrderedBallot).not.toHaveBeenCalled();
    });

    it('should reject a ballot from a non-public election state', async () => {
      candidateRepository.findElectionBallotState.mockResolvedValue({
        id: 'election-1',
        status: ElectionStatus.DRAFT,
        ballotOrderMethod: BallotOrderMethod.CANDIDATE_NUMBER,
        ballotFinalizedAt: new Date(),
      });

      await expect(service.execute('election-1')).rejects.toThrow(
        'The ballot is not publicly available while the election is in DRAFT status.',
      );

      expect(candidateRepository.findOrderedBallot).not.toHaveBeenCalled();
    });

    it('should reject when the finalized ballot contains no candidates', async () => {
      candidateRepository.findElectionBallotState.mockResolvedValue({
        id: 'election-1',
        status: ElectionStatus.RESULT_PUBLISHED,
        ballotOrderMethod: BallotOrderMethod.CANDIDATE_NUMBER,
        ballotFinalizedAt: new Date(),
      });

      candidateRepository.findOrderedBallot.mockResolvedValue([]);

      await expect(service.execute('election-1')).rejects.toThrow(
        'No candidates are available on the finalized ballot.',
      );
    });
  });
});
