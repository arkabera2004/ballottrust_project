import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { Role } from '@prisma/client';

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
  @UseGuards(JwtAuthGuard)
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
    @Param('id')
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
    @Param('id')
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
    @Param('id')
    id: string,

    @Body()
    dto: RejectCandidateDto,
  ) {
    return this.rejectCandidateService.execute(
      id,
      dto.reason,
    );
  }

  // ======================================================
// Withdraw Candidacy
// ======================================================

@Patch(':id/withdraw')
@UseGuards(JwtAuthGuard)
async withdraw(
  @Param('id')
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
  @Param('id')
  id: string,

  @Body()
  dto: DisqualifyCandidateDto,
) {
  return this.disqualifyCandidateService.execute(
    id,
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
    @Param('id')
    id: string,
  ) {
    return this.getCandidateService.execute(
      id,
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
  @Param('id')
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
  @Param('id')
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
@Roles(
  Role.SUPER_ADMIN,
  Role.ELECTION_COMMISSIONER,
)
async generateBallotOrder(
  @Param('electionId')
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
@Roles(
  Role.SUPER_ADMIN,
  Role.ELECTION_COMMISSIONER,
)
async manualBallotOrder(
  @Param('electionId')
  electionId: string,

  @Body()
  dto: ManualBallotOrderDto,
) {
  return this.manualBallotOrderService.execute(
    electionId,
    dto.candidateIds,
  );
}
}