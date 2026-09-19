import { NotFoundException } from '@nestjs/common';

import { VerifyReceiptService } from './verify-receipt.service';

describe('VerifyReceiptService', () => {
  let service: VerifyReceiptService;

  const mockPrisma = { voteReceipt: { findFirst: jest.fn() } };

  const receipt = {
    receiptNumber: 'BT-ABCDEF123456',
    createdAt: new Date('2026-03-01T10:00:00.000Z'),
    verificationHash: 'hash-1',
    vote: {
      createdAt: new Date('2026-03-01T10:00:00.000Z'),
      hash: 'hash-1',
      election: { id: 'e-1', title: 'Student Council', electionCode: 'SC26' },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new VerifyReceiptService(mockPrisma as any);
  });

  it('confirms a vote was recorded', async () => {
    mockPrisma.voteReceipt.findFirst.mockResolvedValue(receipt);

    const result = await service.execute('code-1');

    expect(result.verified).toBe(true);
    expect(result.election).toEqual(receipt.vote.election);
    expect(result.ledgerHash).toBe('hash-1');
  });

  it('never reveals which candidate was voted for', async () => {
    mockPrisma.voteReceipt.findFirst.mockResolvedValue(receipt);

    const result = await service.execute('code-1');

    // A receipt is held by the voter. Echoing their choice back against
    // a code they can show to someone else would make the receipt proof
    // of how they voted — the basis for coercion and vote-buying.
    expect(JSON.stringify(result)).not.toContain('candidate');
    expect(result).not.toHaveProperty('candidateId');
  });

  it('does not select the candidate from the database at all', async () => {
    mockPrisma.voteReceipt.findFirst.mockResolvedValue(receipt);

    await service.execute('code-1');

    const args = mockPrisma.voteReceipt.findFirst.mock.calls[0][0] as {
      select: Record<string, unknown>;
    };

    expect(JSON.stringify(args.select)).not.toContain('candidate');
  });

  it('never exposes the anonymous token that links to the ledger row', async () => {
    mockPrisma.voteReceipt.findFirst.mockResolvedValue(receipt);

    await service.execute('code-1');

    const args = mockPrisma.voteReceipt.findFirst.mock.calls[0][0] as {
      select: Record<string, unknown>;
    };

    expect(JSON.stringify(args.select)).not.toContain('anonymousToken');
  });

  it('accepts a receipt number or ledger hash as well as the code', async () => {
    mockPrisma.voteReceipt.findFirst.mockResolvedValue(receipt);

    await service.execute('BT-ABCDEF123456');

    const args = mockPrisma.voteReceipt.findFirst.mock.calls[0][0] as {
      where: { OR: Record<string, string>[] };
    };

    expect(args.where.OR).toHaveLength(3);
  });

  it('404s for an unknown code', async () => {
    mockPrisma.voteReceipt.findFirst.mockResolvedValue(null);

    await expect(service.execute('nope')).rejects.toThrow(NotFoundException);
  });
});
