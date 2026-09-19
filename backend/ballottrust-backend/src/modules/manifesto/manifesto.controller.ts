import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { Role } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import type { AuthenticatedUser } from '../../common/types';

import {
  CreateManifestoDto,
  QueryManifestoDto,
  RejectManifestoDto,
  UpdateManifestoDto,
} from './dto';

import { CreateManifestoService } from './services/create-manifesto.service';
import { UpdateManifestoService } from './services/update-manifesto.service';
import { SubmitManifestoService } from './services/submit-manifesto.service';
import { ApproveManifestoService } from './services/approve-manifesto.service';
import { RejectManifestoService } from './services/reject-manifesto.service';
import { GetManifestoService } from './services/get-manifesto.service';
import { ListManifestosService } from './services/list-manifestos.service';
import { GetCandidateManifestoService } from './services/get-candidate-manifesto.service';
import { ListManifestoVersionsService } from './services/list-manifesto-versions.service';
import { DeleteManifestoService } from './services/delete-manifesto.service';

/** Roles that may review a manifesto on a candidate's behalf. */
const REVIEW_ROLES = [
  Role.SUPER_ADMIN,
  Role.ELECTION_COMMISSIONER,
  Role.VERIFICATION_OFFICER,
] as const;

/** Roles that bypass the "own candidate only" ownership check. */
const ADMIN_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  Role.ELECTION_COMMISSIONER,
  Role.VERIFICATION_OFFICER,
];

const isAdmin = (user: AuthenticatedUser) => ADMIN_ROLES.includes(user.role);

@Controller('manifestos')
export class ManifestoController {
  constructor(
    private readonly createManifestoService: CreateManifestoService,

    private readonly updateManifestoService: UpdateManifestoService,

    private readonly submitManifestoService: SubmitManifestoService,

    private readonly approveManifestoService: ApproveManifestoService,

    private readonly rejectManifestoService: RejectManifestoService,

    private readonly getManifestoService: GetManifestoService,

    private readonly listManifestosService: ListManifestosService,

    private readonly getCandidateManifestoService: GetCandidateManifestoService,

    private readonly listManifestoVersionsService: ListManifestoVersionsService,

    private readonly deleteManifestoService: DeleteManifestoService,
  ) {}

  // ======================================================
  // Public: Published Manifesto For A Candidate
  // IMPORTANT: Must be declared before @Get(':id')
  // ======================================================

  @Get('public/candidate/:candidateId')
  async getPublicCandidateManifesto(
    @Param('candidateId', ParseUUIDPipe)
    candidateId: string,
  ) {
    return this.getCandidateManifestoService.execute(candidateId, true);
  }

  // ======================================================
  // Candidate's Current Manifesto
  // ======================================================

  @Get('candidate/:candidateId')
  @UseGuards(JwtAuthGuard)
  async getCandidateManifesto(
    @Param('candidateId', ParseUUIDPipe)
    candidateId: string,
  ) {
    return this.getCandidateManifestoService.execute(candidateId);
  }

  // ======================================================
  // Version History
  // ======================================================

  @Get('candidate/:candidateId/versions')
  @UseGuards(JwtAuthGuard)
  async getVersions(
    @Param('candidateId', ParseUUIDPipe)
    candidateId: string,
  ) {
    return this.listManifestoVersionsService.execute(candidateId);
  }

  // ======================================================
  // List Manifestos
  // ======================================================

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...REVIEW_ROLES)
  async findAll(
    @Query()
    query: QueryManifestoDto,
  ) {
    return this.listManifestosService.execute(query);
  }

  // ======================================================
  // Create Manifesto Version
  // ======================================================

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body()
    dto: CreateManifestoDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.createManifestoService.execute(dto, user.userId, isAdmin(user));
  }

  // ======================================================
  // Get Manifesto
  // ======================================================

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.getManifestoService.execute(id);
  }

  // ======================================================
  // Update Draft Manifesto
  // ======================================================

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: UpdateManifestoDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.updateManifestoService.execute(
      id,
      dto,
      user.userId,
      isAdmin(user),
    );
  }

  // ======================================================
  // Submit For Review
  // ======================================================

  @Patch(':id/submit')
  @UseGuards(JwtAuthGuard)
  async submit(
    @Param('id', ParseUUIDPipe)
    id: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.submitManifestoService.execute(id, user.userId, isAdmin(user));
  }

  // ======================================================
  // Approve Manifesto
  // ======================================================

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...REVIEW_ROLES)
  async approve(
    @Param('id', ParseUUIDPipe)
    id: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.approveManifestoService.execute(id, user.userId);
  }

  // ======================================================
  // Reject Manifesto
  // ======================================================

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...REVIEW_ROLES)
  async reject(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: RejectManifestoDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.rejectManifestoService.execute(id, user.userId, dto);
  }

  // ======================================================
  // Delete Draft Manifesto
  // ======================================================

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseUUIDPipe)
    id: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.deleteManifestoService.execute(id, user.userId, isAdmin(user));
  }
}
