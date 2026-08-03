/*
  Warnings:

  - A unique constraint covering the columns `[electionId,ballotOrder]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "ballotOrder" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_electionId_ballotOrder_key" ON "Candidate"("electionId", "ballotOrder");
