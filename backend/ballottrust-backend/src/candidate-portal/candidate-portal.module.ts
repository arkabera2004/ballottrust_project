import { Module } from '@nestjs/common';

import { CandidatePortalController }
from './candidate-portal.controller';

import { CandidatePortalService }
from './candidate-portal.service';

import { PrismaModule }
from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],

  controllers: [
    CandidatePortalController,
  ],

  providers: [
    CandidatePortalService,
  ],
})
export class CandidatePortalModule {}