import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
  NotFoundException,
  Req,
} from '@nestjs/common';

import { Role } from '@prisma/client';

import {
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  UploadCandidateDocumentDto,
} from './documents/dto/upload-candidate-document.dto';

import {
  UploadCandidateDocumentService,
} from './documents/services/upload-candidate-document.service';

import {
  candidateDocumentMulterConfig,
} from './documents/candidate-document-upload.config';

import { CreateCandidateDto } from './dto/create-candidate.dto';
import { QueryCandidateDto } from './dto/query-candidate.dto';
import { RejectCandidateDto } from './dto/reject-candidate.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

import { SubmitNominationService } from './services/submit-nomination.service';
import { VerifyCandidateService } from './services/verify-candidate.service';
import { ApproveCandidateService } from './services/approve-candidate.service';
import { RejectCandidateService } from './services/reject-candidate.service';
import { WithdrawCandidateService } from './services/withdraw-candidate.service';
import { DisqualifyCandidateService } from './services/disqualify-candidate.service';
import { GetCandidateService } from './services/get-candidate.service';
import { ListCandidatesService } from './services/list-candidates.service';
import { MyCandidatesService } from './services/my-candidates.service';
import { DisqualifyCandidateDto } from './dto/disqualify-candidate.dto';
import { WithdrawCandidateDto } from './dto/withdraw-candidate.dto';
import { AssignCandidateNumberDto } from './dto/assign-candidate-number.dto';
import { AssignCandidateNumberService } from './services/assign-candidate-number.service';
import { AutoAssignCandidateNumberService } from './services/auto-assign-candidate-number.service';
import { GenerateBallotOrderDto } from './dto/generate-ballot-order.dto';
import { GenerateBallotOrderService } from './services/generate-ballot-order.service';
import { ManualBallotOrderDto } from './dto/manual-ballot-order.dto';
import { ManualBallotOrderService } from './services/manual-ballot-order.service';
import { GetBallotService } from './services/get-ballot.service';
import { FinalizeBallotService } from './services/finalize-ballot.service';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { UpdateCandidateService } from './services/update-candidate.service';
import { CancelNominationService } from './services/cancel-nomination.service';
import { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto';
import { UpdateCandidateProfileService } from './services/update-candidate-profile.service';
import { GetPublicCandidateProfileService } from './services/get-public-candidate-profile.service';
import { ListCandidateDocumentsService } from './documents/services/list-candidate-documents.service';
import { GetCandidateDocumentService } from './documents/services/get-candidate-document.service';
import { ReplaceCandidateDocumentService } from './documents/services/replace-candidate-document.service';
import { VerifyCandidateDocumentService } from './documents/services/verify-candidate-document.service';
import { RejectCandidateDocumentService } from './documents/services/reject-candidate-document.service';
import { RejectCandidateDocumentDto } from './documents/dto/reject-candidate-document.dto';
import { DeleteCandidateDocumentService } from './documents/services/delete-candidate-document.service';
import { UpdateCandidateCampaignService } from './services/update-candidate-campaign.service';
import { UpdateCandidateCampaignDto } from './dto/update-candidate-campaign.dto';

@Controller('candidates')
export class CandidateController {
  constructor(
    private readonly submitNominationService:
      SubmitNominationService,

    private readonly verifyCandidateService:
      VerifyCandidateService,

    private readonly approveCandidateService:
      ApproveCandidateService,

    private readonly rejectCandidateService:
      RejectCandidateService,

    private readonly withdrawCandidateService:
      WithdrawCandidateService,

    private readonly disqualifyCandidateService:
      DisqualifyCandidateService,

    private readonly getCandidateService:
      GetCandidateService,

    private readonly listCandidatesService:
      ListCandidatesService,

    private readonly myCandidatesService:
      MyCandidatesService,

    private readonly assignCandidateNumberService:
      AssignCandidateNumberService,

    private readonly autoAssignCandidateNumberService:
      AutoAssignCandidateNumberService,

    private readonly generateBallotOrderService:
      GenerateBallotOrderService,

    private readonly manualBallotOrderService:
      ManualBallotOrderService,

    private readonly getBallotService:
      GetBallotService,

    private readonly finalizeBallotService:
      FinalizeBallotService,

    private readonly updateCandidateService:
      UpdateCandidateService,

    private readonly cancelNominationService:
      CancelNominationService,

    private readonly updateCandidateProfileService:
      UpdateCandidateProfileService,

    private readonly getPublicCandidateProfileService:
      GetPublicCandidateProfileService,

    private readonly uploadCandidateDocumentService:
      UploadCandidateDocumentService,

    private readonly listCandidateDocumentsService:
      ListCandidateDocumentsService,

    private readonly getCandidateDocumentService:
      GetCandidateDocumentService,

    private readonly replaceCandidateDocumentService:
      ReplaceCandidateDocumentService,

    private readonly verifyCandidateDocumentService:
      VerifyCandidateDocumentService,

    private readonly rejectCandidateDocumentService:
      RejectCandidateDocumentService,

    private readonly deleteCandidateDocumentService:
      DeleteCandidateDocumentService,

    private readonly updateCandidateCampaignService:
      UpdateCandidateCampaignService,

  ) {}

  // ======================================================
  // Submit Nomination
  // ======================================================

  @Post('nominate')
  @UseGuards(JwtAuthGuard)
  async nominate(
    @Body()
    dto: CreateCandidateDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.submitNominationService.execute(
      dto,
      user.userId,
    );
  }

  // ======================================================
// Get Public Candidate Profile
// ======================================================

@Get('public/:id')
async getPublicCandidateProfile(
  @Param(
  'id',
  new ParseUUIDPipe({
    version: '4',
  }),
)
id: string,
) {
  return this.getPublicCandidateProfileService.execute(
    id,
  );
}

// ======================================================
// Upload Candidate Document
// ======================================================

@Post(':id/documents')
@UseGuards(JwtAuthGuard)
@UseInterceptors(
  FileInterceptor(
    'file',
    candidateDocumentMulterConfig,
  ),
)
async uploadCandidateDocument(
  @Param(
  'id',
  new ParseUUIDPipe({
    version: '4',
  }),
)
id: string,

  @Body()
  dto: UploadCandidateDocumentDto,

  @UploadedFile()
  file: Express.Multer.File,

  @CurrentUser()
  user: JwtPayload,
) {
  return this.uploadCandidateDocumentService.execute(
    id,
    user.userId,
    dto,
    file,
  );
}

  // ======================================================
  // Get My Candidacies
  // IMPORTANT: Must be before @Get(':id')
  // ======================================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyCandidates(
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.myCandidatesService.execute(
      user.userId,
    );
  }

  // ======================================================
  // List Candidates
  // ======================================================

  @Get()
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  Role.SUPER_ADMIN,
  Role.ELECTION_COMMISSIONER,
)
async findAll(
  @Query()
  query: QueryCandidateDto,
) {
  return this.listCandidatesService.execute(
    query,
  );
}

  // ======================================================
  // Verify Candidate
  // ======================================================

  @Patch(':id/verify')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    Role.ELECTION_COMMISSIONER,
    Role.SUPER_ADMIN,
  )
  async verify(
    @Param(
  'id',
  new ParseUUIDPipe({
    version: '4',
  }),
)
id: string,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.verifyCandidateService.execute(
      id,
      user.userId,
    );
  }

  // ======================================================
  // Approve Candidate
  // ======================================================

  @Patch(':id/approve')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    Role.ELECTION_COMMISSIONER,
    Role.SUPER_ADMIN,
  )
  async approve(
    @Param(
  'id',
  new ParseUUIDPipe({
    version: '4',
  }),
)
id: string,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.approveCandidateService.execute(
      id,
      user.userId,
    );
  }

  // ======================================================
  // Reject Candidate
  // ======================================================

  @Patch(':id/reject')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    Role.ELECTION_COMMISSIONER,
    Role.SUPER_ADMIN,
  )
  async reject(
  @Param(
  'id',
  new ParseUUIDPipe({
    version: '4',
  }),
)
id: string,

  @Body()
  dto: RejectCandidateDto,

  @CurrentUser()
  user: JwtPayload,
) {
  return this.rejectCandidateService.execute(
    id,
    user.userId,
    dto.reason,
  );
}

  // ======================================================
