/*
  Warnings:

  - The `blockNumber` column on the `BlockchainTransaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `BlockchainTransaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `reviewedBy` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `isTwoFactorEnabled` on the `User` table. All the data in the column will be lost.
  - The `provider` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[transactionHash]` on the table `BlockchainTransaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[verificationCode]` on the table `VoteReceipt` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `BlockchainTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'SECURITY');

-- CreateEnum
CREATE TYPE "public"."AuditSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."BlockchainStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."CandidateStatus" ADD VALUE 'PENDING';
ALTER TYPE "public"."CandidateStatus" ADD VALUE 'WITHDRAWN';

-- AlterEnum
ALTER TYPE "public"."ElectionStatus" ADD VALUE 'ARCHIVED';

-- DropForeignKey
ALTER TABLE "public"."Candidate" DROP CONSTRAINT "Candidate_electionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vote" DROP CONSTRAINT "Vote_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vote" DROP CONSTRAINT "Vote_electionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vote" DROP CONSTRAINT "Vote_voterId_fkey";

-- AlterTable
ALTER TABLE "public"."AuditLog" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "entityType" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "operatingSystem" TEXT,
ADD COLUMN     "severity" "public"."AuditSeverity" NOT NULL DEFAULT 'LOW';

-- AlterTable
ALTER TABLE "public"."BlockchainTransaction" ADD COLUMN     "blockHash" TEXT,
ADD COLUMN     "chainId" TEXT,
ADD COLUMN     "confirmations" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "contractAddress" TEXT,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "explorerUrl" TEXT,
ADD COLUMN     "gasPrice" TEXT,
ADD COLUMN     "gasUsed" TEXT,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "transactionFee" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verificationTime" TIMESTAMP(3),
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "blockNumber",
ADD COLUMN     "blockNumber" BIGINT,
ALTER COLUMN "network" SET DEFAULT 'Polygon Amoy',
DROP COLUMN "status",
ADD COLUMN     "status" "public"."BlockchainStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."Candidate" DROP COLUMN "reviewedBy",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "public"."Election" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "actionLabel" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "link" TEXT,
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "type" "public"."NotificationType" NOT NULL DEFAULT 'INFO';

-- AlterTable
ALTER TABLE "public"."RefreshToken" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "operatingSystem" TEXT;

-- AlterTable
ALTER TABLE "public"."Session" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "lastActive" TIMESTAMP(3),
ADD COLUMN     "operatingSystem" TEXT,
ADD COLUMN     "trusted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "isTwoFactorEnabled",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "course" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "lastPasswordChange" TIMESTAMP(3),
ADD COLUMN     "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mfaSecret" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "semester" INTEGER,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "year" INTEGER,
DROP COLUMN "provider",
ADD COLUMN     "provider" "public"."AuthProvider" NOT NULL DEFAULT 'LOCAL';

-- AlterTable
ALTER TABLE "public"."Vote" ADD COLUMN     "encryptedVote" TEXT,
ADD COLUMN     "signature" TEXT;

-- AlterTable
ALTER TABLE "public"."VoteReceipt" ADD COLUMN     "downloaded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "downloadedAt" TIMESTAMP(3),
ADD COLUMN     "downloadedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pdfUrl" TEXT,
ADD COLUMN     "qrCodeUrl" TEXT,
ADD COLUMN     "verificationHash" TEXT;

-- CreateTable
CREATE TABLE "public"."ElectionReport" (
    "id" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "reportName" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "generatedById" TEXT,
    "fileUrl" TEXT,
    "fileSize" TEXT,
    "format" TEXT,
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ElectionReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DashboardMetric" (
    "id" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricValue" DOUBLE PRECISION NOT NULL,
    "category" TEXT,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "electionId" TEXT,

    CONSTRAINT "DashboardMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ElectionReport_electionId_idx" ON "public"."ElectionReport"("electionId");

-- CreateIndex
CREATE INDEX "ElectionReport_generatedById_idx" ON "public"."ElectionReport"("generatedById");

-- CreateIndex
CREATE INDEX "DashboardMetric_metricName_idx" ON "public"."DashboardMetric"("metricName");

-- CreateIndex
CREATE INDEX "DashboardMetric_calculatedAt_idx" ON "public"."DashboardMetric"("calculatedAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_module_idx" ON "public"."AuditLog"("module");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "public"."AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_severity_idx" ON "public"."AuditLog"("severity");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainTransaction_transactionHash_key" ON "public"."BlockchainTransaction"("transactionHash");

-- CreateIndex
CREATE INDEX "BlockchainTransaction_status_idx" ON "public"."BlockchainTransaction"("status");

-- CreateIndex
CREATE INDEX "BlockchainTransaction_network_idx" ON "public"."BlockchainTransaction"("network");

-- CreateIndex
CREATE INDEX "BlockchainTransaction_createdAt_idx" ON "public"."BlockchainTransaction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_userId_key" ON "public"."Candidate"("userId");

-- CreateIndex
CREATE INDEX "Candidate_status_idx" ON "public"."Candidate"("status");

-- CreateIndex
CREATE INDEX "Candidate_department_idx" ON "public"."Candidate"("department");

-- CreateIndex
CREATE INDEX "Candidate_position_idx" ON "public"."Candidate"("position");

-- CreateIndex
CREATE INDEX "Candidate_electionId_idx" ON "public"."Candidate"("electionId");

-- CreateIndex
CREATE INDEX "Election_status_idx" ON "public"."Election"("status");

-- CreateIndex
CREATE INDEX "Election_startDate_idx" ON "public"."Election"("startDate");

-- CreateIndex
CREATE INDEX "Election_endDate_idx" ON "public"."Election"("endDate");

-- CreateIndex
CREATE INDEX "Election_createdById_idx" ON "public"."Election"("createdById");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "public"."Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "public"."Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "public"."Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- CreateIndex
CREATE INDEX "RefreshToken_revoked_idx" ON "public"."RefreshToken"("revoked");

-- CreateIndex
CREATE INDEX "RefreshToken_tokenVersion_idx" ON "public"."RefreshToken"("tokenVersion");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE INDEX "Session_revoked_idx" ON "public"."Session"("revoked");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "public"."Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Session_trusted_idx" ON "public"."Session"("trusted");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "public"."User"("status");

-- CreateIndex
CREATE INDEX "User_provider_idx" ON "public"."User"("provider");

-- CreateIndex
CREATE INDEX "User_department_idx" ON "public"."User"("department");

-- CreateIndex
CREATE INDEX "User_registrationNumber_idx" ON "public"."User"("registrationNumber");

-- CreateIndex
CREATE INDEX "User_emailVerified_idx" ON "public"."User"("emailVerified");

-- CreateIndex
CREATE INDEX "User_failedLoginAttempts_idx" ON "public"."User"("failedLoginAttempts");

-- CreateIndex
CREATE INDEX "Vote_voterId_idx" ON "public"."Vote"("voterId");

-- CreateIndex
CREATE INDEX "Vote_candidateId_idx" ON "public"."Vote"("candidateId");

-- CreateIndex
CREATE INDEX "Vote_electionId_idx" ON "public"."Vote"("electionId");

-- CreateIndex
CREATE INDEX "Vote_hash_idx" ON "public"."Vote"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "VoteReceipt_verificationCode_key" ON "public"."VoteReceipt"("verificationCode");

-- CreateIndex
CREATE INDEX "VoteReceipt_receiptNumber_idx" ON "public"."VoteReceipt"("receiptNumber");

-- CreateIndex
CREATE INDEX "VoteReceipt_verificationCode_idx" ON "public"."VoteReceipt"("verificationCode");

-- AddForeignKey
ALTER TABLE "public"."Election" ADD CONSTRAINT "Election_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Candidate" ADD CONSTRAINT "Candidate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Candidate" ADD CONSTRAINT "Candidate_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Candidate" ADD CONSTRAINT "Candidate_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "public"."Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "public"."Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ElectionReport" ADD CONSTRAINT "ElectionReport_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ElectionReport" ADD CONSTRAINT "ElectionReport_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "public"."Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DashboardMetric" ADD CONSTRAINT "DashboardMetric_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "public"."Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;
