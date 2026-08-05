-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "disqualifiedById" TEXT,
ADD COLUMN     "rejectedById" TEXT;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_disqualifiedById_fkey" FOREIGN KEY ("disqualifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
