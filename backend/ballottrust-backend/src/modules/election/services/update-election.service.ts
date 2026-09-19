import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { Election } from '@prisma/client';

import { UpdateElectionDto } from '../dto';
import { ElectionRepository } from '../repository';
import { ElectionValidator } from '../validators';

@Injectable()
export class UpdateElectionService {
  constructor(
    private readonly repository: ElectionRepository,
    private readonly validator: ElectionValidator,
  ) {}

  async execute(id: string, dto: UpdateElectionDto): Promise<Election> {
    // ============================================
    // Step 1 - Check Election Exists
    // ============================================

    const election = await this.repository.findById(id);

    if (!election) {
      throw new NotFoundException('Election not found.');
    }

    // ============================================
    // Step 2 - Prevent Editing Published Election
    // ============================================

    if (election.status === 'PUBLISHED') {
      throw new BadRequestException('Published elections cannot be modified.');
    }

    // ============================================
    // Step 3 - Business Validation
    // ============================================

    this.validator.validateUpdate(dto);

    // ============================================
    // Step 4 - Update Election
    // ============================================

    return this.repository.update(id, {
      ...dto,

      registrationStart: dto.registrationStart
        ? new Date(dto.registrationStart)
        : undefined,

      registrationEnd: dto.registrationEnd
        ? new Date(dto.registrationEnd)
        : undefined,

      nominationStart: dto.nominationStart
        ? new Date(dto.nominationStart)
        : undefined,

      nominationEnd: dto.nominationEnd
        ? new Date(dto.nominationEnd)
        : undefined,

      campaignStart: dto.campaignStart
        ? new Date(dto.campaignStart)
        : undefined,

      campaignEnd: dto.campaignEnd ? new Date(dto.campaignEnd) : undefined,

      startDate: dto.startDate ? new Date(dto.startDate) : undefined,

      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
  }
}
