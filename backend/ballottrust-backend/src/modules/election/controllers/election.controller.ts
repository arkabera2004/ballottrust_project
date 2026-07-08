import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Role } from '@prisma/client';

import { CreateElectionDto } from '../dto';
import { CreateElectionService } from '../services';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

import type { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Controller('elections')
export class ElectionController {
  constructor(
    private readonly createElectionService: CreateElectionService,
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
}
