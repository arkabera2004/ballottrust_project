import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';

import { Role } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import type { AuthenticatedUser } from '../../common/types';

import {
  CreateVoterRegistrationDto,
  ImportVotersDto,
  QueryVoterDto,
  RegisterVoterDto,
  RejectVoterRegistrationDto,
  UpdateVoterRegistrationDto,
} from './dto';

import { RegisterVoterService } from './services/register-voter.service';
import { CreateVoterRegistrationService } from './services/create-voter-registration.service';
import { VerifyVoterService } from './services/verify-voter.service';
import { ApproveVoterService } from './services/approve-voter.service';
import { RejectVoterService } from './services/reject-voter.service';
import { GetVoterRegistrationService } from './services/get-voter-registration.service';
import { ListVotersService } from './services/list-voters.service';
import { MyVoterRegistrationsService } from './services/my-voter-registrations.service';
import { UpdateVoterRegistrationService } from './services/update-voter-registration.service';
import { DeleteVoterRegistrationService } from './services/delete-voter-registration.service';
import { ImportVotersService } from './services/import-voters.service';
import { ExportVotersService } from './services/export-voters.service';
import { VoterRollStatsService } from './services/voter-roll-stats.service';

/** Roles permitted to administer a voter roll. */
const ROLL_ADMIN_ROLES = [
  Role.SUPER_ADMIN,
  Role.ELECTION_COMMISSIONER,
] as const;

/** Roles permitted to review registrations. */
const ROLL_REVIEW_ROLES = [
  Role.SUPER_ADMIN,
  Role.ELECTION_COMMISSIONER,
  Role.VERIFICATION_OFFICER,
] as const;

@Controller('voters')
export class VoterController {
  constructor(
    private readonly registerVoterService: RegisterVoterService,

    private readonly createVoterRegistrationService: CreateVoterRegistrationService,

    private readonly verifyVoterService: VerifyVoterService,

    private readonly approveVoterService: ApproveVoterService,

    private readonly rejectVoterService: RejectVoterService,

    private readonly getVoterRegistrationService: GetVoterRegistrationService,

    private readonly listVotersService: ListVotersService,

    private readonly myVoterRegistrationsService: MyVoterRegistrationsService,

    private readonly updateVoterRegistrationService: UpdateVoterRegistrationService,

    private readonly deleteVoterRegistrationService: DeleteVoterRegistrationService,

    private readonly importVotersService: ImportVotersService,

    private readonly exportVotersService: ExportVotersService,

    private readonly voterRollStatsService: VoterRollStatsService,
  ) {}

  // ======================================================
  // Self-Service Registration
  // ======================================================

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async register(
    @Body()
    dto: RegisterVoterDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.registerVoterService.execute(user.userId, dto);
  }

  // ======================================================
  // My Registrations
  // IMPORTANT: Must be declared before @Get(':id')
  // ======================================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async myRegistrations(
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.myVoterRegistrationsService.execute(user.userId);
  }

  // ======================================================
  // Export Voter Roll
  // IMPORTANT: Must be declared before @Get(':id')
  // ======================================================

  @Get('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLL_ADMIN_ROLES)
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async export(
    @Query()
    query: QueryVoterDto,

    @CurrentUser()
    user: AuthenticatedUser,

    @Res({ passthrough: true })
    res: Response,
  ) {
    const { csv } = await this.exportVotersService.execute(query, user.userId);

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="voter-roll.csv"',
    );

    return csv;
  }

  // ======================================================
  // Voter Roll Statistics
  // IMPORTANT: Must be declared before @Get(':id')
  // ======================================================

  @Get('stats/:electionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLL_REVIEW_ROLES)
  async stats(
    @Param('electionId', ParseUUIDPipe)
    electionId: string,
  ) {
    return this.voterRollStatsService.execute(electionId);
  }

  // ======================================================
  // Import Voter Roll
  // ======================================================

  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLL_ADMIN_ROLES)
  @UseInterceptors(
    FileInterceptor('file', {
      // Parsed in-process and never persisted, so memory storage avoids
      // leaving voter PII on disk.
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async import(
    @UploadedFile()
    file: Express.Multer.File,

    @Body()
    dto: ImportVotersDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.importVotersService.execute(file, dto, user.userId);
  }

  // ======================================================
  // List Voter Registrations
  // ======================================================

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLL_REVIEW_ROLES)
  async findAll(
    @Query()
    query: QueryVoterDto,
  ) {
    return this.listVotersService.execute(query);
  }

  // ======================================================
  // Create Registration (Admin)
  // ======================================================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLL_ADMIN_ROLES)
  async create(
    @Body()
    dto: CreateVoterRegistrationDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.createVoterRegistrationService.execute(dto, user.userId);
  }

  // ======================================================
  // Get Registration
  // ======================================================

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLL_REVIEW_ROLES)
  async findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.getVoterRegistrationService.execute(id);
  }

  // ======================================================
  // Update Registration
  // ======================================================

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLL_ADMIN_ROLES)
  async update(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: UpdateVoterRegistrationDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.updateVoterRegistrationService.execute(id, user.userId, dto);
  }

  // ======================================================
  // Verify Registration
  // ======================================================

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLL_REVIEW_ROLES)
  async verify(
    @Param('id', ParseUUIDPipe)
    id: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.verifyVoterService.execute(id, user.userId);
  }

  // ======================================================
  // Approve Registration
  // ======================================================

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLL_ADMIN_ROLES)
  async approve(
    @Param('id', ParseUUIDPipe)
    id: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.approveVoterService.execute(id, user.userId);
  }

  // ======================================================
  // Reject Registration
  // ======================================================

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLL_REVIEW_ROLES)
  async reject(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: RejectVoterRegistrationDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.rejectVoterService.execute(id, user.userId, dto);
  }

  // ======================================================
  // Remove From Roll
  // ======================================================

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLL_ADMIN_ROLES)
  async remove(
    @Param('id', ParseUUIDPipe)
    id: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.deleteVoterRegistrationService.execute(id, user.userId);
  }
}
