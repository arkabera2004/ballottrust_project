import { Injectable, NotFoundException } from '@nestjs/common';

import { VoterRegistrationRepository } from '../repository/voter-registration.repository';

@Injectable()
export class GetVoterRegistrationService {
  constructor(private readonly repository: VoterRegistrationRepository) {}

  async execute(registrationId: string) {
    const registration = await this.repository.findById(registrationId);

    if (!registration) {
      throw new NotFoundException('Voter registration not found.');
    }

    return registration;
  }
}
