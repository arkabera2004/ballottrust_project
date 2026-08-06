import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateCandidateCampaignDto {
  // ======================================================
  // Campaign Slogan
  // ======================================================

  @IsOptional()
  @IsString()
  @MaxLength(200)
  campaignSlogan?: string;

  // ======================================================
  // Campaign Website
  // ======================================================

  @IsOptional()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  @MaxLength(500)
  campaignWebsite?: string;
}