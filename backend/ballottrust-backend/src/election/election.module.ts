import { Module } from '@nestjs/common';
import { ElectionController } from './election.controller';
import { ElectionService } from './election.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ElectionController],
  providers: [ElectionService],
})
export class ElectionModule {}