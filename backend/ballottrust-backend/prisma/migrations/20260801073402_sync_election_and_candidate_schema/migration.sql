/*
  Warnings:

  - The values [CLOSED] on the enum `ElectionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bio` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `registrationNumber` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedAt` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedById` on the `Candidate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,electionId]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[electionId,candidateNumber]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[electionCode]` on the table `Election` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `Candidate` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `electionCode` to the `Election` table without a default value. This is not possible if the table is not empty.
  - Added the required column `electionType` to the `Election` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ElectionType" AS ENUM ('STUDENT_COUNCIL', 'CLUB', 'UNIVERSITY', 'CORPORATE', 'GOVERNMENT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ResultVisibility" AS ENUM ('IMMEDIATE', 'AFTER_CLOSURE', 'MANUAL');

-- CreateEnum
CREATE TYPE "CandidateType" AS ENUM ('INDEPENDENT', 'PARTY');

-- CreateEnum
CREATE TYPE "PartyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CandidateStatus" ADD VALUE 'VERIFIED';
ALTER TYPE "CandidateStatus" ADD VALUE 'DISQUALIFIED';

-- AlterEnum
BEGIN;
CREATE TYPE "ElectionStatus_new" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'ACTIVE', 'VOTING_CLOSED', 'RESULT_PUBLISHED', 'ARCHIVED');
ALTER TABLE "public"."Election" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Election" ALTER COLUMN "status" TYPE "ElectionStatus_new" USING ("status"::text::"ElectionStatus_new");
ALTER TYPE "ElectionStatus" RENAME TO "ElectionStatus_old";
ALTER TYPE "ElectionStatus_new" RENAME TO "ElectionStatus";
DROP TYPE "public"."ElectionStatus_old";
ALTER TABLE "Election" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_reviewedById_fkey";

-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_userId_fkey";

-- DropIndex
DROP INDEX "Candidate_department_idx";

-- DropIndex
DROP INDEX "Candidate_position_idx";

-- DropIndex
DROP INDEX "Candidate_userId_key";

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "bio",
DROP COLUMN "department",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "registrationNumber",
DROP COLUMN "reviewedAt",
DROP COLUMN "reviewedById",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "candidateNumber" INTEGER,
ADD COLUMN     "candidateType" "CandidateType" NOT NULL DEFAULT 'INDEPENDENT',
ADD COLUMN     "disqualificationReason" TEXT,
ADD COLUMN     "disqualifiedAt" TIMESTAMP(3),
ADD COLUMN     "nominationStatement" TEXT,
ADD COLUMN     "partyId" TEXT,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedById" TEXT,
ADD COLUMN     "withdrawalReason" TEXT,
ADD COLUMN     "withdrawnAt" TIMESTAMP(3),
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Election" ADD COLUMN     "allowRevote" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "auditEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "autoArchive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "autoPublish" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "banner" TEXT,
ADD COLUMN     "blockchainEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "campaignEnd" TIMESTAMP(3),
ADD COLUMN     "campaignStart" TIMESTAMP(3),
ADD COLUMN     "candidateLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "electionCode" TEXT NOT NULL,
ADD COLUMN     "electionType" "ElectionType" NOT NULL,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "maximumVotes" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "nominationEnd" TIMESTAMP(3),
ADD COLUMN     "nominationStart" TIMESTAMP(3),
ADD COLUMN     "publishedById" TEXT,
ADD COLUMN     "registrationEnd" TIMESTAMP(3),
ADD COLUMN     "registrationStart" TIMESTAMP(3),
ADD COLUMN     "resultDate" TIMESTAMP(3),
ADD COLUMN     "resultVisibility" "ResultVisibility" NOT NULL DEFAULT 'AFTER_CLOSURE',
ALTER COLUMN "description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "abbreviation" TEXT,
    "symbol" TEXT,
    "logo" TEXT,
    "color" TEXT,
    "description" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "foundedOn" TIMESTAMP(3),
    "headquarters" TEXT,
    "status" "PartyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Party_status_idx" ON "Party"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Party_name_key" ON "Party"("name");

-- CreateIndex
CREATE INDEX "Candidate_candidateType_idx" ON "Candidate"("candidateType");

-- CreateIndex
CREATE INDEX "Candidate_partyId_idx" ON "Candidate"("partyId");

-- CreateIndex
CREATE INDEX "Candidate_userId_idx" ON "Candidate"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_userId_electionId_key" ON "Candidate"("userId", "electionId");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_electionId_candidateNumber_key" ON "Candidate"("electionId", "candidateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Election_electionCode_key" ON "Election"("electionCode");

-- CreateIndex
CREATE INDEX "Election_electionCode_idx" ON "Election"("electionCode");

-- AddForeignKey
ALTER TABLE "Election" ADD CONSTRAINT "Election_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Election" ADD CONSTRAINT "Election_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
