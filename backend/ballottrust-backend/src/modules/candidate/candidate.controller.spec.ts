import { Test, TestingModule } from '@nestjs/testing';

import { CandidateController } from './candidate.controller';

import { SubmitNominationService } from './services/submit-nomination.service';
import { VerifyCandidateService } from './services/verify-candidate.service';
import { ApproveCandidateService } from './services/approve-candidate.service';
import { RejectCandidateService } from './services/reject-candidate.service';
import { WithdrawCandidateService } from './services/withdraw-candidate.service';
import { DisqualifyCandidateService } from './services/disqualify-candidate.service';
import { GetCandidateService } from './services/get-candidate.service';
import { ListCandidatesService } from './services/list-candidates.service';
import { MyCandidatesService } from './services/my-candidates.service';
import { AssignCandidateNumberService } from './services/assign-candidate-number.service';
import { AutoAssignCandidateNumberService } from './services/auto-assign-candidate-number.service';
import { GenerateBallotOrderService } from './services/generate-ballot-order.service';
import { ManualBallotOrderService } from './services/manual-ballot-order.service';
import { GetBallotService } from './services/get-ballot.service';
import { FinalizeBallotService } from './services/finalize-ballot.service';
import { UpdateCandidateService } from './services/update-candidate.service';
import { CancelNominationService } from './services/cancel-nomination.service';
import { UpdateCandidateProfileService } from './services/update-candidate-profile.service';
import { GetPublicCandidateProfileService } from './services/get-public-candidate-profile.service';
import { UpdateCandidateCampaignService } from './services/update-candidate-campaign.service';

import { UploadCandidateDocumentService } from './documents/services/upload-candidate-document.service';
import { ListCandidateDocumentsService } from './documents/services/list-candidate-documents.service';
import { GetCandidateDocumentService } from './documents/services/get-candidate-document.service';
import { ReplaceCandidateDocumentService } from './documents/services/replace-candidate-document.service';
import { VerifyCandidateDocumentService } from './documents/services/verify-candidate-document.service';
import { RejectCandidateDocumentService } from './documents/services/reject-candidate-document.service';
import { DeleteCandidateDocumentService } from './documents/services/delete-candidate-document.service';