// Withdraw Candidacy
// ======================================================

@Patch(':id/withdraw')
@UseGuards(JwtAuthGuard)
async withdraw(
  @Param(
  'id',
  new ParseUUIDPipe({
    version: '4',
  }),
)
id: string,

  @Body()
  dto: WithdrawCandidateDto,

  @CurrentUser()
  user: JwtPayload,
) {
  return this.withdrawCandidateService.execute(
    id,
    user.userId,
    dto.reason,
  );
}

 // ======================================================
// Disqualify Candidate
// ======================================================

@Patch(':id/disqualify')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  Role.ELECTION_COMMISSIONER,
  Role.SUPER_ADMIN,
)
async disqualify(
  @Param(
  'id',
  new ParseUUIDPipe({
    version: '4',
  }),
)
id: string,

  @Body()
  dto: DisqualifyCandidateDto,

  @CurrentUser()
  user: JwtPayload,
) {
  return this.disqualifyCandidateService.execute(
    id,
    user.userId,
    dto.reason,
  );
}

  // ======================================================
  // Get Candidate By ID
  // Keep this route LAST among GET routes
  // ======================================================

  @Get(':id')
@UseGuards(JwtAuthGuard)
async findOne(
  @Param(
  'id',
  new ParseUUIDPipe({
    version: '4',
  }),
)
id: string,

  @CurrentUser()
  user: JwtPayload,
) {
  return this.getCandidateService.execute(
    id,
    user.userId,
    user.role,
  );
}

  // ======================================================
