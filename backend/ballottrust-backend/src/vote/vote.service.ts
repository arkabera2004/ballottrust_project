import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateVoteDto } from './dto/create-vote.dto';

import * as CryptoJS from 'crypto-js';

@Injectable()
export class VoteService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async castVote(
    userId: string,
    data: CreateVoteDto,
  ) {
    const candidate =
      await this.prisma.candidate.findUnique({
        where: {
          id: data.candidateId,
        },
      });

    if (!candidate) {
      throw new BadRequestException(
        'Candidate not found',
      );
    }

    const election =
      await this.prisma.election.findUnique({
        where: {
          id: data.electionId,
        },
      });

    if (!election) {
      throw new BadRequestException(
        'Election not found',
      );
    }

    if (election.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Election is not active',
      );
    }

    const existingVote =
      await this.prisma.vote.findFirst({
        where: {
          voterId: userId,
          electionId: data.electionId,
        },
      });

    if (existingVote) {
      throw new BadRequestException(
        'You have already voted',
      );
    }

    const lastVote =
      await this.prisma.vote.findFirst({
        orderBy: {
          createdAt: 'desc',
        },
      });

    const previousHash =
      lastVote?.hash || 'GENESIS_BLOCK';

    const hash = CryptoJS.SHA256(
      userId +
      data.candidateId +
      data.electionId +
      previousHash,
    ).toString();

    return this.prisma.vote.create({
      data: {
        voterId: userId,
        candidateId: data.candidateId,
        electionId: data.electionId,
        hash,
        previousHash,
      },
    });
  }
}
