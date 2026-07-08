import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { ElectionRepository } from '../repository';

@Injectable()
export class DeleteElectionService {
  constructor(
    private readonly repository: ElectionRepository,
  ) {}

  async execute(id: string) {
    const election =
      await this.repository.findById(id);

    if (!election || election.deletedAt) {
      throw new NotFoundException(
        'Election not found.',
      );
    }

    if (election.status === 'ACTIVE') {
      throw new BadRequestException(
        'Active elections cannot be deleted.',
      );
    }

    return this.repository.softDelete(id);
  }
}