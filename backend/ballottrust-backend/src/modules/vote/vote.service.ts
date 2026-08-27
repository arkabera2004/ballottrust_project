import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { AuditService } from '../audit/audit.service';

import * as crypto from 'crypto';

@Injectable()
export class VoteService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Casts a vote while preserving the identity/vote separation boundary
   * (Sec11): the Vote ledger row never carries the voter's identity — only
   * a one-time anonymous token generated here and thrown away by the
   * caller. Eligibility/one-vote-per-election enforcement lives entirely
   * in VoterCredential, a structurally separate table.
   *
   * The credential check-and-consume plus the vote insert happen inside a
   * single transaction so a duplicate-vote race (two concurrent requests
   * for the same voter+election) can't slip past the check: the second
   * writer's conditional update matches zero rows and is rejected, backed
   * by row-level locking rather than a check-then-insert gap.
   *
   * Audit records deliberately capture only userId + electionId (the fact
   * that a voter voted), never candidateId — logging the choice next to
   * the voter's identity would recreate exactly the joinable link Sec11
   * forbids, even though Vote itself stays anonymous.
   */
  async castVote(
    userId: string,
    data: CreateVoteDto,
  ) {
    try {
      const vote = await this.castVoteInternal(userId, data);

      await this.auditService.log({
        userId,
        action: 'VOTE_CAST',
        module: 'vote',
        entityType: 'Election',
        entityId: data.electionId,
        result: 'SUCCESS',
      });

      return vote;
    } catch (err) {
      await this.auditService.log({
        userId,
        action: 'VOTE_CAST_REJECTED',
        module: 'vote',
        entityType: 'Election',
        entityId: data.electionId,
        result: 'FAILURE',
        description:
          err instanceof Error ? err.message : 'Unknown error',
      });

      throw err;
    }
  }

  private async castVoteInternal(
    userId: string,
    data: CreateVoteDto,
  ) {
    const candidate =
      await this.prisma.candidate.findUnique({
        where: {
          id: data.candidateId,
        },
      });

    if (
      !candidate ||
      candidate.electionId !== data.electionId ||
      candidate.status !== 'APPROVED'
    ) {
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

    return this.prisma.$transaction(async (tx) => {
      // Issue (or reuse) this voter's single credential for the election.
      // Never records a candidate choice — only whether it has been used.
      const credential = await tx.voterCredential.upsert({
        where: {
          userId_electionId: {
            userId,
            electionId: data.electionId,
          },
        },
        update: {},
        create: {
          userId,
          electionId: data.electionId,
        },
      });

      if (credential.hasVoted) {
        throw new BadRequestException(
          'You have already voted',
        );
      }

      // Conditional update: only succeeds if hasVoted is still false at
      // the DB row level. A concurrent duplicate request loses this race
      // and matches zero rows instead of racing past the check above.
      const consumed = await tx.voterCredential.updateMany({
        where: {
          id: credential.id,
          hasVoted: false,
        },
        data: {
          hasVoted: true,
          usedAt: new Date(),
        },
      });

      if (consumed.count === 0) {
        throw new BadRequestException(
          'You have already voted',
        );
      }

      // Non-reversible anonymous token — not derived from userId, so the
      // resulting Vote row cannot be traced back to the voter.
      const anonymousToken = crypto
        .randomBytes(32)
        .toString('hex');

      // Hash chain is scoped per-election: each election's vote ledger is
      // an independent chain anchored at its own genesis block.
      const lastVote =
        await tx.vote.findFirst({
          where: {
            electionId: data.electionId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

      const previousHash =
        lastVote?.hash || 'GENESIS_BLOCK';

      const hash = crypto
        .createHash('sha256')
        .update(
          anonymousToken +
          data.candidateId +
          data.electionId +
          previousHash,
        )
        .digest('hex');

      return tx.vote.create({
        data: {
          anonymousToken,
          candidateId: data.candidateId,
          electionId: data.electionId,
          hash,
          previousHash,
        },
      });
    });
  }
}
