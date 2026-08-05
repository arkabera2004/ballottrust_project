import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RejectCandidateDocumentDto {

  @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(500)
    reason!: string;
}