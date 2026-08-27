import { GetPublicCandidateProfileService } from './get-public-candidate-profile.service';
import { CandidateRepository } from '../repository/candidate.repository';
import { CampaignWindowValidator } from '../validators/campaign-window.validator';

describe('GetPublicCandidateProfileService', () => {
  it('should return a public candidate profile', async () => {
    const candidate = {
      id: 'candidate-1',
      position: 'President',
      election: {
        startDate: new Date(),
        endDate: new Date(),
      },
    };

    const repository = {
      findPublicProfile: jest.fn().mockResolvedValue(candidate),
    };

    const campaignValidator = {
      getStatus: jest.fn().mockReturnValue('ACTIVE'),
      isOpen: jest.fn().mockReturnValue(true),
    };

    const service = new GetPublicCandidateProfileService(
      repository as unknown as CandidateRepository,
      campaignValidator as unknown as CampaignWindowValidator,
    );

    const result = await service.execute('candidate-1');

    expect(result).toEqual({
  ...candidate,
  campaign: {
    status: 'ACTIVE',
    open: true,
    startDate: candidate.election.startDate,
    endDate: candidate.election.endDate,
  },
});
  });

  it('should reject a missing public profile', async () => {
    const repository = {
      findPublicProfile: jest.fn().mockResolvedValue(null),
    };

    const service = new GetPublicCandidateProfileService(
      repository as unknown as CandidateRepository,
      {} as CampaignWindowValidator,
    );

    await expect(
      service.execute('candidate-1'),
    ).rejects.toThrow(
      'Public candidate profile not found.',
    );
  });
});
