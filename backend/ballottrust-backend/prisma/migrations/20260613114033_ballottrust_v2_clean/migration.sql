/*
  Warnings:

  - The values [ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `updatedAt` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Election` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."CandidateStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('SUPER_ADMIN', 'ELECTION_COMMISSIONER', 'AUDITOR', 'CANDIDATE', 'VOTER');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'VOTER';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Candidate" ADD COLUMN     "achievements" TEXT,
ADD COLUMN     "agenda" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "documentUrl" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "registrationNumber" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "status" "public"."CandidateStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "manifesto" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Election" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "profilePhoto" TEXT,
ADD COLUMN     "registrationNumber" TEXT,
ADD COLUMN     "status" "public"."UserStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "studentIdCard" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
