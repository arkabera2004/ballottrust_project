import { Injectable, NotFoundException } from '@nestjs/common';

import { CandidateRepository } from '../repository/candidate.repository';
import { CampaignWindowValidator } from '../validators/campaign-window.validator';

@Injectable()
export class GetPublicCandidateProfileService {
  constructor(
    private readonly candidateRepository: CandidateRepository,

    private readonly campaignWindowValidator: CampaignWindowValidator,
  ) {}

  async execute(candidateId: string) {
    const candidate =
      await this.candidateRepository.findPublicProfile(candidateId);

    if (!candidate) {
      throw new NotFoundException('Public candidate profile not found.');
    }

    const campaignStatus = this.campaignWindowValidator.getStatus(
      candidate.election.startDate,
      candidate.election.endDate,
    );

    const campaignOpen = this.campaignWindowValidator.isOpen(
      candidate.election.startDate,
      candidate.election.endDate,
    );

    return {
      ...candidate,

      campaign: {
        status: campaignStatus,
        open: campaignOpen,
        startDate: candidate.election.startDate,
        endDate: candidate.election.endDate,
      },
    };
  }
}
