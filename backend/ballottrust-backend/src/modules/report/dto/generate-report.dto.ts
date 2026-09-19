import { IsEnum, IsOptional, IsUUID } from 'class-validator';

/** Report kinds the platform can produce. */
export enum ReportType {
  ELECTION_SUMMARY = 'ELECTION_SUMMARY',
  TURNOUT = 'TURNOUT',
  CANDIDATE_RESULTS = 'CANDIDATE_RESULTS',
  VOTER_ROLL = 'VOTER_ROLL',
  AUDIT_TRAIL = 'AUDIT_TRAIL',
}

export enum ReportFormat {
  JSON = 'JSON',
  CSV = 'CSV',
}

export class GenerateReportDto {
  @IsUUID()
  electionId!: string;

  @IsEnum(ReportType)
  reportType!: ReportType;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;
}
