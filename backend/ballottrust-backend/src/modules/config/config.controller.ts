import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { Role } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import type { AuthenticatedUser } from '../../common/types';

import { QueryConfigDto, UpsertConfigDto } from './dto';

import { GetConfigService } from './services/get-config.service';
import { ListConfigService } from './services/list-config.service';
import { UpsertConfigService } from './services/upsert-config.service';
import { DeleteConfigService } from './services/delete-config.service';

/**
 * docs/07 §16: "Configuration changes require administrator privileges."
 * Platform settings are Super Administrator territory only — an Election
 * Commissioner administers elections, not the platform.
 */
@Controller('config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class ConfigController {
  constructor(
    private readonly getConfigService: GetConfigService,

    private readonly listConfigService: ListConfigService,

    private readonly upsertConfigService: UpsertConfigService,

    private readonly deleteConfigService: DeleteConfigService,
  ) {}

  @Get()
  async findAll(
    @Query()
    query: QueryConfigDto,
  ) {
    return this.listConfigService.execute(query);
  }

  @Get(':key')
  async findOne(
    @Param('key')
    key: string,
  ) {
    return this.getConfigService.execute(key);
  }

  /** Idempotent create-or-overwrite, hence PUT rather than POST. */
  @Put()
  async upsert(
    @Body()
    dto: UpsertConfigDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.upsertConfigService.execute(dto, user.userId);
  }

  @Delete(':key')
  async remove(
    @Param('key')
    key: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.deleteConfigService.execute(key, user.userId);
  }
}
