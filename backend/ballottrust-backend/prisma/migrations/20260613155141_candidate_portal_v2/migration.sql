/*
  Warnings:

  - The values [PENDING,WITHDRAWN] on the enum `CandidateStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [SUSPENDED] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `approvedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `approvedBy` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."CandidateStatus_new" AS ENUM ('DRAFT', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."Candidate" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Candidate" ALTER COLUMN "status" TYPE "public"."CandidateStatus_new" USING ("status"::text::"public"."CandidateStatus_new");
ALTER TYPE "public"."CandidateStatus" RENAME TO "CandidateStatus_old";
ALTER TYPE "public"."CandidateStatus_new" RENAME TO "CandidateStatus";
DROP TYPE "public"."CandidateStatus_old";
ALTER TABLE "public"."Candidate" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."User" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "status" TYPE "public"."UserStatus_new" USING ("status"::text::"public"."UserStatus_new");
ALTER TYPE "public"."UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "public"."UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "public"."User" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "approvedAt",
DROP COLUMN "approvedBy",
DROP COLUMN "googleId",
DROP COLUMN "phoneNumber";
