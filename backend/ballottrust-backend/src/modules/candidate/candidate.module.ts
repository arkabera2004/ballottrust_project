import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { CandidateController } from './candidate.controller';
import { CandidateRepository } from './repository/candidate.repository';
import { CandidateValidator } from './validators/candidate.validator';
import { SubmitNominationService } from './services/submit-nomination.service';
import { VerifyCandidateService } from './services/verify-candidate.service';
import { ApproveCandidateService } from './services/approve-candidate.service';
import { RejectCandidateService } from './services/reject-candidate.service';
import { WithdrawCandidateService } from './services/withdraw-candidate.service';
import { DisqualifyCandidateService } from './services/disqualify-candidate.service';
import { GetCandidateService } from './services/get-candidate.service';
import { ListCandidatesService } from './services/list-candidates.service';
import { MyCandidatesService } from './services/my-candidates.service';
import { CandidateStatusValidator } from './validators/candidate-status.validator';
import { AssignCandidateNumberService } from './services/assign-candidate-number.service';
import { AutoAssignCandidateNumberService } from './services/auto-assign-candidate-number.service';
import { GenerateBallotOrderService } from './services/generate-ballot-order.service';
import { ManualBallotOrderService } from './services/manual-ballot-order.service';
import { GetBallotService } from './services/get-ballot.service';
import { BallotLifecycleValidator } from './validators/ballot-lifecycle.validator';
import { FinalizeBallotService } from './services/finalize-ballot.service';

@Module({
  imports: [
    PrismaModule,
  ],

  controllers: [
    CandidateController,
  ],

  providers: [
  CandidateRepository,
  CandidateValidator,
  SubmitNominationService,
  VerifyCandidateService,
  ApproveCandidateService,
  RejectCandidateService,
  WithdrawCandidateService,
  DisqualifyCandidateService,
  GetCandidateService,
  ListCandidatesService,
  MyCandidatesService,
  CandidateStatusValidator,
  AssignCandidateNumberService,
  AutoAssignCandidateNumberService,
  GenerateBallotOrderService,
  ManualBallotOrderService,
  GetBallotService,
  BallotLifecycleValidator,
  FinalizeBallotService,
],

  exports: [
    CandidateRepository,
  ],
})
export class CandidateModule {}