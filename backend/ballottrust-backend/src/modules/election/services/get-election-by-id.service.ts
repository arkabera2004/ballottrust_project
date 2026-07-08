import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ElectionRepository } from '../repository';

@Injectable()
export class GetElectionByIdService {
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

    return election;
  }
}