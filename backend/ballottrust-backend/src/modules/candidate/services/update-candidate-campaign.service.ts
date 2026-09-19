import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CandidateRepository } from '../repository/candidate.repository';

import { UpdateCandidateCampaignDto } from '../dto/update-candidate-campaign.dto';

import { CandidateStatusValidator } from '../validators/candidate-status.validator';

import { CampaignWindowValidator } from '../validators/campaign-window.validator';

@Injectable()
export class UpdateCandidateCampaignService {
  constructor(
    private readonly candidateRepository: CandidateRepository,

    private readonly candidateStatusValidator: CandidateStatusValidator,

    private readonly campaignWindowValidator: CampaignWindowValidator,
  ) {}

  async execute(
    candidateId: string,
    userId: string,
    dto: UpdateCandidateCampaignDto,
  ) {
    // ======================================================
    // 1. Find Candidate
    // ======================================================

    const candidate = await this.candidateRepository.findById(candidateId);

    if (!candidate) {
      throw new NotFoundException('Candidate not found.');
    }

    // ======================================================
    // 2. Validate Ownership
    // ======================================================

    if (candidate.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own campaign information.',
      );
    }

    // ======================================================
    // 3. Validate Candidate Lifecycle
    // ======================================================

    this.candidateStatusValidator.validateCampaignEditable(candidate.status);

    // ======================================================
    // 4. Find Election Campaign State
    // ======================================================

    const election = await this.candidateRepository.findElectionCampaignState(
      candidate.electionId,
    );

    if (!election) {
      throw new NotFoundException('Election not found.');
    }

    // ======================================================
    // 5. Validate Campaign Window
    // ======================================================

    this.campaignWindowValidator.validate(
      election.campaignStart,
      election.campaignEnd,
    );

    // ======================================================
    // 6. Prevent Changes After Ballot Finalization
    // ======================================================

    if (election.ballotFinalizedAt) {
      throw new ForbiddenException(
        'Campaign information cannot be modified after the ballot has been finalized.',
      );
    }

    // ======================================================
    // 7. Update Campaign Information
    // ======================================================

    return this.candidateRepository.update(candidateId, {
      ...(dto.campaignSlogan !== undefined && {
        campaignSlogan: dto.campaignSlogan.trim(),
      }),

      ...(dto.campaignWebsite !== undefined && {
        campaignWebsite: dto.campaignWebsite.trim(),
      }),
    });
  }
}
