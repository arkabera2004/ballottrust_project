import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCandidateProfileDto {
  // ======================================================
  // Candidate Biography
  // ======================================================

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  biography?: string;
}
