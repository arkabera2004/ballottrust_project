import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateVoterRegistrationDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
