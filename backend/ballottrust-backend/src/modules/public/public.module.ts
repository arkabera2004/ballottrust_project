import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { PublicController } from './public.controller';

import { ListPublicElectionsService } from './services/list-public-elections.service';
import { GetPublicElectionService } from './services/get-public-election.service';
import { ListPublicCandidatesService } from './services/list-public-candidates.service';
import { GetPublicCandidateService } from './services/get-public-candidate.service';
import { GetPublicResultsService } from './services/get-public-results.service';
import { GetPublicStatisticsService } from './services/get-public-statistics.service';
import { VerifyReceiptService } from './services/verify-receipt.service';

@Module({
  imports: [PrismaModule],

  controllers: [PublicController],

  providers: [
    ListPublicElectionsService,
    GetPublicElectionService,
    ListPublicCandidatesService,
    GetPublicCandidateService,
    GetPublicResultsService,
    GetPublicStatisticsService,
    VerifyReceiptService,
  ],
})
export class PublicModule {}
