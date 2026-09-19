import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import { WorkflowTaskPriority } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  /** Owning module, e.g. "candidate" or "voter". */
  @IsString()
  @MaxLength(50)
  module!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  entityType?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsUUID()
  assignedToId!: string;

  @IsOptional()
  @IsEnum(WorkflowTaskPriority)
  priority?: WorkflowTaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsUUID()
  electionId?: string;
}
