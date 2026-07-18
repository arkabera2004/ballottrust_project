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

import { CreateElectionDto, QueryElectionDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

import type { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import {UpdateElectionDto} from '../dto';
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
  StartElectionService,
  CloseElectionService,
  PublishResultsService,
  ArchiveElectionService,
} from '../services';


@Controller('elections')
export class ElectionController {
  constructor(
  private readonly createElectionService: CreateElectionService,
  private readonly updateElectionService: UpdateElectionService,
  private readonly getElectionService: GetElectionService,
  private readonly getElectionByIdService: GetElectionByIdService,
  private readonly deleteElectionService: DeleteElectionService,
  private readonly submitElectionForApprovalService: SubmitElectionForApprovalService,
  private readonly approveElectionService: ApproveElectionService,
  private readonly publishElectionService: PublishElectionService,
  private readonly startElectionService: StartElectionService,
  private readonly closeElectionService: CloseElectionService,
  private readonly publishResultsService: PublishResultsService,
  private readonly archiveElectionService: ArchiveElectionService,
  private readonly listElectionsService: ListElectionsService,
) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.SUPER_ADMIN,
    Role.ELECTION_COMMISSIONER,
  )
  async create(
    @Body() dto: CreateElectionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.createElectionService.execute(
      dto,
      user.id,
    );
  }

  @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ELECTION_COMMISSIONER', 'SUPER_ADMIN')
    updateElection(
      @Param('id') id: string,

      @Body()
      dto: UpdateElectionDto,
    ) {
      return this.updateElectionService.execute(
        id,
        dto,
      );
    }

   @Get()
    @UseGuards(JwtAuthGuard)
    findAll(
      @Query()
      query: QueryElectionDto,
    ) {
      return this.listElectionsService.execute(
        query,
      );
    }

    @Get(':id')
      @UseGuards(JwtAuthGuard)
      async findOne(
        @Param('id') id: string,
      ) {
        return this.getElectionByIdService.execute(
          id,
        );
      }

      @Delete(':id')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(
        Role.SUPER_ADMIN,
        Role.ELECTION_COMMISSIONER,
      )
      async delete(
        @Param('id') id: string,
      ) {
        return this.deleteElectionService.execute(
          id,
        );
      }

      @Patch(':id/submit')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(
        Role.ELECTION_COMMISSIONER,
        Role.SUPER_ADMIN,
      )
      async submitForApproval(
        @Param('id') id: string,
      ) {
        return this.submitElectionForApprovalService.execute(
          id,
        );
      }

      @Patch(':id/approve')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.SUPER_ADMIN)
      async approve(
        @Param('id') id: string,
        @CurrentUser() user: JwtPayload,
      ) {
        return this.approveElectionService.execute(
          id,
          user.id,
        );
      }

      @Patch(':id/publish')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(
        Role.ELECTION_COMMISSIONER,
        Role.SUPER_ADMIN,
      )
      async publish(
        @Param('id') id: string,
        @CurrentUser() user: JwtPayload,
      ) {
        return this.publishElectionService.execute(
          id,
          user.id,
        );
      }

      @Patch(':id/start')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(
        Role.ELECTION_COMMISSIONER,
        Role.SUPER_ADMIN,
      )
      async start(
        @Param('id') id: string,
      ) {
        return this.startElectionService.execute(
          id,
        );
      }

      @Patch(':id/close')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(
        Role.ELECTION_COMMISSIONER,
        Role.SUPER_ADMIN,
      )
      async close(
        @Param('id') id: string,
      ) {
        return this.closeElectionService.execute(
          id,
        );
      }


      @Patch(':id/publish-results')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(
        Role.ELECTION_COMMISSIONER,
        Role.SUPER_ADMIN,
      )
      async publishResults(
        @Param('id') id: string,
      ) {
        return this.publishResultsService.execute(
          id,
        );
      }

      @Patch(':id/archive')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(
        Role.ELECTION_COMMISSIONER,
        Role.SUPER_ADMIN,
      )
      async archive(
        @Param('id') id: string,
      ) {
        return this.archiveElectionService.execute(
          id,
        );
      }
}