describe('CandidateController', () => {
  let controller: CandidateController;

  const mockService = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidateController],

      providers: [
        {
          provide: SubmitNominationService,
          useValue: mockService,
        },
        {
          provide: VerifyCandidateService,
          useValue: mockService,
        },
        {
          provide: ApproveCandidateService,
          useValue: mockService,
        },
        {
          provide: RejectCandidateService,
          useValue: mockService,
        },
        {
          provide: WithdrawCandidateService,
          useValue: mockService,
        },
        {
          provide: DisqualifyCandidateService,
          useValue: mockService,
        },
        {
          provide: GetCandidateService,
          useValue: mockService,
        },
        {
          provide: ListCandidatesService,
          useValue: mockService,
        },
        {
          provide: MyCandidatesService,
          useValue: mockService,
        },
        {
          provide: AssignCandidateNumberService,
          useValue: mockService,
        },
        {
          provide: AutoAssignCandidateNumberService,
          useValue: mockService,
        },
        {
          provide: GenerateBallotOrderService,
          useValue: mockService,
        },
        {
          provide: ManualBallotOrderService,
          useValue: mockService,
        },
        {
          provide: GetBallotService,
          useValue: mockService,
        },
        {
          provide: FinalizeBallotService,
          useValue: mockService,
        },
        {
          provide: UpdateCandidateService,
          useValue: mockService,
        },
        {
          provide: CancelNominationService,
          useValue: mockService,
        },
        {
          provide: UpdateCandidateProfileService,
          useValue: mockService,
        },
        {
          provide: GetPublicCandidateProfileService,
          useValue: mockService,
        },
        {
          provide: UploadCandidateDocumentService,
          useValue: mockService,
        },
        {
          provide: ListCandidateDocumentsService,
          useValue: mockService,
        },
        {
          provide: GetCandidateDocumentService,
          useValue: mockService,
        },
        {
          provide: ReplaceCandidateDocumentService,
          useValue: mockService,
        },
        {
          provide: VerifyCandidateDocumentService,
          useValue: mockService,
        },
        {
          provide: RejectCandidateDocumentService,
          useValue: mockService,
        },
        {
          provide: DeleteCandidateDocumentService,
          useValue: mockService,
        },
        {
          provide: UpdateCandidateCampaignService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CandidateController>(CandidateController);
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ============================================================
  // NOMINATION
  // ============================================================

  it('should delegate nomination to SubmitNominationService', async () => {
    const dto = {
      electionId: 'election-1',
    };

    const user = {
      userId: 'user-1',
      role: 'CANDIDATE',
    };

    mockService.execute.mockResolvedValue({
      id: 'candidate-1',
    });

    const result = await controller.nominate(dto as any, user as any);

    expect(mockService.execute).toHaveBeenCalledWith(dto, 'user-1');

    expect(result).toEqual({
      id: 'candidate-1',
    });
  });

  // ============================================================
  // PUBLIC PROFILE
  // ============================================================

  it('should delegate public candidate profile lookup', async () => {
    mockService.execute.mockResolvedValue({
      id: 'candidate-1',
    });

    const result = await controller.getPublicCandidateProfile('candidate-1');

    expect(mockService.execute).toHaveBeenCalledWith('candidate-1');

    expect(result).toEqual({
      id: 'candidate-1',
    });
  });

  // ============================================================
  // GET CANDIDATE
  // ============================================================

  it('should delegate candidate lookup with user identity and role', async () => {
    mockService.execute.mockResolvedValue({
      id: 'candidate-1',
    });

    const user = {
      userId: 'user-1',
      role: 'CANDIDATE',
    };

    const result = await controller.findOne('candidate-1', user as any);

    expect(mockService.execute).toHaveBeenCalledWith(
      'candidate-1',
      'user-1',
      'CANDIDATE',
    );

    expect(result).toEqual({
      id: 'candidate-1',
    });
  });

  // ============================================================
  // LIST CANDIDATES
  // ============================================================

  it('should delegate candidate listing with query', async () => {
    const query = {
      electionId: 'election-1',
    };

    mockService.execute.mockResolvedValue([]);

    const result = await controller.findAll(query as any);

    expect(mockService.execute).toHaveBeenCalledWith(query);

    expect(result).toEqual([]);
  });

  // ============================================================
  // MY CANDIDACIES
  // ============================================================

  it('should delegate my candidacies using authenticated user', async () => {
    const user = {
      userId: 'user-1',
      role: 'CANDIDATE',
    };

    mockService.execute.mockResolvedValue([]);

    const result = await controller.getMyCandidates(user as any);

    expect(mockService.execute).toHaveBeenCalledWith('user-1');

    expect(result).toEqual([]);
  });

  // ============================================================
  // WITHDRAW
  // ============================================================

  it('should delegate candidate withdrawal with owner identity', async () => {
    const user = {
      userId: 'user-1',
      role: 'CANDIDATE',
    };

    const dto = {
      reason: 'Personal reasons',
    };

    mockService.execute.mockResolvedValue({
      status: 'WITHDRAWN',
    });

    const result = await controller.withdraw('candidate-1', dto, user as any);

    expect(mockService.execute).toHaveBeenCalledWith(
      'candidate-1',
      'user-1',
      'Personal reasons',
    );

    expect(result).toEqual({
      status: 'WITHDRAWN',
    });
  });

  // ============================================================
  // UPDATE CANDIDATE
  // ============================================================

  it('should delegate candidate update with user identity', async () => {
    const dto = {
      biography: 'Updated',
    };

    const user = {
      userId: 'user-1',
      role: 'CANDIDATE',
    };

    mockService.execute.mockResolvedValue({
      id: 'candidate-1',
    });

    await controller.updateCandidate('candidate-1', dto as any, user as any);

    expect(mockService.execute).toHaveBeenCalledWith(
      'candidate-1',
      'user-1',
      dto,
    );
  });

  // ============================================================
  // UPDATE PROFILE
  // ============================================================

  it('should delegate candidate profile update', async () => {
    const dto = {
      biography: 'Updated profile',
    };

    const user = {
      userId: 'user-1',
      role: 'CANDIDATE',
    };

    mockService.execute.mockResolvedValue({
      id: 'candidate-1',
    });

    await controller.updateCandidateProfile('candidate-1', dto, user as any);

    expect(mockService.execute).toHaveBeenCalledWith(
      'candidate-1',
      'user-1',
      dto,
    );
  });

  // ============================================================
  // UPDATE CAMPAIGN
  // ============================================================

  it('should delegate campaign update', async () => {
    const dto = {
      campaignSlogan: 'Vote for progress',
    };

    const user = {
      userId: 'user-1',
      role: 'CANDIDATE',
    };

    mockService.execute.mockResolvedValue({
      id: 'candidate-1',
    });

    await controller.updateCampaign('candidate-1', dto, user as any);

    expect(mockService.execute).toHaveBeenCalledWith(
      'candidate-1',
      'user-1',
      dto,
    );
  });

  // ============================================================
  // CANCEL NOMINATION
  // ============================================================

  it('should delegate nomination cancellation', async () => {
    const user = {
      userId: 'user-1',
      role: 'CANDIDATE',
    };

    mockService.execute.mockResolvedValue({
      message: 'Nomination cancelled successfully.',
    });

    await controller.cancelNomination('candidate-1', user as any);

    expect(mockService.execute).toHaveBeenCalledWith('candidate-1', 'user-1');
  });

  // ============================================================
  // DOCUMENT LIST
  // ============================================================

  it('should delegate candidate document listing with user and role', async () => {
    const user = {
      userId: 'user-1',
      role: 'CANDIDATE',
    };

    mockService.execute.mockResolvedValue([]);

    await controller.listCandidateDocuments('candidate-1', user as any);

    expect(mockService.execute).toHaveBeenCalledWith(
      'candidate-1',
      'user-1',
      'CANDIDATE',
    );
  });

  // ============================================================
  // GET DOCUMENT
  // ============================================================

  it('should delegate candidate document retrieval', async () => {
    const user = {
      userId: 'user-1',
      role: 'CANDIDATE',
    };

    const document = {
      id: 'document-1',
      candidateId: 'candidate-1',
    };

    mockService.execute.mockResolvedValue(document);

    const result = await controller.getCandidateDocument(
      'candidate-1',
      'document-1',
      user as any,
    );

    expect(mockService.execute).toHaveBeenCalledWith(
      'candidate-1',
      'document-1',
      'user-1',
      'CANDIDATE',
    );

    expect(result).toEqual(document);
  });

  // ============================================================
  // DELETE DOCUMENT
  // ============================================================

  it('should delegate candidate document deletion', async () => {
    const user = {
      userId: 'user-1',
      role: 'CANDIDATE',
    };

    mockService.execute.mockResolvedValue({
      message: 'Candidate document deleted successfully.',
    });

    await controller.deleteCandidateDocument(
      'candidate-1',
      'document-1',
      user as any,
    );

    expect(mockService.execute).toHaveBeenCalledWith(
      'candidate-1',
      'document-1',
      'user-1',
    );
  });

  // ============================================================
  // ADMIN VERIFY CANDIDATE
  // ============================================================

  it('should delegate candidate verification', async () => {
    const user = {
      userId: 'commissioner-1',
      role: 'ELECTION_COMMISSIONER',
    };

    mockService.execute.mockResolvedValue({
      status: 'VERIFIED',
    });

    await controller.verify('candidate-1', user as any);

    expect(mockService.execute).toHaveBeenCalledWith(
      'candidate-1',
      'commissioner-1',
    );
  });

  // ============================================================
  // ADMIN APPROVE CANDIDATE
  // ============================================================

  it('should delegate candidate approval', async () => {
    const user = {
      userId: 'commissioner-1',
      role: 'ELECTION_COMMISSIONER',
    };

    mockService.execute.mockResolvedValue({
      status: 'APPROVED',
    });

    await controller.approve('candidate-1', user as any);

    expect(mockService.execute).toHaveBeenCalledWith(
      'candidate-1',
      'commissioner-1',
    );
  });

  // ============================================================
  // ADMIN REJECT CANDIDATE
  // ============================================================

  it('should delegate candidate rejection with reason', async () => {
    const user = {
      userId: 'commissioner-1',
      role: 'ELECTION_COMMISSIONER',
    };

    const dto = {
      reason: 'Invalid documentation',
    };

    mockService.execute.mockResolvedValue({
      status: 'REJECTED',
    });

    await controller.reject('candidate-1', dto, user as any);

    expect(mockService.execute).toHaveBeenCalledWith(
      'candidate-1',
      'commissioner-1',
      'Invalid documentation',
    );
  });

  // ============================================================
  // ADMIN DISQUALIFY
  // ============================================================

  it('should delegate candidate disqualification with reason', async () => {
    const user = {
      userId: 'commissioner-1',
      role: 'ELECTION_COMMISSIONER',
    };

    const dto = {
      reason: 'Rule violation',
    };

    mockService.execute.mockResolvedValue({
      status: 'DISQUALIFIED',
    });

    await controller.disqualify('candidate-1', dto, user as any);

    expect(mockService.execute).toHaveBeenCalledWith(
      'candidate-1',
      'commissioner-1',
      'Rule violation',
    );
  });

  // ============================================================
  // DOCUMENT ADMINISTRATION
  // ============================================================

  it('should delegate document verification', async () => {
    const user = {
      userId: 'commissioner-1',
      role: 'ELECTION_COMMISSIONER',
    };

    await controller.verifyCandidateDocument(
      'candidate-1',
      'document-1',
      user as any,
    );

    expect(mockService.execute).toHaveBeenCalledWith(
      'candidate-1',
      'document-1',
      'commissioner-1',
    );
  });

  it('should delegate document rejection with reason', async () => {
    const user = {
      userId: 'commissioner-1',
      role: 'ELECTION_COMMISSIONER',
    };

    const dto = {
      reason: 'Document is invalid',
    };

    await controller.rejectCandidateDocument(
      'candidate-1',
      'document-1',
      dto,
      user as any,
    );

    expect(mockService.execute).toHaveBeenCalledWith(
      'candidate-1',
      'document-1',
      'commissioner-1',
      'Document is invalid',
    );
  });
});
