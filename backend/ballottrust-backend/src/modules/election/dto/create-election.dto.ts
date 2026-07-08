import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import {
  ElectionType,
  ResultVisibility,
} from '@prisma/client';

export class CreateElectionDto {

  // ===============================
  // Basic Information
  // ===============================

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(150)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsEnum(ElectionType)
  electionType!: ElectionType;

  // ===============================
  // Timeline
  // ===============================

  @IsOptional()
  @IsDateString()
  registrationStart?: string;

  @IsOptional()
  @IsDateString()
  registrationEnd?: string;

  @IsOptional()
  @IsDateString()
  nominationStart?: string;

  @IsOptional()
  @IsDateString()
  nominationEnd?: string;

  @IsOptional()
  @IsDateString()
  campaignStart?: string;

  @IsOptional()
  @IsDateString()
  campaignEnd?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsDateString()
  resultDate?: string;

  // ===============================
  // Configuration
  // ===============================

  @IsOptional()
  @IsInt()
  @Min(0)
  candidateLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maximumVotes?: number;

  @IsOptional()
  @IsBoolean()
  allowRevote?: boolean;

  @IsOptional()
  @IsBoolean()
  blockchainEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  auditEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  autoPublish?: boolean;

  @IsOptional()
  @IsBoolean()
  autoArchive?: boolean;

  @IsOptional()
  @IsEnum(ResultVisibility)
  resultVisibility?: ResultVisibility;

  // ===============================
  // Branding
  // ===============================

  @IsOptional()
  @IsString()
  banner?: string;

  @IsOptional()
  @IsString()
  logo?: string;
}
