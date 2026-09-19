import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ConfigCategory, ConfigValueType } from '@prisma/client';

export class UpsertConfigDto {
  /** Dotted lowercase key, e.g. security.password.min_length. */
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)*$/, {
    message:
      'key must be lowercase dotted notation, e.g. security.password.min_length',
  })
  key!: string;

  @IsString()
  @MaxLength(10_000)
  value!: string;

  @IsOptional()
  @IsEnum(ConfigValueType)
  valueType?: ConfigValueType;

  @IsOptional()
  @IsEnum(ConfigCategory)
  category?: ConfigCategory;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isSecret?: boolean;
}
