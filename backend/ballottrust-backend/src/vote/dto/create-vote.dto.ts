import { IsString } from 'class-validator';

export class CreateVoteDto {
  @IsString()
  candidateId!: string;

  @IsString()
  electionId!: string;
}