import {
  IsInt,
  Max,
  Min,
} from 'class-validator';

export class AssignCandidateNumberDto {
  @IsInt()
  @Min(1)
  @Max(999999)
  candidateNumber!: number;
}