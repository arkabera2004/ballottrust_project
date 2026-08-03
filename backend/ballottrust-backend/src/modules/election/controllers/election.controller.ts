import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import { Role } from '@prisma/client';

import {
  CreateElectionDto,
  QueryElectionDto,
  UpdateElectionDto,
} from '../dto';

import {
  CreateElectionService,
  UpdateElectionService,
  GetElectionService,
  GetElectionByIdService,
  ListElectionsService,
  DeleteElectionService,
  SubmitElectionForApprovalService,
  ApproveElectionService,
  PublishElectionService,
} from '../services';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

import type { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Controller('elections')
export class ElectionController {
  constructor(
    private readonly createElectionService:
      CreateElectionService,

    private readonly updateElectionService:
      UpdateElectionService,

    private readonly getElectionService:
      GetElectionService,

    private readonly getElectionByIdService:
      GetElectionByIdService,

    private readonly deleteElectionService:
      DeleteElectionService,

    private readonly submitElectionForApprovalService:
      SubmitElectionForApprovalService,

    private readonly approveElectionService:
      ApproveElectionService,

    private readonly publishElectionService:
      PublishElectionService,

    private readonly listElectionsService:
      ListElectionsService,
  ) {}

  // ======================================================
  // Create Election
  // ======================================================

  @Post()
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    Role.SUPER_ADMIN,
    Role.ELECTION_COMMISSIONER,
  )
  async create(
    @Body()
    dto: CreateElectionDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.createElectionService.execute(
      dto,
      user.userId,
    );
  }

  // ======================================================
  // Update Election
  // ======================================================

  @Patch(':id')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    Role.ELECTION_COMMISSIONER,
    Role.SUPER_ADMIN,
  )
  async updateElection(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateElectionDto,
  ) {
    return this.updateElectionService.execute(
      id,
      dto,
    );
  }

  // ======================================================
  // List Elections
  // ======================================================

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query()
    query: QueryElectionDto,
  ) {
    return this.listElectionsService.execute(
      query,
    );
  }

  // ======================================================
  // Get Election By ID
  // ======================================================

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id')
    id: string,
  ) {
    return this.getElectionByIdService.execute(
      id,
    );
  }

  // ======================================================
  // Delete Election
  // ======================================================

  @Delete(':id')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    Role.SUPER_ADMIN,
    Role.ELECTION_COMMISSIONER,
  )
  async delete(
    @Param('id')
    id: string,
  ) {
    return this.deleteElectionService.execute(
      id,
    );
  }

  // ======================================================
  // Submit Election For Approval
  // ======================================================

  @Patch(':id/submit')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    Role.ELECTION_COMMISSIONER,
    Role.SUPER_ADMIN,
  )
  async submitForApproval(
    @Param('id')
    id: string,
  ) {
    return this.submitElectionForApprovalService.execute(
      id,
    );
  }

  // ======================================================
  // Approve Election
  // ======================================================

  @Patch(':id/approve')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(Role.SUPER_ADMIN)
  async approve(
    @Param('id')
    id: string,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.approveElectionService.execute(
      id,
      user.userId,
    );
  }

  // ======================================================
  // Publish Election
  // ======================================================

  @Patch(':id/publish')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    Role.ELECTION_COMMISSIONER,
    Role.SUPER_ADMIN,
  )
  async publish(
    @Param('id')
    id: string,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.publishElectionService.execute(
      id,
      user.userId,
    );
  }
}