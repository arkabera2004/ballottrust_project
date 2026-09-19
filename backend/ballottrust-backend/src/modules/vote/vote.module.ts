import { Module } from '@nestjs/common';

import { VoteController } from './vote.controller';
import { VoteService } from './vote.service';

import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { EligibilityModule } from '../eligibility/eligibility.module';

@Module({
  imports: [PrismaModule, AuditModule, EligibilityModule],
  controllers: [VoteController],
  providers: [VoteService],
})
export class VoteModule {}
