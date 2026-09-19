-- CreateEnum
CREATE TYPE "VoterRegistrationStatus" AS ENUM ('PENDING', 'VERIFIED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VoterRegistrationSource" AS ENUM ('SELF', 'IMPORT', 'ADMIN');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'VERIFICATION_OFFICER';
ALTER TYPE "Role" ADD VALUE 'RETURNING_OFFICER';

-- CreateTable
CREATE TABLE "VoterRegistration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "status" "VoterRegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "source" "VoterRegistrationSource" NOT NULL DEFAULT 'SELF',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedById" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VoterRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VoterRegistration_electionId_status_idx" ON "VoterRegistration"("electionId", "status");

-- CreateIndex
CREATE INDEX "VoterRegistration_userId_idx" ON "VoterRegistration"("userId");

-- CreateIndex
CREATE INDEX "VoterRegistration_status_idx" ON "VoterRegistration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "VoterRegistration_userId_electionId_key" ON "VoterRegistration"("userId", "electionId");

-- AddForeignKey
ALTER TABLE "VoterRegistration" ADD CONSTRAINT "VoterRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterRegistration" ADD CONSTRAINT "VoterRegistration_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterRegistration" ADD CONSTRAINT "VoterRegistration_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterRegistration" ADD CONSTRAINT "VoterRegistration_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterRegistration" ADD CONSTRAINT "VoterRegistration_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
