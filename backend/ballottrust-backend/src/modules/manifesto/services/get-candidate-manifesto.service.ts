import { Injectable, NotFoundException } from '@nestjs/common';

import { ManifestoRepository } from '../repository/manifesto.repository';

/**
 * The manifesto for a candidate.
 *
 * `publicOnly` selects the highest APPROVED version, which is what the
 * public portal serves; otherwise the highest version of any status is
 * returned for the candidate's own editing view.
 */
@Injectable()
export class GetCandidateManifestoService {
  constructor(private readonly repository: ManifestoRepository) {}

  async execute(candidateId: string, publicOnly = false) {
    const manifesto = publicOnly
      ? await this.repository.findPublished(candidateId)
      : await this.repository.findCurrent(candidateId);

    if (!manifesto) {
      throw new NotFoundException(
        publicOnly
          ? 'This candidate has no published manifesto.'
          : 'This candidate has no manifesto.',
      );
    }

    return manifesto;
  }
}
