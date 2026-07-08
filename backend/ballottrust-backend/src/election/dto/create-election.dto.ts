import { IsDateString, IsString } from 'class-validator';

export class CreateElectionDto {

  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}