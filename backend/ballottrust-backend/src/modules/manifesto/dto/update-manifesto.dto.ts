// Sourced from @nestjs/swagger rather than @nestjs/mapped-types: swagger is
// already a dependency, ships CommonJS (mapped-types is ESM-only, which broke
// the Jest e2e runner), and carries the inherited fields into the generated
// API docs served at /api/docs.
import { PartialType, OmitType } from '@nestjs/swagger';

import { CreateManifestoDto } from './create-manifesto.dto';

/** The candidate a manifesto belongs to is fixed at creation. */
export class UpdateManifestoDto extends PartialType(
  OmitType(CreateManifestoDto, ['candidateId'] as const),
) {}
