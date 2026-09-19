import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EscalateTaskDto {
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  note!: string;

  /** Optionally reassign as part of the escalation. */
  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
