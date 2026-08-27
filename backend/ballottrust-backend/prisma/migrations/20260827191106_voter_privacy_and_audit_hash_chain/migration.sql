-- Sec11 (privacy-preserving voting) + Sec22/23 (tamper-evident audit chain)
--
-- Written by hand (not `prisma migrate dev`, which requires an interactive
-- terminal) so that it stays safe against existing data: the naive
-- "ADD COLUMN anonymousToken TEXT NOT NULL" that a raw schema diff would
-- produce fails immediately on any Vote rows that already exist. Instead we
-- add nullable, backfill, then tighten to NOT NULL + UNIQUE.

-- gen_random_uuid()/gen_random_bytes() below require pgcrypto.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================================
-- AuditLog: tamper-evident hash-chain columns (additive, safe)
-- =====================================================================
ALTER TABLE "AuditLog" ADD COLUMN     "hash" TEXT,
ADD COLUMN     "previousHash" TEXT,
ADD COLUMN     "result" TEXT;

CREATE INDEX "AuditLog_hash_idx" ON "AuditLog"("hash");

-- =====================================================================
-- VoterCredential: new eligibility/credential store, structurally
-- separate from the Vote ledger (records ONLY whether a voter has used
-- their single credential for an election, never which candidate).
-- =====================================================================
CREATE TABLE "VoterCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "hasVoted" BOOLEAN NOT NULL DEFAULT false,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "VoterCredential_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VoterCredential_electionId_idx" ON "VoterCredential"("electionId");
CREATE UNIQUE INDEX "VoterCredential_userId_electionId_key" ON "VoterCredential"("userId", "electionId");

ALTER TABLE "VoterCredential" ADD CONSTRAINT "VoterCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VoterCredential" ADD CONSTRAINT "VoterCredential_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: for every existing Vote, synthesize a "used" credential row so
-- historical one-vote-per-election guarantees are preserved after voterId
-- is dropped from Vote below. This is the one place old data legitimately
-- still links a voterId to the fact-of-voting (not to the choice) --
-- consistent with the new architecture, since VoterCredential is exactly
-- that eligibility/fact-of-voting store.
INSERT INTO "VoterCredential" ("id", "userId", "electionId", "hasVoted", "issuedAt", "usedAt")
SELECT gen_random_uuid()::text, "voterId", "electionId", true, "createdAt", "createdAt"
FROM "Vote"
ON CONFLICT ("userId", "electionId") DO NOTHING;

-- =====================================================================
-- Vote: drop the direct voter identity link, add the anonymous token
-- =====================================================================
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_voterId_fkey";
DROP INDEX "Vote_voterId_electionId_key";
DROP INDEX "Vote_voterId_idx";

ALTER TABLE "Vote" ADD COLUMN     "anonymousToken" TEXT;

-- Backfill existing rows with a random, non-reversible token (not derived
-- from voterId) before dropping voterId and enforcing NOT NULL/UNIQUE.
UPDATE "Vote" SET "anonymousToken" = encode(gen_random_bytes(32), 'hex') WHERE "anonymousToken" IS NULL;

ALTER TABLE "Vote" ALTER COLUMN "anonymousToken" SET NOT NULL;
ALTER TABLE "Vote" DROP COLUMN "voterId";

CREATE UNIQUE INDEX "Vote_anonymousToken_key" ON "Vote"("anonymousToken");
