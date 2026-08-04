-- AlterTable
ALTER TABLE "Election" ADD COLUMN     "ballotFinalizedAt" TIMESTAMP(3),
ADD COLUMN     "ballotFinalizedById" TEXT;

-- CreateIndex
CREATE INDEX "Election_ballotFinalizedById_idx" ON "Election"("ballotFinalizedById");

-- AddForeignKey
ALTER TABLE "Election" ADD CONSTRAINT "Election_ballotFinalizedById_fkey" FOREIGN KEY ("ballotFinalizedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
