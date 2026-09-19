import { IsEnum, IsOptional } from 'class-validator';

import { ConfigCategory } from '@prisma/client';

export class QueryConfigDto {
  @IsOptional()
  @IsEnum(ConfigCategory)
  category?: ConfigCategory;
}
