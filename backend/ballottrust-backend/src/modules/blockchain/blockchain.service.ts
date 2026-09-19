import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class BlockchainService {
  constructor(private prisma: PrismaService) {}

  /**
   * Recomputes and verifies the per-election vote hash chain. Scoped per
   * election (not globally) because vote.service.ts anchors each
   * election's chain at its own genesis block — chaining across unrelated
   * elections would make the "previousHash" comparison meaningless and
   * report false tamper positives whenever elections interleave in time.
   *
   * Uses anonymousToken rather than voterId (Sec11): the chain must be
   * verifiable without ever touching voter identity.
   */
  async verifyChain(electionId?: string) {
    const elections = electionId
      ? [{ id: electionId }]
      : await this.prisma.election.findMany({
          select: { id: true },
        });

    const results: {
      electionId: string;
      valid: boolean;
      message: string;
      totalVotes?: number;
    }[] = [];

    for (const { id } of elections) {
      const votes = await this.prisma.vote.findMany({
        where: {
          electionId: id,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (votes.length === 0) {
        results.push({
          electionId: id,
          valid: true,
          message: 'No votes found',
        });
        continue;
      }

      let valid = true;
      let message = 'Blockchain integrity verified';

      for (let i = 0; i < votes.length; i++) {
        const vote = votes[i];

        const expectedHash = crypto
          .createHash('sha256')
          .update(
            vote.anonymousToken +
              vote.candidateId +
              vote.electionId +
              vote.previousHash,
          )
          .digest('hex');

        if (vote.hash !== expectedHash) {
          valid = false;
          message = `Hash mismatch at vote ${vote.id}`;
          break;
        }

        if (i > 0 && vote.previousHash !== votes[i - 1].hash) {
          valid = false;
          message = `Broken chain at vote ${vote.id}`;
          break;
        }
      }

      results.push({
        electionId: id,
        valid,
        message,
        totalVotes: votes.length,
      });
    }

    if (electionId) {
      return results[0];
    }

    return {
      valid: results.every((r) => r.valid),
      elections: results,
    };
  }
}
