import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';

import {
  CandidateType,
} from '@prisma/client';

export class UpdateCandidateDto {
  // ======================================================
  // Candidate Type / Party
  // ======================================================

  @IsOptional()
  @IsEnum(CandidateType)
  candidateType?: CandidateType;

  @IsOptional()
  @IsUUID()
  partyId?: string;

  // ======================================================
  // Election Position
  // ======================================================

  @IsOptional()
  @IsString()
  @Length(2, 100)
  position?: string;

  // ======================================================
  // Manifesto / Campaign Content
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

  @IsOptional()
  @IsString()
  @Length(20, 5000)
  nominationStatement?: string;

  // ======================================================
  // Candidate Media / Documents
  // ======================================================

  @IsOptional()
@IsUrl({
  protocols: ['http', 'https'],
  require_protocol: true,
})
photoUrl?: string;

@IsOptional()
@IsUrl({
  protocols: ['http', 'https'],
  require_protocol: true,
})
documentUrl?: string;
}