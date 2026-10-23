import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';

import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { VoteService } from './../src/modules/vote/vote.service';
import { BlockchainService } from './../src/modules/blockchain/blockchain.service';

/**
 * Verifies the real, actual guarantees of the vote-integrity mechanism
 * against a real (disposable, local) Postgres database — not mocks
 * (BT-TEST-002 in docs/PROJECT_COMPLETION_LEDGER.md).
 *
 * What this mechanism IS: a per-election, database-backed SHA-256 hash
 * chain (see blockchain.service.ts) that lets a reviewer detect after the
 * fact whether a stored Vote row or its ordering was altered.
 *
 * What this mechanism IS NOT: a distributed/decentralized blockchain. There
 * is one database of record; verifyChain() detects tampering with what is
 * stored there, it does not provide Byzantine fault tolerance, consensus
 * across independent nodes, or protection against someone with direct
 * database write access who also recomputes and rewrites every hash after
 * their tampering (a chain only proves internal consistency, not that the
 * stored history is the true history held somewhere else too).
 *
 * Candidate/election/voter setup goes through Prisma directly rather than
 * the full nomination/ballot pipeline — that pipeline is exercised in
 * test/election.e2e-spec.ts (BT-TEST-001) and is not what this file is
 * testing.
 */
describe('Vote integrity (e2e)', () => {
  let moduleRef: TestingModule;
  let prisma: PrismaService;
  let voteService: VoteService;
  let blockchainService: BlockchainService;

  const suffix = Date.now();
  let electionId: string;
  let candidateId: string;
  const voterIds: string[] = [];

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    voteService = moduleRef.get(VoteService);
    blockchainService = moduleRef.get(BlockchainService);

    const candidateUser = await prisma.user.create({
      data: {
        fullName: 'E2E Integrity Candidate',
        email: `e2e-integrity-candidate-${suffix}@example.com`,
        password: 'unused',
        role: Role.CANDIDATE,
        status: 'APPROVED',
        emailVerified: true,
        provider: 'LOCAL',
      },
    });

    const election = await prisma.election.create({
      data: {
        title: 'E2E Vote Integrity Election',
        electionCode: `E2E-INTEGRITY-${suffix}`,
        electionType: 'STUDENT_COUNCIL',
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 60_000),
        endDate: new Date(Date.now() + 86_400_000),
      },
    });
    electionId = election.id;

    const candidate = await prisma.candidate.create({
      data: {
        electionId,
        userId: candidateUser.id,
        status: 'APPROVED',
      },
    });
    candidateId = candidate.id;
  });

  afterAll(async () => {
    await prisma.voteReceipt.deleteMany({
      where: { vote: { electionId } },
    });
    await prisma.vote.deleteMany({ where: { electionId } });
    await prisma.voterCredential.deleteMany({ where: { electionId } });
    await prisma.candidate.deleteMany({ where: { electionId } });
    await prisma.election.deleteMany({ where: { id: electionId } });
    await prisma.user.deleteMany({
      where: {
        id: { in: voterIds },
      },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: `e2e-integrity` } },
    });
    await moduleRef.close();
  });

  async function createApprovedVoter(label: string) {
    const voter = await prisma.user.create({
      data: {
        fullName: `E2E Integrity Voter ${label}`,
        email: `e2e-integrity-voter-${label}-${suffix}@example.com`,
        password: 'unused',
        role: Role.VOTER,
        status: 'APPROVED',
        emailVerified: true,
        provider: 'LOCAL',
      },
    });
    voterIds.push(voter.id);
    return voter.id;
  }

  it('rejects a second concurrent vote from the same voter (no duplicate-vote race)', async () => {
    const voterId = await createApprovedVoter('race');

    const attempts = await Promise.allSettled([
      voteService.castVote(voterId, { electionId, candidateId }),
      voteService.castVote(voterId, { electionId, candidateId }),
    ]);

    const fulfilled = attempts.filter((a) => a.status === 'fulfilled');
    const rejected = attempts.filter((a) => a.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const votesForVoter = await prisma.voterCredential.findUnique({
      where: { userId_electionId: { userId: voterId, electionId } },
    });
    expect(votesForVoter?.hasVoted).toBe(true);

    const totalVotes = await prisma.vote.count({ where: { electionId } });
    expect(totalVotes).toBe(1);
  });

  it('extends a verifiable hash chain as more votes are cast', async () => {
    const voterId = await createApprovedVoter('chain-2');

    await voteService.castVote(voterId, { electionId, candidateId });

    const result = await blockchainService.verifyChain(electionId);

    expect(result.valid).toBe(true);
    expect(result.totalVotes).toBe(2);
  });

  it('detects tampering with a stored vote row', async () => {
    const vote = await prisma.vote.findFirstOrThrow({
      where: { electionId },
      orderBy: { createdAt: 'asc' },
    });

    // Simulates direct database tampering with the stored anonymous token
    // (the voter's one-time pseudonym for this vote) without recomputing
    // the hash that is supposed to attest to it — exactly what the chain
    // exists to catch. (An attacker who also recomputes every downstream
    // hash after tampering would not be caught by this alone; see the
    // file-level comment on what this mechanism does and does not
    // guarantee.)
    await prisma.vote.update({
      where: { id: vote.id },
      data: { anonymousToken: 'tampered-token-does-not-match-stored-hash' },
    });

    const result = await blockchainService.verifyChain(electionId);

    expect(result.valid).toBe(false);
    expect(result.message).toContain('Hash mismatch');
  });
});
