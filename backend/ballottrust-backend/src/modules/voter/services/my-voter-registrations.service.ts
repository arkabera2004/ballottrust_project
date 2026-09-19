import { Injectable } from '@nestjs/common';

import { VoterRegistrationRepository } from '../repository/voter-registration.repository';

/** Every election the signed-in voter has registered for. */
@Injectable()
export class MyVoterRegistrationsService {
  constructor(private readonly repository: VoterRegistrationRepository) {}

  async execute(userId: string) {
    const { items, total } = await this.repository.findMany(
      { userId },
      0,
      // A voter's own registrations are a short list; no pagination needed.
      100,
    );

    return { items, total };
  }
}
