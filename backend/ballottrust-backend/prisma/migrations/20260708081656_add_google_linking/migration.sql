-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "googleLinked" BOOLEAN NOT NULL DEFAULT false;
