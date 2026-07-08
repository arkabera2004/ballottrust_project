import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateElectionDto } from './dto/create-election.dto';

@Injectable()
export class ElectionService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createElection(data: CreateElectionDto) {
    return this.prisma.election.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
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
        status: 'CLOSED',
      },
    });
  }
}

