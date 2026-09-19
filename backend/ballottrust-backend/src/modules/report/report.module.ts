import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

import { ReportController } from './report.controller';

import { BuildReportService } from './services/build-report.service';
import { GenerateReportService } from './services/generate-report.service';
import { ListReportsService } from './services/list-reports.service';

@Module({
  imports: [PrismaModule, AuditModule],

  controllers: [ReportController],

  providers: [BuildReportService, GenerateReportService, ListReportsService],

  exports: [BuildReportService],
})
export class ReportModule {}
