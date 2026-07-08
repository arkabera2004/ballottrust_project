import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class BlockchainService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async verifyChain() {
    const votes =
      await this.prisma.vote.findMany({
        orderBy: {
          createdAt: 'asc',
        },
      });

    if (votes.length === 0) {
      return {
        valid: true,
        message: 'No votes found',
      };
    }

    for (let i = 0; i < votes.length; i++) {
      const vote = votes[i];

      const expectedHash = crypto
        .createHash('sha256')
        .update(
          vote.voterId +
          vote.candidateId +
          vote.electionId +
          vote.previousHash,
        )
        .digest('hex');

      if (vote.hash !== expectedHash) {
        return {
          valid: false,
          message: `Hash mismatch at vote ${vote.id}`,
        };
      }

      if (i > 0) {
        const previousVote =
          votes[i - 1];

        if (
          vote.previousHash !==
          previousVote.hash
        ) {
          return {
            valid: false,
            message:
              `Broken chain at vote ${vote.id}`,
          };
        }
      }
    }

    return {
      valid: true,
      message:
        'Blockchain integrity verified',
      totalVotes: votes.length,
    };
  }
}
