import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { CreateElectionDto } from '../dto/create-election.dto';

@Injectable()
export class ElectionValidator {
  validateCreate(dto: CreateElectionDto): void {
    // =====================================
    // Mandatory Timeline Validation
    // =====================================

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException(
        'Election start date must be before election end date.',
      );
    }

    // =====================================
    // Registration
    // =====================================

    if (
      dto.registrationStart &&
      dto.registrationEnd
    ) {
      const registrationStart = new Date(
        dto.registrationStart,
      );

      const registrationEnd = new Date(
        dto.registrationEnd,
      );

      if (registrationStart >= registrationEnd) {
        throw new BadRequestException(
          'Registration start must be before registration end.',
        );
      }
    }

    // =====================================
    // Nomination
    // =====================================

    if (
      dto.nominationStart &&
      dto.nominationEnd
    ) {
      const nominationStart = new Date(
        dto.nominationStart,
      );

      const nominationEnd = new Date(
        dto.nominationEnd,
      );

      if (nominationStart >= nominationEnd) {
        throw new BadRequestException(
          'Nomination start must be before nomination end.',
        );
      }
    }

    // =====================================
    // Campaign
    // =====================================

    if (
      dto.campaignStart &&
      dto.campaignEnd
    ) {
      const campaignStart = new Date(
        dto.campaignStart,
      );

      const campaignEnd = new Date(
        dto.campaignEnd,
      );

      if (campaignStart >= campaignEnd) {
        throw new BadRequestException(
          'Campaign start must be before campaign end.',
        );
      }
    }

    // =====================================
    // Maximum Votes
    // =====================================

    if (
      dto.maximumVotes &&
      dto.maximumVotes < 1
    ) {
      throw new BadRequestException(
        'Maximum votes must be at least 1.',
      );
    }
  }

  validateUpdate(dto: any): void {
  if (
    dto.startDate &&
    dto.endDate &&
    new Date(dto.startDate) >=
      new Date(dto.endDate)
  ) {
    throw new BadRequestException(
      'End date must be after start date.',
    );
  }
}
}
