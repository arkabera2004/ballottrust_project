import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';

import { CandidateType } from '@prisma/client';

export class CreateCandidateDto {
  @IsUUID()
  electionId!: string;

  @IsEnum(CandidateType)
  candidateType!: CandidateType;

  @IsOptional()
  @IsUUID()
  partyId?: string;

  // ======================================================
  // Election Position
  // ======================================================

  @IsString()
  @Length(2, 100)
  position!: string;

  // ======================================================
  // Candidate Profile
  // ======================================================

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  manifesto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  agenda?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  achievements?: string;

  // ======================================================
  // Nomination Statement
  // ======================================================

  @IsString()
  @Length(20, 5000)
  nominationStatement!: string;

  // ======================================================
  // Candidate Media / Documents
  // ======================================================

  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  photoUrl?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  documentUrl?: string;


// ======================================================
// Candidate Profile
// ======================================================

@IsOptional()
@IsString()
@MaxLength(2000)
biography?: string;

@IsOptional()
@IsString()
@MaxLength(200)
campaignSlogan?: string;

@IsOptional()
@IsUrl({
  protocols: ['http', 'https'],
  require_protocol: true,
})
@MaxLength(500)
campaignWebsite?: string;
}