import { IsEnum } from 'class-validator';

import { BallotOrderMethod } from '@prisma/client';

export class GenerateBallotOrderDto {
  @IsEnum(BallotOrderMethod)
  method!: BallotOrderMethod;
}
