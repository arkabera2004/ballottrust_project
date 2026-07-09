import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';

import {
  ElectionStatus,
  ElectionType,
} from '@prisma/client';

export class QueryElectionDto {

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ElectionStatus)
  status?: ElectionStatus;

  @IsOptional()
  @IsEnum(ElectionType)
  type?: ElectionType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 10;

}