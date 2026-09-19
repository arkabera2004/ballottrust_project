import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Confirms that a vote bearing this verification code was recorded.
 *
 * The response deliberately reveals nothing beyond that fact and which
 * election it belonged to. In particular it never returns the candidate:
 * a receipt is held by the voter, so echoing their choice back against a
 * code they can show to someone else would turn the receipt into proof
 * of how they voted — exactly what the Sec11 identity/vote separation
 * exists to prevent, and the mechanism coercion and vote-buying rely on.
 */
@Injectable()
export class VerifyReceiptService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(code: string) {
    const receipt = await this.prisma.voteReceipt.findFirst({
      where: {
        OR: [
          { verificationCode: code },
          { receiptNumber: code },
          { verificationHash: code },
        ],
      },
      select: {
        receiptNumber: true,
        createdAt: true,
        verificationHash: true,
        vote: {
          select: {
            createdAt: true,
            hash: true,
            election: {
              select: { id: true, title: true, electionCode: true },
            },
          },
        },
      },
    });

    if (!receipt) {
      throw new NotFoundException(
        'No vote was found for that verification code.',
      );
    }

    return {
      verified: true,
      receiptNumber: receipt.receiptNumber,
      issuedAt: receipt.createdAt,
      recordedAt: receipt.vote.createdAt,
      election: receipt.vote.election,
      /** Ledger hash, so the entry can be located in a published audit. */
      ledgerHash: receipt.vote.hash,
    };
  }
}
