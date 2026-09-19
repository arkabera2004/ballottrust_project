import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

import { ConfigController } from './config.controller';

import { SystemConfigRepository } from './repository/system-config.repository';

import { GetConfigService } from './services/get-config.service';
import { ListConfigService } from './services/list-config.service';
import { UpsertConfigService } from './services/upsert-config.service';
import { DeleteConfigService } from './services/delete-config.service';

/**
 * Named SystemConfigModule to avoid colliding with @nestjs/config's
 * ConfigModule, which supplies environment variables. This one manages
 * database-backed platform settings that administrators can change at
 * runtime.
 */
@Module({
  imports: [PrismaModule, AuditModule],

  controllers: [ConfigController],

  providers: [
    SystemConfigRepository,
    GetConfigService,
    ListConfigService,
    UpsertConfigService,
    DeleteConfigService,
  ],

  exports: [GetConfigService],
})
export class SystemConfigModule {}
