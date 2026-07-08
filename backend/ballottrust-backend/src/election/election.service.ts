import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateElectionDto } from './dto/create-election.dto';

@Injectable()
export class ElectionService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createElection(dto: CreateElectionDto) {
    return this.prisma.election.create({
      data: {
        title: dto.title,
        electionCode: dto.electionCode,
        electionType: dto.electionType,
        description: dto.description,
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    });
  }

  async getAllElections() {
    return this.prisma.election.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async activateElection(id: string) {
    return this.prisma.election.update({
      where: { id },
      data: {
        status: 'ACTIVE',
      },
    });
  }

  async closeElection(id: string) {
    return this.prisma.election.update({
      where: { id },
      data: {
        status: 'VOTING_CLOSED',
      },
    });
  }
}

