import { Injectable } from '@nestjs/common';

import { ElectionRepository } from '../repository';

@Injectable()
export class GetElectionService {
  constructor(
    private readonly repository: ElectionRepository,
  ) {}

  async getAll(filter?: any) {
    return this.repository.findAll(filter);
  }
}