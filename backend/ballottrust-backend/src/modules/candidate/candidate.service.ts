import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';


@Injectable()
export class CandidateService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(data: CreateCandidateDto) {
    return this.prisma.candidate.create({
      data,
    });
  }

  async findAll() {
  return this.prisma.candidate.findMany({
    where: {
      status: 'APPROVED',
    },
    include: {
      election: true,
    },
  });
}

  async approve(id: string) {
    return this.prisma.candidate.update({
      where: {
        id,
      },
      data: {
        status: 'APPROVED',
      },
    });
  }

  async reject(id: string) {
    return this.prisma.candidate.update({
      where: {
        id,
      },
      data: {
        status: 'REJECTED',
      },
    });
  }

  async getPendingCandidates() {
  return this.prisma.candidate.findMany({
    where: {
      status: 'DRAFT',
    },
    include: {
      election: true,
    },
  });
}
}
