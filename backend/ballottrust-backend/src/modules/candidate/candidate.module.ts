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
import { UpdateCandidateService } from './services/update-candidate.service';
import { CancelNominationService } from './services/cancel-nomination.service';
import { UpdateCandidateProfileService } from './services/update-candidate-profile.service';
import { CandidateProfileCompletenessService } from './services/candidate-profile-completeness.service';
import { GetPublicCandidateProfileService } from './services/get-public-candidate-profile.service';
import { CandidateDocumentRepository } from './documents/candidate-document.repository';
import { UploadCandidateDocumentService } from './documents/services/upload-candidate-document.service';
import { ListCandidateDocumentsService } from './documents/services/list-candidate-documents.service';
import { GetCandidateDocumentService } from './documents/services/get-candidate-document.service';
import { ReplaceCandidateDocumentService } from './documents/services/replace-candidate-document.service';
import { CandidateDocumentStatusValidator } from './documents/validators/candidate-document-status.validator';
import { VerifyCandidateDocumentService } from './documents/services/verify-candidate-document.service';
import { RejectCandidateDocumentService } from './documents/services/reject-candidate-document.service';
import { DeleteCandidateDocumentService } from './documents/services/delete-candidate-document.service';
import { CandidateDocumentCompletenessService } from './documents/services/candidate-document-completeness.service';

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
  UpdateCandidateService,
  CancelNominationService,
  UpdateCandidateProfileService,
  CandidateProfileCompletenessService,
  GetPublicCandidateProfileService,
  CandidateDocumentRepository,
  UploadCandidateDocumentService,
  ListCandidateDocumentsService,
  GetCandidateDocumentService,
  ReplaceCandidateDocumentService,
  CandidateDocumentStatusValidator,
  VerifyCandidateDocumentService,
  RejectCandidateDocumentService,
  DeleteCandidateDocumentService, 
  CandidateDocumentCompletenessService,
],

  exports: [
    CandidateRepository,
  ],
})
export class CandidateModule {}