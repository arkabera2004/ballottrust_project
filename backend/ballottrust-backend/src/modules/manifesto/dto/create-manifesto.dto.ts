import {
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateManifestoDto {
  @IsUUID()
  candidateId!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  summary?: string;

  /** Rich text HTML. Sanitised before it is stored. */
  @IsString()
  @MinLength(1)
  @MaxLength(100_000)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  documentUrl?: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(500)
  videoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImage?: string;
}
