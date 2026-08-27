import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  CandidateStatus,
  CandidateType,
} from '@prisma/client';

import { UpdateCandidateService } from './update-candidate.service';

import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateValidator } from '../validators/candidate.validator';
import { CandidateStatusValidator } from '../validators/candidate-status.validator';

describe('UpdateCandidateService', () => {
  let service: UpdateCandidateService;

  let candidateRepository: {
    findById: jest.Mock;
    update: jest.Mock;
  };

  let candidateValidator: {
    validateElectionExists: jest.Mock;
    validateNominationWindow: jest.Mock;
    validateCandidateType: jest.Mock;
  };

  let candidateStatusValidator: {
    validateEditable: jest.Mock;
  };

  const candidate = {
    id: 'candidate-1',
    userId: 'user-1',
    electionId: 'election-1',

    candidateType: CandidateType.INDEPENDENT,
    partyId: null,

    status: CandidateStatus.PENDING,

    position: 'President',
    manifesto: 'Old manifesto',
    agenda: 'Old agenda',
    achievements: 'Old achievements',
    nominationStatement: 'Old nomination statement',

    photoUrl: 'https://example.com/old-photo.jpg',
    documentUrl: 'https://example.com/old-document.pdf',
  };

  const election = {
    id: 'election-1',

    status: 'PUBLISHED',

    nominationStart: new Date('2026-08-01T00:00:00.000Z'),
    nominationEnd: new Date('2026-08-31T23:59:59.999Z'),

    startDate: new Date('2026-09-01T00:00:00.000Z'),
    endDate: new Date('2026-09-02T00:00:00.000Z'),
  };

  const updatedCandidate = {
    ...candidate,

    position: 'Updated President',
    manifesto: 'Updated manifesto',
    agenda: 'Updated agenda',
    achievements: 'Updated achievements',
    nominationStatement: 'Updated nomination statement',

    photoUrl: 'https://example.com/new-photo.jpg',
    documentUrl: 'https://example.com/new-document.pdf',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    candidateRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    candidateValidator = {
      validateElectionExists: jest.fn(),
      validateNominationWindow: jest.fn(),
      validateCandidateType: jest.fn(),
    };

    candidateStatusValidator = {
      validateEditable: jest.fn(),
    };

    service = new UpdateCandidateService(
      candidateRepository as unknown as CandidateRepository,
      candidateValidator as unknown as CandidateValidator,
      candidateStatusValidator as unknown as CandidateStatusValidator,
    );
  });

  // ============================================================
  // SUCCESS
  // ============================================================

  it('should update an owned candidate', async () => {
    candidateRepository.findById.mockResolvedValue(candidate);

    candidateStatusValidator.validateEditable.mockReturnValue(
      undefined,
    );

    candidateValidator.validateElectionExists.mockResolvedValue(
      election,
    );

    candidateValidator.validateNominationWindow.mockReturnValue(
      undefined,
    );

    candidateValidator.validateCandidateType.mockResolvedValue(
      undefined,
    );

    candidateRepository.update.mockResolvedValue(
      updatedCandidate,
    );

    const dto = {
      position: 'Updated President',
      manifesto: 'Updated manifesto',
      agenda: 'Updated agenda',
      achievements: 'Updated achievements',
      nominationStatement: 'Updated nomination statement',
      photoUrl: 'https://example.com/new-photo.jpg',
      documentUrl: 'https://example.com/new-document.pdf',
    };

    const result = await service.execute(
      'candidate-1',
      'user-1',
      dto,
    );

    expect(result).toEqual(updatedCandidate);

    expect(
      candidateRepository.findById,
    ).toHaveBeenCalledWith('candidate-1');

    expect(
      candidateStatusValidator.validateEditable,
    ).toHaveBeenCalledWith(
      CandidateStatus.PENDING,
    );

    expect(
      candidateValidator.validateElectionExists,
    ).toHaveBeenCalledWith('election-1');

    expect(
      candidateValidator.validateNominationWindow,
    ).toHaveBeenCalledWith(election);

    expect(
      candidateValidator.validateCandidateType,
    ).toHaveBeenCalledWith(
      CandidateType.INDEPENDENT,
      undefined,
    );

    expect(
      candidateRepository.update,
    ).toHaveBeenCalled();
  });

  it('should update a candidate with a party', async () => {
    const partyCandidate = {
      ...candidate,
      candidateType: CandidateType.PARTY,
      partyId: 'party-1',
    };

    const updatedPartyCandidate = {
      ...partyCandidate,
      position: 'Prime Minister',
    };

    candidateRepository.findById.mockResolvedValue(
      partyCandidate,
    );

    candidateStatusValidator.validateEditable.mockReturnValue(
      undefined,
    );

    candidateValidator.validateElectionExists.mockResolvedValue(
      election,
    );

    candidateValidator.validateNominationWindow.mockReturnValue(
      undefined,
    );

    candidateValidator.validateCandidateType.mockResolvedValue(
      undefined,
    );

    candidateRepository.update.mockResolvedValue(
      updatedPartyCandidate,
    );

    const dto = {
      position: 'Prime Minister',
      partyId: 'party-1',
    };

    const result = await service.execute(
      'candidate-1',
      'user-1',
      dto,
    );

    expect(result).toEqual(updatedPartyCandidate);

    expect(
      candidateValidator.validateCandidateType,
    ).toHaveBeenCalledWith(
      CandidateType.PARTY,
      'party-1',
    );
  });

  // ============================================================
  // NOT FOUND
  // ============================================================

  it('should reject when candidate does not exist', async () => {
    candidateRepository.findById.mockResolvedValue(
      null,
    );

    await expect(
      service.execute(
        'candidate-1',
        'user-1',
        {},
      ),
    ).rejects.toThrow(
      'Candidate not found.',
    );

    expect(
      candidateRepository.findById,
    ).toHaveBeenCalledWith('candidate-1');
  });

  // ============================================================
  // OWNERSHIP
  // ============================================================

  it('should reject when another user tries to update the candidate', async () => {
    candidateRepository.findById.mockResolvedValue(
      candidate,
    );

    await expect(
      service.execute(
        'candidate-1',
        'user-2',
        {},
      ),
    ).rejects.toThrow(
      'You can only update your own nomination.',
    );

    expect(
      candidateStatusValidator.validateEditable,
    ).not.toHaveBeenCalled();

    expect(
      candidateRepository.update,
    ).not.toHaveBeenCalled();
  });

  // ============================================================
  // CANDIDATE STATUS
  // ============================================================

  it('should call candidate status validator before updating', async () => {
    candidateRepository.findById.mockResolvedValue(
      candidate,
    );

    candidateStatusValidator.validateEditable.mockReturnValue(
      undefined,
    );

    candidateValidator.validateElectionExists.mockResolvedValue(
      election,
    );

    candidateValidator.validateNominationWindow.mockReturnValue(
      undefined,
    );

    candidateValidator.validateCandidateType.mockResolvedValue(
      undefined,
    );

    candidateRepository.update.mockResolvedValue(
      updatedCandidate,
    );

    await service.execute(
      'candidate-1',
      'user-1',
      {},
    );

    expect(
      candidateStatusValidator.validateEditable,
    ).toHaveBeenCalledWith(
      candidate.status,
    );
  });

  // ============================================================
  // ELECTION VALIDATION
  // ============================================================

  it('should validate that the election exists', async () => {
    candidateRepository.findById.mockResolvedValue(
      candidate,
    );

    candidateStatusValidator.validateEditable.mockReturnValue(
      undefined,
    );

    candidateValidator.validateElectionExists.mockResolvedValue(
      election,
    );

    candidateValidator.validateNominationWindow.mockReturnValue(
      undefined,
    );

    candidateValidator.validateCandidateType.mockResolvedValue(
      undefined,
    );

    candidateRepository.update.mockResolvedValue(
      updatedCandidate,
    );

    await service.execute(
      'candidate-1',
      'user-1',
      {},
    );

    expect(
      candidateValidator.validateElectionExists,
    ).toHaveBeenCalledWith(
      candidate.electionId,
    );
  });

  // ============================================================
  // NOMINATION WINDOW
  // ============================================================

  it('should validate nomination window', async () => {
    candidateRepository.findById.mockResolvedValue(
      candidate,
    );

    candidateStatusValidator.validateEditable.mockReturnValue(
      undefined,
    );

    candidateValidator.validateElectionExists.mockResolvedValue(
      election,
    );

    candidateValidator.validateNominationWindow.mockReturnValue(
      undefined,
    );

    candidateValidator.validateCandidateType.mockResolvedValue(
      undefined,
    );

    candidateRepository.update.mockResolvedValue(
      updatedCandidate,
    );

    await service.execute(
      'candidate-1',
      'user-1',
      {},
    );

    expect(
      candidateValidator.validateNominationWindow,
    ).toHaveBeenCalledWith(
      election,
    );
  });

  // ============================================================
  // CANDIDATE TYPE / PARTY
  // ============================================================

  it('should validate candidate type and party', async () => {
    const partyCandidate = {
      ...candidate,
      candidateType: CandidateType.PARTY,
      partyId: 'party-1',
    };

    candidateRepository.findById.mockResolvedValue(
      partyCandidate,
    );

    candidateStatusValidator.validateEditable.mockReturnValue(
      undefined,
    );

    candidateValidator.validateElectionExists.mockResolvedValue(
      election,
    );

    candidateValidator.validateNominationWindow.mockReturnValue(
      undefined,
    );

    candidateValidator.validateCandidateType.mockResolvedValue(
      undefined,
    );

    candidateRepository.update.mockResolvedValue(
      partyCandidate,
    );

    await service.execute(
      'candidate-1',
      'user-1',
      {},
    );

    expect(
      candidateValidator.validateCandidateType,
    ).toHaveBeenCalledWith(
      CandidateType.PARTY,
      'party-1',
    );
  });

  it('should preserve the existing candidate type and party when they are not changed', async () => {
  const partyCandidate = {
    ...candidate,
    candidateType: CandidateType.PARTY,
    partyId: 'party-1',
  };

  candidateRepository.findById.mockResolvedValue(
    partyCandidate,
  );

  candidateStatusValidator.validateEditable.mockReturnValue(
    undefined,
  );

  candidateValidator.validateElectionExists.mockResolvedValue(
    election,
  );

  candidateValidator.validateNominationWindow.mockReturnValue(
    undefined,
  );

  candidateValidator.validateCandidateType.mockResolvedValue(
    undefined,
  );

  candidateRepository.update.mockResolvedValue(
    partyCandidate,
  );

  await service.execute(
    'candidate-1',
    'user-1',
    {
      position: 'Updated Position',
    },
  );

  expect(
    candidateValidator.validateCandidateType,
  ).toHaveBeenCalledWith(
    CandidateType.PARTY,
    'party-1',
  );
});

  // ============================================================
  // UPDATE DATA
  // ============================================================

  it('should trim text fields before updating', async () => {
    candidateRepository.findById.mockResolvedValue(
      candidate,
    );

    candidateStatusValidator.validateEditable.mockReturnValue(
      undefined,
    );

    candidateValidator.validateElectionExists.mockResolvedValue(
      election,
    );

    candidateValidator.validateNominationWindow.mockReturnValue(
      undefined,
    );

    candidateValidator.validateCandidateType.mockResolvedValue(
      undefined,
    );

    candidateRepository.update.mockResolvedValue(
      updatedCandidate,
    );

    await service.execute(
      'candidate-1',
      'user-1',
      {
        position: '  Updated Position  ',
        manifesto: '  Updated Manifesto  ',
        agenda: '  Updated Agenda  ',
        achievements: '  Updated Achievements  ',
        nominationStatement:
          '  Updated Statement  ',
        photoUrl:
          '  https://example.com/photo.jpg  ',
        documentUrl:
          '  https://example.com/document.pdf  ',
      },
    );

    expect(
      candidateRepository.update,
    ).toHaveBeenCalledWith(
      'candidate-1',
      expect.objectContaining({
        position: 'Updated Position',
        manifesto: 'Updated Manifesto',
        agenda: 'Updated Agenda',
        achievements: 'Updated Achievements',
        nominationStatement: 'Updated Statement',
        photoUrl:
          'https://example.com/photo.jpg',
        documentUrl:
          'https://example.com/document.pdf',
      }),
    );
  });
});