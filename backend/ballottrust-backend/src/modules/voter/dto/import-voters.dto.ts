import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class ImportVotersDto {
  @IsUUID()
  electionId!: string;

  /**
   * When true the import reports what it would do without writing.
   * Recommended before committing a large roll.
   */
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  dryRun?: boolean;
}
