import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ElectionType, ResultVisibility } from '@prisma/client';

export class UpdateElectionDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(ElectionType)
  electionType?: ElectionType;

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

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  candidateLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
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

  @IsOptional()
  @IsString()
  banner?: string;

  @IsOptional()
  @IsString()
  logo?: string;
}
