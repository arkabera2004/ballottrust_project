import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CompleteTaskDto {
  /** What was decided, recorded alongside reviewer and timestamp. */
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  outcome?: string;
}
