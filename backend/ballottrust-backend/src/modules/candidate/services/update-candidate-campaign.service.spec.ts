import { UpdateCandidateCampaignService } from './update-candidate-campaign.service';
import { CandidateRepository } from '../repository/candidate.repository';
import { CandidateStatusValidator } from '../validators/candidate-status.validator';
import { CampaignWindowValidator } from '../validators/campaign-window.validator';
import { CandidateStatus } from '@prisma/client';

describe('UpdateCandidateCampaignService', () => {
  it('should be defined', () => {
    const service = new UpdateCandidateCampaignService(
      {} as CandidateRepository,
      {} as CandidateStatusValidator,
      {} as CampaignWindowValidator,
    );

    expect(service).toBeDefined();
  });

  it('should reject changes after ballot finalization', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue({
        id: 'candidate-1',
        userId: 'user-1',
        status: CandidateStatus.APPROVED,
      }),
      findElectionCampaignState: jest.fn().mockResolvedValue({
        ballotFinalizedAt: new Date(),
      }),
    };

    const service = new UpdateCandidateCampaignService(
      repository as unknown as CandidateRepository,
      {
        validateCampaignEditable: jest.fn(),
      } as unknown as CandidateStatusValidator,
      {
        validate: jest.fn(),
      } as unknown as CampaignWindowValidator,
    );

    await expect(
      service.execute(
        'candidate-1',
        'user-1',
        {} as any,
      ),
    ).rejects.toThrow(
      'Campaign information cannot be modified after the ballot has been finalized.',
    );
  });

  it('should reject another user from updating the candidate campaign', async () => {
  const repository = {
    findById: jest.fn().mockResolvedValue({
      id: 'candidate-1',
      userId: 'owner-user',
      electionId: 'election-1',
      status: CandidateStatus.APPROVED,
    }),
    findElectionCampaignState: jest.fn(),
    update: jest.fn(),
  };

  const statusValidator = {
    validateCampaignEditable: jest.fn(),
  };

  const campaignWindowValidator = {
    validate: jest.fn(),
  };

  const service = new UpdateCandidateCampaignService(
    repository as unknown as CandidateRepository,
    statusValidator as unknown as CandidateStatusValidator,
    campaignWindowValidator as unknown as CampaignWindowValidator,
  );

  await expect(
    service.execute(
      'candidate-1',
      'different-user',
      {
        campaignSlogan: 'Unauthorized campaign',
      } as any,
    ),
  ).rejects.toThrow(
    'You can only update your own campaign information.',
  );

  expect(
    statusValidator.validateCampaignEditable,
  ).not.toHaveBeenCalled();

  expect(
    repository.findElectionCampaignState,
  ).not.toHaveBeenCalled();

  expect(
    repository.update,
  ).not.toHaveBeenCalled();
});
});
