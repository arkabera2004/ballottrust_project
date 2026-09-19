import { Injectable } from '@nestjs/common';

import { ElectionRepository } from '../repository';
import { QueryElectionDto } from '../dto/query-election.dto';

@Injectable()
export class GetElectionService {
  constructor(private readonly repository: ElectionRepository) {}

  async getAll(filter: QueryElectionDto) {
    return this.repository.findAll(filter);
  }
}
