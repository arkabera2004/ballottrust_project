import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

import { Transform } from 'class-transformer';

import {
  VoterRegistrationSource,
  VoterRegistrationStatus,
} from '@prisma/client';

export class QueryVoterDto {
  /** Matches against voter name, email or registration number. */
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(VoterRegistrationStatus)
  status?: VoterRegistrationStatus;

  @IsOptional()
  @IsEnum(VoterRegistrationSource)
  source?: VoterRegistrationSource;

  @IsOptional()
  @IsUUID()
  electionId?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
