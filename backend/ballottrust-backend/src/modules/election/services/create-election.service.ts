import { ConflictException, Injectable } from '@nestjs/common';

import { Election } from '@prisma/client';

import { CreateElectionDto } from '../dto';
import { ElectionRepository } from '../repository';
import { ElectionValidator } from '../validators';

import { ElectionCodeGenerator } from '../../../common/utils';

@Injectable()
export class CreateElectionService {
  constructor(
    private readonly repository: ElectionRepository,
    private readonly validator: ElectionValidator,
    private readonly codeGenerator: ElectionCodeGenerator,
  ) {}

  async execute(
    dto: CreateElectionDto,
    createdById?: string,
  ): Promise<Election> {
    // =====================================================
    // Step 1 - Validate Business Rules
    // =====================================================

    this.validator.validateCreate(dto);

    // =====================================================
    // Step 2 - Generate Election Code
    // =====================================================

    const totalElections = await this.repository.count();

    const electionCode = this.codeGenerator.generate(
      dto.electionType,
      totalElections + 1,
    );

    // =====================================================
    // Step 3 - Ensure Election Code is Unique
    // =====================================================

    const exists = await this.repository.electionCodeExists(electionCode);

    if (exists) {
      throw new ConflictException('Election code already exists.');
    }

    // =====================================================
    // Step 4 - Persist Election
    // =====================================================

    const election = await this.repository.create({
      title: dto.title,

      description: dto.description,

      electionCode,

      electionType: dto.electionType,

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

      startDate: new Date(dto.startDate),

      endDate: new Date(dto.endDate),

      resultDate: dto.resultDate ? new Date(dto.resultDate) : undefined,

      candidateLimit: dto.candidateLimit,

      maximumVotes: dto.maximumVotes,

      allowRevote: dto.allowRevote,

      blockchainEnabled: dto.blockchainEnabled,

      auditEnabled: dto.auditEnabled,

      autoPublish: dto.autoPublish,

      autoArchive: dto.autoArchive,

      resultVisibility: dto.resultVisibility,

      banner: dto.banner,

      logo: dto.logo,

      createdBy: createdById
        ? {
            connect: {
              id: createdById,
            },
          }
        : undefined,
    });

    // =====================================================
    // Step 5 - Return Created Election
    // =====================================================

    return election;
  }
}
