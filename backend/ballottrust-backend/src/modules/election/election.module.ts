import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { ElectionCodeGenerator } from '../../common/utils';

import { ElectionController } from './controllers';

import { ElectionRepository } from './repository';

import { ElectionValidator } from './validators';

import { CreateElectionService } from './services';

@Module({
  imports: [
    PrismaModule,
  ],

  controllers: [
    ElectionController,
  ],

  providers: [
    ElectionRepository,
    ElectionValidator,
    ElectionCodeGenerator,
    CreateElectionService,
  ],

  exports: [
    ElectionRepository,
    CreateElectionService,
  ],
})
export class ElectionModule {}
