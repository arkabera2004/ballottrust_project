import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Role } from '@prisma/client';

import { DefineEligibilityRulesService } from './services/define-eligibility-rules.service';
import { GetActiveEligibilityRulesService } from './services/get-active-eligibility-rules.service';
import { ListEligibilityRuleVersionsService } from './services/list-eligibility-rule-versions.service';
import { CheckVoterEligibilityService } from './services/check-voter-eligibility.service';
import { BulkCheckEligibilityService } from './services/bulk-check-eligibility.service';
import { DefineEligibilityRulesDto } from './dto/define-eligibility-rules.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('elections/:electionId/eligibility')
export class EligibilityController {
  constructor(
    private readonly defineEligibilityRulesService: DefineEligibilityRulesService,
    private readonly getActiveEligibilityRulesService: GetActiveEligibilityRulesService,
    private readonly listEligibilityRuleVersionsService: ListEligibilityRuleVersionsService,
    private readonly checkVoterEligibilityService: CheckVoterEligibilityService,
    private readonly bulkCheckEligibilityService: BulkCheckEligibilityService,
  ) {}

  // ======================================================
  // Define Eligibility Rules (creates a new version)
  // ======================================================

  @Post('rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ELECTION_COMMISSIONER)
  async defineRules(
    @Param('electionId') electionId: string,
    @Body() dto: DefineEligibilityRulesDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.defineEligibilityRulesService.execute(
      electionId,
      dto,
      user.userId,
    );
  }

  // ======================================================
  // Get Active Rules (or the implicit default)
  // ======================================================

  @Get('rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.SUPER_ADMIN,
    Role.ELECTION_COMMISSIONER,
    Role.AUDITOR,
  )
  async getActiveRules(
    @Param('electionId') electionId: string,
  ) {
    return this.getActiveEligibilityRulesService.execute(
      electionId,
    );
  }

  // ======================================================
  // List Rule Version History
  // ======================================================

  @Get('rules/versions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.SUPER_ADMIN,
    Role.ELECTION_COMMISSIONER,
    Role.AUDITOR,
  )
  async listVersions(
    @Param('electionId') electionId: string,
  ) {
    return this.listEligibilityRuleVersionsService.execute(
      electionId,
    );
  }

  // ======================================================
  // Check My Own Eligibility (any authenticated voter)
  // ======================================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async checkMine(
    @Param('electionId') electionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.checkVoterEligibilityService.execute(
      user.userId,
      electionId,
    );
  }

  // ======================================================
  // Check a Specific Voter's Eligibility (admin/auditor)
  // ======================================================

  @Get('check/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.SUPER_ADMIN,
    Role.ELECTION_COMMISSIONER,
    Role.AUDITOR,
  )
  async checkOne(
    @Param('electionId') electionId: string,
    @Param('userId') userId: string,
  ) {
    return this.checkVoterEligibilityService.execute(
      userId,
      electionId,
    );
  }

  // ======================================================
  // Bulk-check Every Voter (admin preview before voting opens)
  // ======================================================

  @Get('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ELECTION_COMMISSIONER)
  async checkBulk(
    @Param('electionId') electionId: string,
  ) {
    return this.bulkCheckEligibilityService.execute(
      electionId,
    );
  }
}
