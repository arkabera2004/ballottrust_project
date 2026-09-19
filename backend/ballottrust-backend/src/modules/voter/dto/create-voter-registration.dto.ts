import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/** Admin-initiated registration on a voter's behalf. */
export class CreateVoterRegistrationDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  electionId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
