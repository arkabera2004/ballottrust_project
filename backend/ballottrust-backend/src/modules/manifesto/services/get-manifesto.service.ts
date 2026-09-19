import { Injectable, NotFoundException } from '@nestjs/common';

import { ManifestoRepository } from '../repository/manifesto.repository';

@Injectable()
export class GetManifestoService {
  constructor(private readonly repository: ManifestoRepository) {}

  async execute(id: string) {
    const manifesto = await this.repository.findById(id);

    if (!manifesto) {
      throw new NotFoundException('Manifesto not found.');
    }

    return manifesto;
  }
}
