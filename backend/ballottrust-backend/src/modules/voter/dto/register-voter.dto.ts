import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class RegisterVoterDto {
  @IsUUID()
  electionId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
