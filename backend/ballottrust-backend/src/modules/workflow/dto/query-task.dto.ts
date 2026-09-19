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

import { WorkflowTaskPriority, WorkflowTaskStatus } from '@prisma/client';

export class QueryTaskDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(WorkflowTaskStatus)
  status?: WorkflowTaskStatus;

  @IsOptional()
  @IsEnum(WorkflowTaskPriority)
  priority?: WorkflowTaskPriority;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsUUID()
  electionId?: string;

  @IsOptional()
  @IsString()
  module?: string;

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
  limit: number = 20;
}
