import { Injectable } from '@nestjs/common';

import { ManifestoRepository } from '../repository/manifesto.repository';

/** Full version history for a candidate (docs/07 §7: Version History). */
@Injectable()
export class ListManifestoVersionsService {
  constructor(private readonly repository: ManifestoRepository) {}

  async execute(candidateId: string) {
    const versions = await this.repository.findVersions(candidateId);

    return { items: versions, total: versions.length };
  }
}
