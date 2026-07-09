import { Injectable } from '@nestjs/common';

import { ElectionRepository } from '../repository';
import { QueryElectionDto } from '../dto';

@Injectable()
export class ListElectionsService {
  constructor(
    private readonly repository: ElectionRepository,
  ) {}

  async execute(
    query: QueryElectionDto,
  ) {
    return this.repository.findAll(query);
  }
}