import {
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import {
  CandidateStatus,
  CandidateType,
} from '@prisma/client';

import {
  describe,
  it,
  beforeEach,
  expect,
  jest,
} from '@jest/globals';

import { SubmitNominationService } from './submit-nomination.service';

import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateValidator } from '../validators/candidate.validator';

describe('SubmitNominationService', () => {
  let service: SubmitNominationService;

  const create = jest.fn(
    async (_data: any): Promise<any> => {
      return null;
    },
  );

  const validateElectionExists = jest.fn(
    async (_electionId: string): Promise<any> => {
      return null;
    },
  );

  const validateNominationWindow = jest.fn(
    (_election: any): void => {
      return undefined;
    },
  );

  const validateNoDuplicateNomination = jest.fn(
    async (
      _userId: string,
      _electionId: string,
    ): Promise<void> => {
      return undefined;
    },
  );

  const validateCandidateLimit = jest.fn(
    async (
      _electionId: string,
      _candidateLimit: number,
    ): Promise<void> => {
      return undefined;
    },
  );

  const validateCandidateType = jest.fn(
    async (
      _candidateType: CandidateType,
      _partyId?: string,
    ): Promise<void> => {
      return undefined;
    },
  );

  const candidateRepository = {
    create,
  };

  const candidateValidator = {
    validateElectionExists,
    validateNominationWindow,
    validateNoDuplicateNomination,
    validateCandidateLimit,
    validateCandidateType,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new SubmitNominationService(
      candidateRepository as unknown as CandidateRepository,
      candidateValidator as unknown as CandidateValidator,
    );
  });

  // ======================================================
  // 1. Successful Nomination
  // ======================================================

  it(
    'should create a candidate nomination with PENDING status',
    async () => {
      const dto = {
        electionId:
          '98514676-c846-4254-b69b-e98e0779369b',

        candidateType:
          CandidateType.INDEPENDENT,

        partyId: undefined,

        position:
          'Test Representative',

        nominationStatement:
          'I am submitting this nomination to represent students responsibly.',
      };

      const userId =
        'f6688bb1-a3e4-4d49-8fe6-3c2549288298';

      const election = {
        id: dto.electionId,

        status: 'PUBLISHED',

        nominationStart:
          new Date(
            Date.now() -
              60 * 60 * 1000,
          ),

        nominationEnd:
          new Date(
            Date.now() +
              60 * 60 * 1000,
          ),

        candidateLimit: 20,
      };

      const createdCandidate = {
        id: 'candidate-test-id',

        electionId:
          dto.electionId,

        userId,

        candidateType:
          CandidateType.INDEPENDENT,

        position:
          dto.position,

        nominationStatement:
          dto.nominationStatement,

        status:
          CandidateStatus.PENDING,
      };

      validateElectionExists.mockResolvedValue(
        election,
      );

      validateNominationWindow.mockReturnValue(
        undefined,
      );

      validateNoDuplicateNomination.mockResolvedValue(
        undefined,
      );

      validateCandidateLimit.mockResolvedValue(
        undefined,
      );

      validateCandidateType.mockResolvedValue(
        undefined,
      );

      create.mockResolvedValue(
        createdCandidate,
      );

      const result =
        await service.execute(
          dto,
          userId,
        );

      expect(result).toEqual(
        createdCandidate,
      );

      expect(create).toHaveBeenCalled();

      const createCall =
        create.mock.calls[0][0];

      expect(createCall).toEqual(
        expect.objectContaining({
          electionId:
            dto.electionId,

          userId,

          candidateType:
            dto.candidateType,

          position:
            dto.position,

          nominationStatement:
            dto.nominationStatement,

          status:
            CandidateStatus.PENDING,
        }),
      );

      expect(
        validateElectionExists,
      ).toHaveBeenCalledWith(
        dto.electionId,
      );

      expect(
        validateNominationWindow,
      ).toHaveBeenCalledWith(
        election,
      );

      expect(
        validateNoDuplicateNomination,
      ).toHaveBeenCalledWith(
        userId,
        dto.electionId,
      );

      expect(
        validateCandidateLimit,
      ).toHaveBeenCalledWith(
        dto.electionId,
        election.candidateLimit,
      );

      expect(
        validateCandidateType,
      ).toHaveBeenCalledWith(
        dto.candidateType,
        dto.partyId,
      );
    },
  );

  // ======================================================
  // 2. Duplicate Nomination
  // ======================================================

  it(
    'should reject a duplicate nomination',
    async () => {
      const dto = {
        electionId:
          '98514676-c846-4254-b69b-e98e0779369b',

        candidateType:
          CandidateType.INDEPENDENT,

        partyId: undefined,

        position:
          'Test Representative',

        nominationStatement:
          'I am submitting this nomination to represent students responsibly.',
      };

      const userId =
        'f6688bb1-a3e4-4d49-8fe6-3c2549288298';

      const election = {
        id: dto.electionId,

        status: 'PUBLISHED',

        nominationStart:
          new Date(
            Date.now() -
              60 * 60 * 1000,
          ),

        nominationEnd:
          new Date(
            Date.now() +
              60 * 60 * 1000,
          ),

        candidateLimit: 20,
      };

      validateElectionExists.mockResolvedValue(
        election,
      );

      validateNominationWindow.mockReturnValue(
        undefined,
      );

      validateNoDuplicateNomination.mockRejectedValue(
        new ConflictException(
          'You have already submitted a nomination for this election.',
        ),
      );

      await expect(
        service.execute(
          dto,
          userId,
        ),
      ).rejects.toThrow(
        'You have already submitted a nomination for this election.',
      );

      expect(
        validateNoDuplicateNomination,
      ).toHaveBeenCalledWith(
        userId,
        dto.electionId,
      );

      expect(
        create,
      ).not.toHaveBeenCalled();
    },
  );

  // ======================================================
  // 3. Candidate Limit
  // ======================================================

  it(
    'should reject nomination when the candidate limit is reached',
    async () => {
      const dto = {
        electionId:
          '98514676-c846-4254-b69b-e98e0779369b',

        candidateType:
          CandidateType.INDEPENDENT,

        partyId: undefined,

        position:
          'Test Representative',

        nominationStatement:
          'I am submitting this nomination to represent students responsibly.',
      };

      const userId =
        'f6688bb1-a3e4-4d49-8fe6-3c2549288298';

      const election = {
        id: dto.electionId,

        status: 'PUBLISHED',

        nominationStart:
          new Date(
            Date.now() -
              60 * 60 * 1000,
          ),

        nominationEnd:
          new Date(
            Date.now() +
              60 * 60 * 1000,
          ),

        candidateLimit: 20,
      };

      validateElectionExists.mockResolvedValue(
        election,
      );

      validateNominationWindow.mockReturnValue(
        undefined,
      );

      validateNoDuplicateNomination.mockResolvedValue(
        undefined,
      );

      validateCandidateLimit.mockRejectedValue(
        new BadRequestException(
          'Candidate limit for this election has been reached.',
        ),
      );

      await expect(
        service.execute(
          dto,
          userId,
        ),
      ).rejects.toThrow(
        'Candidate limit for this election has been reached.',
      );

      expect(
        validateCandidateLimit,
      ).toHaveBeenCalledWith(
        dto.electionId,
        election.candidateLimit,
      );

      expect(
        create,
      ).not.toHaveBeenCalled();
    },
  );

  // ======================================================
  // 4. Invalid Candidate Type / Party
  // ======================================================

  it(
    'should reject an invalid candidate type and party combination',
    async () => {
      const dto = {
        electionId:
          '98514676-c846-4254-b69b-e98e0779369b',

        candidateType:
          CandidateType.INDEPENDENT,

        partyId:
          '11111111-1111-1111-1111-111111111111',

        position:
          'Test Representative',

        nominationStatement:
          'I am submitting this nomination to represent students responsibly.',
      };

      const userId =
        'f6688bb1-a3e4-4d49-8fe6-3c2549288298';

      const election = {
        id: dto.electionId,

        status: 'PUBLISHED',

        nominationStart:
          new Date(
            Date.now() -
              60 * 60 * 1000,
          ),

        nominationEnd:
          new Date(
            Date.now() +
              60 * 60 * 1000,
          ),

        candidateLimit: 20,
      };

      validateElectionExists.mockResolvedValue(
        election,
      );

      validateNominationWindow.mockReturnValue(
        undefined,
      );

      validateNoDuplicateNomination.mockResolvedValue(
        undefined,
      );

      validateCandidateLimit.mockResolvedValue(
        undefined,
      );

      validateCandidateType.mockRejectedValue(
        new BadRequestException(
          'Independent candidates cannot be associated with a party.',
        ),
      );

      await expect(
        service.execute(
          dto,
          userId,
        ),
      ).rejects.toThrow(
        'Independent candidates cannot be associated with a party.',
      );

      expect(
        validateCandidateType,
      ).toHaveBeenCalledWith(
        dto.candidateType,
        dto.partyId,
      );

      expect(
        create,
      ).not.toHaveBeenCalled();
    },
  );
});
