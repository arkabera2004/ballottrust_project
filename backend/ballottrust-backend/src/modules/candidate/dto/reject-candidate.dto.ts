import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class RejectCandidateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}