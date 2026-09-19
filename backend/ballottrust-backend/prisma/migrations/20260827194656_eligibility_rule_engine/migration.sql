-- Sec4: Dynamic Voter Eligibility Engine
--
-- Two new, purely additive tables (no existing columns touched, no
-- backfill needed) — hand-written for the same reason as the previous
-- migration: `prisma migrate dev` requires an interactive terminal, which
-- isn't available here. Diff-verified against a live database with
-- `prisma migrate diff` before being committed.

-- =====================================================================
-- EligibilityRuleSet: versioned AND/OR/NOT rule tree per election.
-- =====================================================================
CREATE TABLE "EligibilityRuleSet" (
    "id" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "rule" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EligibilityRuleSet_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EligibilityRuleSet_electionId_isActive_idx" ON "EligibilityRuleSet"("electionId", "isActive");
CREATE UNIQUE INDEX "EligibilityRuleSet_electionId_version_key" ON "EligibilityRuleSet"("electionId", "version");

ALTER TABLE "EligibilityRuleSet" ADD CONSTRAINT "EligibilityRuleSet_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EligibilityRuleSet" ADD CONSTRAINT "EligibilityRuleSet_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =====================================================================
-- VoterEligibilitySnapshot: persisted evaluation result + explanation.
-- =====================================================================
CREATE TABLE "VoterEligibilitySnapshot" (
    "id" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ruleSetId" TEXT,
    "eligible" BOOLEAN NOT NULL,
    "explanation" JSONB NOT NULL,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoterEligibilitySnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VoterEligibilitySnapshot_electionId_userId_idx" ON "VoterEligibilitySnapshot"("electionId", "userId");
CREATE INDEX "VoterEligibilitySnapshot_ruleSetId_idx" ON "VoterEligibilitySnapshot"("ruleSetId");

ALTER TABLE "VoterEligibilitySnapshot" ADD CONSTRAINT "VoterEligibilitySnapshot_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VoterEligibilitySnapshot" ADD CONSTRAINT "VoterEligibilitySnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VoterEligibilitySnapshot" ADD CONSTRAINT "VoterEligibilitySnapshot_ruleSetId_fkey" FOREIGN KEY ("ruleSetId") REFERENCES "EligibilityRuleSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
