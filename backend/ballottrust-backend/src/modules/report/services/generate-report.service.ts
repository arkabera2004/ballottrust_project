import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { BuildReportService } from './build-report.service';
import { GenerateReportDto, ReportFormat } from '../dto';

/**
 * Builds a report and records it against the election.
 *
 * The ElectionReport row is a record that a report was produced, by whom
 * and when — the content itself is returned to the caller rather than
 * persisted, so a report never becomes a stale copy of results that have
 * since been corrected.
 */
@Injectable()
export class GenerateReportService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly buildReportService: BuildReportService,

    private readonly auditService: AuditService,
  ) {}

  async execute(dto: GenerateReportDto, generatedById: string) {
    const format = dto.format ?? ReportFormat.JSON;

    const report = await this.buildReportService.execute(
      dto.electionId,
      dto.reportType,
      format,
    );

    const record = await this.prisma.electionReport.create({
      data: {
        electionId: dto.electionId,
        reportName: `${dto.reportType} (${format})`,
        reportType: dto.reportType,
        format,
        status: 'GENERATED',
        generatedById,
      },
    });

    await this.auditService.log({
      userId: generatedById,
      action: 'REPORT_GENERATED',
      module: 'report',
      entityType: 'ElectionReport',
      entityId: record.id,
      result: 'SUCCESS',
      metadata: {
        electionId: dto.electionId,
        reportType: dto.reportType,
        format,
        rowCount: report.rowCount,
      },
    });

    return { id: record.id, ...report };
  }
}
