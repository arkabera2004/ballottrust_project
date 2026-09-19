import { PartialType, OmitType } from '@nestjs/mapped-types';

import { CreateManifestoDto } from './create-manifesto.dto';

/** The candidate a manifesto belongs to is fixed at creation. */
export class UpdateManifestoDto extends PartialType(
  OmitType(CreateManifestoDto, ['candidateId'] as const),
) {}