// Assign Candidate Number
// ======================================================

@Patch(':id/candidate-number')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  Role.SUPER_ADMIN,
  Role.ELECTION_COMMISSIONER,
)
async assignCandidateNumber(
  @Param(
  'id',
  new ParseUUIDPipe({
    version: '4',
  }),
)
id: string,

  @Body()
  dto: AssignCandidateNumberDto,
) {
  return this.assignCandidateNumberService.execute(
    id,
    dto.candidateNumber,
  );
}

// ======================================================
// Auto Assign Candidate Number
// ======================================================

@Patch(':id/candidate-number/auto')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  Role.SUPER_ADMIN,
  Role.ELECTION_COMMISSIONER,
)
async autoAssignCandidateNumber(
  @Param(
  'id',
  new ParseUUIDPipe({
    version: '4',
  }),
)
id: string,
) {
  return this.autoAssignCandidateNumberService.execute(
    id,
  );
}

// ======================================================
// Generate Ballot Order
// ======================================================

@Patch('election/:electionId/ballot-order/generate')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  Role.SUPER_ADMIN,
  Role.ELECTION_COMMISSIONER,
)
async generateBallotOrder(
  @Param(
  'electionId',
  new ParseUUIDPipe({
    version: '4',
  }),
)
electionId: string,

  @Body()
  dto: GenerateBallotOrderDto,
) {
  return this.generateBallotOrderService.execute(
    electionId,
    dto.method,
  );
}

// ======================================================
// Manual Ballot Order
// ======================================================

@Patch('election/:electionId/ballot-order/manual')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  Role.SUPER_ADMIN,
  Role.ELECTION_COMMISSIONER,
)
async manualBallotOrder(
  @Param(
  'electionId',
  new ParseUUIDPipe({
    version: '4',
  }),
)
electionId: string,

  @Body()
  dto: ManualBallotOrderDto,
) {
  return this.manualBallotOrderService.execute(
    electionId,
    dto.candidateIds,
  );
}

// ======================================================
// Get Election Ballot
// ======================================================

@Get('election/:electionId/ballot')
async getElectionBallot(
  @Param(
  'electionId',
  new ParseUUIDPipe({
    version: '4',
  }),
)
electionId: string,
) {
  return this.getBallotService.execute(
    electionId,
  );
}

// ======================================================
// Finalize Election Ballot
// ======================================================

@Patch('election/:electionId/ballot/finalize')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  Role.SUPER_ADMIN,
  Role.ELECTION_COMMISSIONER,
)
async finalizeBallot(
  @Param(
  'electionId',
  new ParseUUIDPipe({
    version: '4',
  }),
)
electionId: string,

  @CurrentUser()
  user: JwtPayload,
) {
  return this.finalizeBallotService.execute(
    electionId,
    user.userId,
  );
}

// ======================================================
// Update Own Pending Nomination
// ======================================================

@Patch(':id')
@UseGuards(JwtAuthGuard)
async updateCandidate(
  @Param(
  'id',
  new ParseUUIDPipe({
    version: '4',
  }),
)
id: string,

  @Body()
  dto: UpdateCandidateDto,

  @CurrentUser()
  user: JwtPayload,
) {
  return this.updateCandidateService.execute(
    id,
    user.userId,
    dto,
  );
}

// ======================================================
// Cancel Own Pending Nomination
// ======================================================

@Delete(':id/nomination')
@UseGuards(JwtAuthGuard)
async cancelNomination(
  @Param(
  'id',
  new ParseUUIDPipe({
    version: '4',
  }),
)
id: string,

  @CurrentUser()
  user: JwtPayload,
) {
  return this.cancelNominationService.execute(
    id,
    user.userId,
  );
}

// ======================================================
// Update Candidate Profile
// ======================================================

@Patch(':id/profile')
@UseGuards(JwtAuthGuard)
async updateCandidateProfile(
  @Param(
  'id',
  new ParseUUIDPipe({
    version: '4',
  }),
)
id: string,

  @Body()
  dto: UpdateCandidateProfileDto,

  @CurrentUser()
  user: JwtPayload,
) {
  return this.updateCandidateProfileService.execute(
    id,
    user.userId,
    dto,
  );
}

