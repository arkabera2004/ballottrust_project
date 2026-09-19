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

import { CandidateStatus, CandidateType } from '@prisma/client';

export class QueryCandidateDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(CandidateStatus)
  status?: CandidateStatus;

  @IsOptional()
  @IsEnum(CandidateType)
  type?: CandidateType;

  @IsOptional()
  @IsUUID()
  electionId?: string;

  @IsOptional()
  @IsUUID()
  partyId?: string;

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
