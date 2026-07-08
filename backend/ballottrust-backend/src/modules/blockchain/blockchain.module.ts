import { Module } from '@nestjs/common';

import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BlockchainController],
  providers: [BlockchainService],
})
export class BlockchainModule {}