// ======================================================
// List Candidate Documents
// ======================================================

@Get(':id/documents')
@UseGuards(JwtAuthGuard)
async listCandidateDocuments(
  @Param(
  'id',
  new ParseUUIDPipe({
    version: '4',
  }),
)
id: string,

  @CurrentUser()
  user: JwtPayload,
) {
  return this.listCandidateDocumentsService.execute(
    id,
    user.userId,
    user.role,
  );
}

// ======================================================
// Get Candidate Document
// ======================================================

@Get(':candidateId/documents/:documentId')
@UseGuards(JwtAuthGuard)
async getCandidateDocument(
  @Param(
  'candidateId',
  new ParseUUIDPipe({
    version: '4',
  }),
)
candidateId: string,

  @Param(
  'documentId',
  new ParseUUIDPipe({
    version: '4',
  }),
)
documentId: string,

  @CurrentUser()
  user: JwtPayload,
) {
  const document =
   await this.getCandidateDocumentService.execute(
  candidateId,
  documentId,
  user.userId,
  user.role,
);

  if (
    document.candidateId !==
    candidateId
  ) {
    throw new NotFoundException(
      'Candidate document not found.',
    );
  }

  return document;
}

// ======================================================
// Replace Candidate Document
// ======================================================

@Post(':candidateId/documents/:documentId/replace')
@UseGuards(JwtAuthGuard)
@UseInterceptors(
  FileInterceptor(
    'file',
    candidateDocumentMulterConfig,
  ),
)
async replaceCandidateDocument(
  @Param(
  'candidateId',
  new ParseUUIDPipe({
    version: '4',
  }),
)
candidateId: string,

  @Param(
  'documentId',
  new ParseUUIDPipe({
    version: '4',
  }),
)
documentId: string,

  @UploadedFile()
  file: Express.Multer.File,

  @CurrentUser()
  user: JwtPayload,
) {
  return this.replaceCandidateDocumentService.execute(
    candidateId,
    documentId,
    user.userId,
    file,
  );
}

// ======================================================
// Verify Candidate Document
// ======================================================

@Patch(':candidateId/documents/:documentId/verify')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  Role.SUPER_ADMIN,
  Role.ELECTION_COMMISSIONER,
)
async verifyCandidateDocument(
  @Param(
  'candidateId',
  new ParseUUIDPipe({
    version: '4',
  }),
)
candidateId: string,

  @Param(
  'documentId',
  new ParseUUIDPipe({
    version: '4',
  }),
)
documentId: string,

  @CurrentUser()
  user: JwtPayload,
) {
  return this.verifyCandidateDocumentService.execute(
    candidateId,
    documentId,
    user.userId,
  );
}

// ======================================================
// Reject Candidate Document
// ======================================================

@Patch(':candidateId/documents/:documentId/reject')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  Role.SUPER_ADMIN,
  Role.ELECTION_COMMISSIONER,
)
async rejectCandidateDocument(
  @Param(
  'candidateId',
  new ParseUUIDPipe({
    version: '4',
  }),
)
candidateId: string,

  @Param(
  'documentId',
  new ParseUUIDPipe({
    version: '4',
  }),
)
documentId: string,

  @Body()
  dto: RejectCandidateDocumentDto,

  @CurrentUser()
  user: JwtPayload,
) {
  return this.rejectCandidateDocumentService.execute(
    candidateId,
    documentId,
    user.userId,
    dto.reason,
  );
}

// ======================================================
// Delete Candidate Document
// ======================================================

@Delete(':candidateId/documents/:documentId')
@UseGuards(JwtAuthGuard)
async deleteCandidateDocument(
  @Param(
  'candidateId',
  new ParseUUIDPipe({
    version: '4',
  }),
)
candidateId: string,

  @Param(
  'documentId',
  new ParseUUIDPipe({
    version: '4',
  }),
)
documentId: string,

  @CurrentUser()
  user: JwtPayload,
) {
  return this.deleteCandidateDocumentService.execute(
    candidateId,
    documentId,
    user.userId,
  );
}

// ======================================================
// Update Candidate Campaign
// ======================================================

@Patch(':id/campaign')
@UseGuards(JwtAuthGuard)
async updateCampaign(
  @Param(
  'id',
  new ParseUUIDPipe({
    version: '4',
  }),
)
id: string,

  @Body()
  dto: UpdateCandidateCampaignDto,

  @CurrentUser()
  user: JwtPayload,
) {
  return this.updateCandidateCampaignService.execute(
    id,
    user.userId,
    dto,
  );
}

}