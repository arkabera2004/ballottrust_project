import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';

import { Role } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import type { AuthenticatedUser } from '../../common/types';

import { GenerateReportDto, ReportFormat } from './dto';

import { GenerateReportService } from './services/generate-report.service';
import { ListReportsService } from './services/list-reports.service';

/** Reporting is an administrative and audit function. */
const REPORT_ROLES = [
  Role.SUPER_ADMIN,
  Role.ELECTION_COMMISSIONER,
  Role.AUDITOR,
] as const;

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...REPORT_ROLES)
export class ReportController {
  constructor(
    private readonly generateReportService: GenerateReportService,

    private readonly listReportsService: ListReportsService,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async generate(
    @Body()
    dto: GenerateReportDto,

    @CurrentUser()
    user: AuthenticatedUser,

    @Res({ passthrough: true })
    res: Response,
  ) {
    const report = await this.generateReportService.execute(dto, user.userId);

    if (report.format === ReportFormat.CSV) {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${dto.reportType.toLowerCase()}.csv"`,
      );

      return report.data;
    }

    return report;
  }

  @Get('election/:electionId')
  async list(
    @Param('electionId', ParseUUIDPipe)
    electionId: string,
  ) {
    return this.listReportsService.execute(electionId);
  }
}
